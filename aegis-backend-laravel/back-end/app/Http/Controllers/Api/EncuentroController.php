<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CodigoQr;
use App\Models\Encuentro;
use App\Models\Producto;
use App\Models\PuntoFisico;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class EncuentroController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'estado' => ['nullable', 'in:pendiente,confirmado,reprogramado,cancelado,finalizado'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);
        $query = Encuentro::query()
            ->where(fn ($q) => $q
                ->where('comprador_id', $request->user()->id)
                ->orWhere('vendedor_id', $request->user()->id))
            ->with([
                'producto:id,titulo,precio,estado_publicacion',
                'puntoFisico:id,nombre,direccion,ciudad',
                'comprador:id,nombre,apellido,username',
                'vendedor:id,nombre,apellido,username',
                'codigoQr',
            ])
            ->orderByDesc('fecha_encuentro')
            ->orderByDesc('hora_encuentro');
        if (! empty($validated['estado'])) {
            $query->where('estado', $validated['estado']);
        }
        $meetings = $query->paginate($validated['per_page'] ?? 20);

        return response()->json([
            'data' => $meetings->items(),
            'meta' => [
                'current_page' => $meetings->currentPage(),
                'per_page' => $meetings->perPage(),
                'total' => $meetings->total(),
                'last_page' => $meetings->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'producto_id' => ['required', 'integer', 'exists:productos,id'],
            'punto_fisico_id' => ['required', 'integer', 'exists:puntos_fisicos,id'],
            'fecha_encuentro' => ['required', 'date', 'after_or_equal:today'],
            'hora_encuentro' => ['required', 'date_format:H:i'],
            'notas' => ['nullable', 'string', 'max:2000'],
        ]);
        $product = Producto::query()->findOrFail($validated['producto_id']);
        $point = PuntoFisico::query()->findOrFail($validated['punto_fisico_id']);
        if ($point->estado !== 'activo' || $point->estado_revision !== 'aprobado') {
            throw ValidationException::withMessages([
                'punto_fisico_id' => ['El punto no está aprobado y activo.'],
            ]);
        }
        if (! in_array($product->estado_publicacion, ['activo', 'reservado'], true)) {
            throw ValidationException::withMessages([
                'producto_id' => ['El anuncio no acepta encuentros.'],
            ]);
        }
        if ((int) $product->usuario_id === (int) $request->user()->id) {
            throw ValidationException::withMessages([
                'producto_id' => ['El vendedor propone el encuentro desde su operación comercial.'],
            ]);
        }

        $meeting = DB::transaction(function () use ($request, $validated, $product, $point) {
            $meeting = Encuentro::query()->create([
                'comprador_id' => $request->user()->id,
                'vendedor_id' => $product->usuario_id,
                'producto_id' => $product->id,
                'punto_fisico_id' => $point->id,
                'fecha_encuentro' => $validated['fecha_encuentro'],
                'hora_encuentro' => $validated['hora_encuentro'],
                'estado' => 'pendiente',
                'notas' => $validated['notas'] ?? null,
                'expira_en' => now()->addDays(7),
            ]);
            $this->audit($meeting, $request->user(), 'proponer', null, 'pendiente', 'pendiente');

            return $meeting;
        });

        return response()->json([
            'message' => 'Encuentro propuesto.',
            'data' => $meeting->load(['producto', 'puntoFisico']),
        ], 201);
    }

    public function update(Request $request, int $encuentro)
    {
        $meeting = Encuentro::query()->findOrFail($encuentro);
        if (! $this->isParticipant($meeting, $request->user())) {
            return response()->json(['message' => 'Sin acceso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }
        $validated = $request->validate([
            'decision' => ['required', 'in:confirmado,reprogramado,cancelado,finalizado'],
            'fecha_encuentro' => ['nullable', 'date', 'after_or_equal:today'],
            'hora_encuentro' => ['nullable', 'date_format:H:i'],
            'notas' => ['nullable', 'string', 'max:2000'],
        ]);
        $target = $validated['decision'];

        if ($target === 'reprogramado' && empty($validated['fecha_encuentro']) && empty($validated['hora_encuentro'])) {
            throw ValidationException::withMessages([
                'fecha_encuentro' => ['Reprogramar requiere fecha u hora nueva.'],
            ]);
        }
        if ($target === 'finalizado' && $request->user()->id !== (int) $meeting->vendedor_id
            && $request->user()->rol !== 'admin'
        ) {
            throw ValidationException::withMessages([
                'decision' => ['Solo el vendedor o administración puede finalizar.'],
            ]);
        }
        if (in_array($target, ['confirmado', 'reprogramado'], true)
            && $request->user()->id !== (int) $meeting->vendedor_id
            && $request->user()->rol !== 'admin'
        ) {
            throw ValidationException::withMessages([
                'decision' => ['Solo el vendedor puede confirmar o reprogramar.'],
            ]);
        }

        $previous = $meeting->estado;
        $meeting->update([
            'estado' => $target,
            'fecha_encuentro' => $validated['fecha_encuentro'] ?? $meeting->fecha_encuentro,
            'hora_encuentro' => $validated['hora_encuentro'] ?? $meeting->hora_encuentro,
            'notas' => $validated['notas'] ?? $meeting->notas,
            'confirmado_en' => $target === 'confirmado' ? now() : $meeting->confirmado_en,
            'cancelado_en' => $target === 'cancelado' ? now() : $meeting->cancelado_en,
            'finalizado_en' => $target === 'finalizado' ? now() : $meeting->finalizado_en,
        ]);
        $this->audit($meeting, $request->user(), $target, null, $previous, $target, $validated['notas'] ?? null);

        return response()->json(['data' => $meeting->fresh(['producto', 'puntoFisico', 'codigoQr'])]);
    }

    public function generateQr(Request $request, int $encuentro)
    {
        $meeting = Encuentro::query()->findOrFail($encuentro);
        if (! $this->isParticipant($meeting, $request->user())) {
            return response()->json(['message' => 'Sin acceso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }
        if (! in_array($meeting->estado, ['confirmado', 'reprogramado'], true)) {
            throw ValidationException::withMessages([
                'encuentro' => ['El QR solo se genera para encuentros confirmados.'],
            ]);
        }

        $token = Str::random(48);
        $qr = CodigoQr::query()->updateOrCreate(
            ['encuentro_id' => $meeting->id],
            [
                'codigo' => 'rotado',
                'token_hash' => hash('sha256', $token),
                'estado' => 'activo',
                'expira_en' => now()->addHours(12),
                'usado_en' => null,
                'validado_por' => null,
                'evidencia' => null,
            ],
        );

        return response()->json([
            'data' => [
                'id' => $qr->id,
                'token' => $token,
                'expira_en' => $qr->expira_en,
                'advertencia' => 'El QR no garantiza conducta de participantes. Verifica identidad y precauciones personales.',
            ],
        ]);
    }

    public function validateQr(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string', 'min:40', 'max:80'],
            'evidencia' => ['nullable', 'array', 'max:20'],
        ]);
        $hash = hash('sha256', $validated['token']);

        $result = DB::transaction(function () use ($request, $hash, $validated) {
            $qr = CodigoQr::query()
                ->where('token_hash', $hash)
                ->lockForUpdate()
                ->first();
            if (! $qr) {
                throw ValidationException::withMessages(['token' => ['QR inválido.']]);
            }
            if ($qr->estado !== 'activo') {
                throw ValidationException::withMessages(['token' => ['El QR ya fue usado o rotado.']]);
            }
            if ($qr->expira_en && now()->greaterThan($qr->expira_en)) {
                $qr->update(['estado' => 'expirado']);
                throw ValidationException::withMessages(['token' => ['El QR expiró.']]);
            }
            $meeting = $qr->encuentro()->lockForUpdate()->firstOrFail();
            $point = $meeting->puntoFisico()->firstOrFail();
            $isPointOwner = (int) $point->owner_id === (int) $request->user()->id;
            if (! $isPointOwner && $request->user()->rol !== 'admin') {
                abort(403, 'Solo el owner del punto o admin puede validar.');
            }

            $qr->update([
                'estado' => 'usado',
                'usado_en' => now(),
                'validado_por' => $request->user()->id,
                'evidencia' => $validated['evidencia'] ?? ['tipo' => 'validacion_presencial'],
            ]);
            $meeting->update([
                'estado' => 'finalizado',
                'finalizado_en' => now(),
            ]);
            $this->audit($meeting, $request->user(), 'validar_qr', null, 'confirmado', 'finalizado');

            return [
                'encuentro_id' => $meeting->id,
                'validado_por' => $request->user()->id,
                'fecha' => now()->toISOString(),
                'evidencia' => $qr->evidencia,
            ];
        });

        return response()->json(['data' => $result]);
    }

    public function pointDirectory(Request $request)
    {
        $validated = $request->validate([
            'ciudad' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);
        $query = PuntoFisico::query()
            ->where('estado', 'activo')
            ->where('estado_revision', 'aprobado')
            ->select([
                'id', 'nombre', 'descripcion', 'direccion', 'ciudad',
                'imagen', 'reputacion', 'servicios', 'reglas',
                'latitud', 'longitud',
            ]);
        if (! empty($validated['ciudad'])) {
            $query->where('ciudad', 'like', '%'.$validated['ciudad'].'%');
        }
        $points = $query->orderBy('nombre')->paginate($validated['per_page'] ?? 24);

        return response()->json([
            'data' => $points->items(),
            'meta' => [
                'current_page' => $points->currentPage(),
                'per_page' => $points->perPage(),
                'total' => $points->total(),
                'last_page' => $points->lastPage(),
            ],
        ]);
    }

    private function isParticipant(Encuentro $meeting, Usuario $user): bool
    {
        return (int) $meeting->comprador_id === (int) $user->id
            || (int) $meeting->vendedor_id === (int) $user->id
            || $user->rol === 'admin';
    }

    private function audit(
        Encuentro $meeting,
        Usuario $actor,
        string $accion,
        ?Usuario $objetivo,
        ?string $anterior,
        string $nuevo,
        ?string $nota = null,
    ): void {
        DB::table('historial_encuentro')->insert([
            'encuentro_id' => $meeting->id,
            'actor_id' => $actor->id,
            'accion' => $accion,
            'estado_anterior' => $anterior,
            'estado_nuevo' => $nuevo,
            'nota' => $nota,
            'fecha' => now(),
        ]);
    }
}
