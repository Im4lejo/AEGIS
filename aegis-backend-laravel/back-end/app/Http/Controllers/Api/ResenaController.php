<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Calificacion;
use App\Models\Encuentro;
use App\Models\PuntoFisico;
use App\Models\Usuario;
use App\Services\ReputacionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ResenaController extends Controller
{
    public function __construct(private ReputacionService $reputacion) {}

    public function eligible(Request $request)
    {
        $eligible = Encuentro::query()
            ->where(function ($q) use ($request): void {
                $q->where('comprador_id', $request->user()->id)
                    ->orWhere('vendedor_id', $request->user()->id);
            })
            ->where('estado', 'finalizado')
            ->where('finalizado_en', '>=', now()->subDays(30))
            ->with(['producto:id,titulo', 'puntoFisico:id,nombre'])
            ->orderByDesc('finalizado_en')
            ->limit(50)
            ->get()
            ->filter(function (Encuentro $meeting) use ($request): bool {
                $existing = Calificacion::query()
                    ->where('encuentro_id', $meeting->id)
                    ->where('autor_id', $request->user()->id)
                    ->where('estado', '!=', 'anulada')
                    ->exists();

                return ! $existing;
            })
            ->values();

        return response()->json(['data' => $eligible]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'encuentro_id' => ['required', 'integer', 'exists:encuentros,id'],
            'ambito' => ['required', 'in:vendedor,comprador,punto'],
            'puntuacion' => ['required', 'integer', 'min:1', 'max:5'],
            'comentario' => ['nullable', 'string', 'max:5000'],
        ]);

        $result = DB::transaction(function () use ($request, $validated) {
            $meeting = Encuentro::query()
                ->with('puntoFisico')
                ->lockForUpdate()
                ->findOrFail($validated['encuentro_id']);
            if ($meeting->estado !== 'finalizado'
                || ! $meeting->finalizado_en
                || $meeting->finalizado_en->lt(now()->subDays(30))
            ) {
                throw ValidationException::withMessages([
                    'encuentro_id' => ['La operación no está finalizada dentro del período elegible.'],
                ]);
            }
            $actorId = (int) $request->user()->id;
            $receiverId = match ($validated['ambito']) {
                'vendedor' => (int) $meeting->vendedor_id,
                'comprador' => (int) $meeting->comprador_id,
                'punto' => null,
            };

            if ($validated['ambito'] === 'punto') {
                if (! in_array($actorId, [(int) $meeting->comprador_id, (int) $meeting->vendedor_id], true)) {
                    abort(403, 'Solo participantes pueden evaluar el punto.');
                }
                $receiverId = (int) $meeting->puntoFisico->owner_id;
            } elseif ($validated['ambito'] === 'vendedor') {
                if ($actorId !== (int) $meeting->comprador_id) {
                    throw ValidationException::withMessages([
                        'ambito' => ['Solo el comprador puede evaluar al vendedor.'],
                    ]);
                }
            } elseif ($validated['ambito'] === 'comprador') {
                if ($actorId !== (int) $meeting->vendedor_id) {
                    throw ValidationException::withMessages([
                        'ambito' => ['Solo el vendedor puede evaluar al comprador.'],
                    ]);
                }
            }

            if ($actorId === $receiverId) {
                throw ValidationException::withMessages([
                    'ambito' => ['No puedes evaluarte a ti mismo.'],
                ]);
            }

            $existing = Calificacion::query()
                ->where('encuentro_id', $meeting->id)
                ->where('autor_id', $actorId)
                ->where('ambito', $validated['ambito'])
                ->where('estado', '!=', 'anulada')
                ->exists();
            if ($existing) {
                throw ValidationException::withMessages([
                    'encuentro_id' => ['Ya existe una reseña para esta operación y ámbito.'],
                ]);
            }

            $review = Calificacion::query()->create([
                'encuentro_id' => $meeting->id,
                'punto_fisico_id' => $validated['ambito'] === 'punto'
                    ? $meeting->punto_fisico_id
                    : null,
                'autor_id' => $actorId,
                'receptor_id' => $validated['ambito'] === 'punto'
                    ? $receiverId
                    : $receiverId,
                'ambito' => $validated['ambito'],
                'estado' => 'activa',
                'puntuacion' => $validated['puntuacion'],
                'comentario' => ! empty($validated['comentario'])
                    ? trim($validated['comentario'])
                    : null,
            ]);

            if ($validated['ambito'] === 'punto') {
                $this->reputacion->recalcularPunto($meeting->punto_fisico_id);
            } else {
                $this->reputacion->recalcularUsuario($receiverId, $validated['ambito']);
            }

            return $review;
        });

        return response()->json(['data' => $result], 201);
    }

    public function summary(Request $request, string $ambito, int $id)
    {
        if (! in_array($ambito, ['vendedor', 'comprador', 'punto'], true)) {
            return response()->json(['message' => 'Ámbito no válido.', 'code' => 'INVALID_SCOPE'], 404);
        }

        if ($ambito === 'punto') {
            PuntoFisico::query()->findOrFail($id);
            $summary = $this->reputacion->recalcularPunto($id);
        } else {
            Usuario::query()->findOrFail($id);
            $summary = $this->reputacion->recalcularUsuario($id, $ambito);
        }

        return response()->json([
            'data' => [
                'ambito' => $ambito,
                'cantidad' => $summary['cantidad'],
                'promedio' => $summary['promedio'],
                'distribucion' => $summary['distribucion'],
            ],
        ]);
    }

    public function list(Request $request, string $ambito, int $id)
    {
        if (! in_array($ambito, ['vendedor', 'comprador', 'punto'], true)) {
            return response()->json(['message' => 'Ámbito no válido.', 'code' => 'INVALID_SCOPE'], 404);
        }
        $query = Calificacion::query()
            ->where('ambito', $ambito)
            ->whereIn('estado', ['activa', 'editada'])
            ->with([
                'autor:id,nombre,apellido,username',
                'encuentro:id,producto_id,punto_fisico_id,estado,fecha_encuentro',
            ])
            ->latest('fecha_calificacion');
        if ($ambito === 'punto') {
            $query->where('punto_fisico_id', $id);
        } else {
            $query->where('receptor_id', $id);
        }
        $reviews = $query->paginate((int) $request->integer('per_page', 20));

        return response()->json([
            'data' => $reviews->items(),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
                'last_page' => $reviews->lastPage(),
            ],
        ]);
    }

    public function respond(Request $request, int $resena)
    {
        $review = Calificacion::query()->findOrFail($resena);
        if ((int) $review->receptor_id !== (int) $request->user()->id
            && $review->ambito === 'punto'
        ) {
            $point = PuntoFisico::query()->find($review->punto_fisico_id);
            if (! $point || (int) $point->owner_id !== (int) $request->user()->id) {
                abort(403, 'Sin permiso para responder.');
            }
        } elseif ((int) $review->receptor_id !== (int) $request->user()->id) {
            abort(403, 'Sin permiso para responder.');
        }
        $validated = $request->validate([
            'respuesta' => ['required', 'string', 'max:5000'],
        ]);
        $review->update([
            'respuesta' => trim($validated['respuesta']),
            'respondida_en' => now(),
        ]);

        return response()->json(['data' => $review]);
    }

    public function edit(Request $request, int $resena)
    {
        $review = Calificacion::query()->findOrFail($resena);
        if ((int) $review->autor_id !== (int) $request->user()->id) {
            abort(403, 'Solo el autor puede editar.');
        }
        if ($review->fecha_calificacion->lt(now()->subDays(7))) {
            throw ValidationException::withMessages([
                'resena' => ['La edición ya venció.'],
            ]);
        }
        $validated = $request->validate([
            'puntuacion' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'comentario' => ['nullable', 'string', 'max:5000'],
        ]);
        $review->update([
            ...$validated,
            'estado' => 'editada',
            'editada_en' => now(),
        ]);
        if ($review->ambito === 'punto') {
            $this->reputacion->recalcularPunto($review->punto_fisico_id);
        } else {
            $this->reputacion->recalcularUsuario($review->receptor_id, $review->ambito);
        }

        return response()->json(['data' => $review]);
    }

    public function dispute(Request $request, int $resena)
    {
        $review = Calificacion::query()->findOrFail($resena);
        if ((int) $review->receptor_id !== (int) $request->user()->id) {
            abort(403, 'Solo el receptor puede disputar.');
        }
        $validated = $request->validate([
            'motivo' => ['required', 'string', 'max:2000'],
        ]);
        DB::table('reportes')->insert([
            'usuario_reporta_id' => $request->user()->id,
            'usuario_reportado_id' => $review->autor_id,
            'motivo' => 'Disputa de reseña',
            'descripcion' => trim($validated['motivo']),
            'recurso_tipo' => 'resena',
            'recurso_id' => $review->id,
            'estado' => 'pendiente',
            'fecha_reporte' => now(),
        ]);
        $review->update(['estado' => 'disputada']);

        return response()->json(['message' => 'Disputa enviada.', 'data' => $review]);
    }
}
