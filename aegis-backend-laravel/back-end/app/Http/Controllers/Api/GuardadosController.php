<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ColeccionGuardado;
use App\Models\Guardado;
use App\Models\Producto;
use App\Models\Publicacion;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GuardadosController extends Controller
{
    public function collections(Request $request)
    {
        $collections = ColeccionGuardado::query()
            ->where('usuario_id', $request->user()->id)
            ->withCount('guardados')
            ->orderBy('nombre')
            ->get();

        return response()->json(['data' => $collections]);
    }

    public function storeCollection(Request $request)
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:100'],
            'privada' => ['sometimes', 'boolean'],
        ]);

        $collection = ColeccionGuardado::query()->firstOrCreate([
            'usuario_id' => $request->user()->id,
            'nombre' => trim($validated['nombre']),
        ], [
            'privada' => $validated['privada'] ?? true,
        ]);

        return response()->json([
            'data' => $collection,
        ], 201);
    }

    public function save(Request $request)
    {
        $validated = $request->validate([
            'recurso_tipo' => ['required', 'in:post,producto,discusion'],
            'recurso_id' => ['required', 'integer', 'min:1'],
            'coleccion_id' => ['nullable', 'integer', 'exists:colecciones_guardado,id'],
        ]);

        $this->assertResourceExists($validated['recurso_tipo'], (int) $validated['recurso_id']);

        if (! empty($validated['coleccion_id'])) {
            $owned = ColeccionGuardado::query()
                ->whereKey($validated['coleccion_id'])
                ->where('usuario_id', $request->user()->id)
                ->exists();
            if (! $owned) {
                throw ValidationException::withMessages([
                    'coleccion_id' => ['La colección no pertenece a tu cuenta.'],
                ]);
            }
        }

        $saved = Guardado::query()->firstOrCreate([
            'usuario_id' => $request->user()->id,
            'recurso_tipo' => $validated['recurso_tipo'],
            'recurso_id' => (int) $validated['recurso_id'],
        ], [
            'coleccion_id' => $validated['coleccion_id'] ?? null,
        ]);

        return response()->json([
            'message' => 'Recurso guardado.',
            'data' => $saved,
        ], 201);
    }

    public function unsave(Request $request)
    {
        $validated = $request->validate([
            'recurso_tipo' => ['required', 'in:post,producto,discusion'],
            'recurso_id' => ['required', 'integer', 'min:1'],
        ]);

        Guardado::query()
            ->where('usuario_id', $request->user()->id)
            ->where('recurso_tipo', $validated['recurso_tipo'])
            ->where('recurso_id', (int) $validated['recurso_id'])
            ->delete();

        return response()->json(['message' => 'Recurso eliminado de guardados.']);
    }

    public function index(Request $request)
    {
        $filters = $request->validate([
            'recurso_tipo' => ['nullable', 'in:post,producto,discusion'],
            'coleccion_id' => ['nullable', 'integer', 'exists:colecciones_guardado,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = Guardado::query()
            ->where('usuario_id', $request->user()->id)
            ->with('coleccion')
            ->latest('created_at');

        if (! empty($filters['recurso_tipo'])) {
            $query->where('recurso_tipo', $filters['recurso_tipo']);
        }
        if (! empty($filters['coleccion_id'])) {
            $owned = ColeccionGuardado::query()
                ->whereKey($filters['coleccion_id'])
                ->where('usuario_id', $request->user()->id)
                ->exists();
            if (! $owned) {
                throw ValidationException::withMessages([
                    'coleccion_id' => ['La colección no pertenece a tu cuenta.'],
                ]);
            }
            $query->where('coleccion_id', $filters['coleccion_id']);
        }

        $saved = $query->paginate($filters['per_page'] ?? 20);

        return response()->json([
            'data' => $saved->items(),
            'meta' => [
                'current_page' => $saved->currentPage(),
                'per_page' => $saved->perPage(),
                'total' => $saved->total(),
                'last_page' => $saved->lastPage(),
            ],
        ]);
    }

    public function report(Request $request)
    {
        $validated = $request->validate([
            'recurso_tipo' => ['required', 'in:usuario,post,comentario,producto,discusion,comunidad,mensaje,operacion'],
            'recurso_id' => ['required', 'integer', 'min:1'],
            'usuario_reportado_id' => ['nullable', 'integer', 'exists:usuarios,id'],
            'motivo' => ['required', 'string', 'min:2', 'max:255'],
            'descripcion' => ['nullable', 'string', 'max:2000'],
            'evidencia' => ['nullable', 'array', 'max:5'],
            'evidencia.*' => ['nullable', 'string', 'url', 'max:2048'],
        ]);
        $this->assertResourceExists(
            $validated['recurso_tipo'],
            (int) $validated['recurso_id'],
        );
        $legacyReason = mb_strtolower(trim($validated['motivo']), 'UTF-8');
        $motivoNormalizado = match ($legacyReason) {
            'contenido inapropiado', 'contenido_inapropiado' => 'contenido_prohibido',
            'spam', 'estafa', 'acoso', 'suplantacion', 'suplantación' => $legacyReason === 'suplantación'
                ? 'suplantacion'
                : $legacyReason,
            default => 'spam',
        };
        $allowed = ['spam', 'estafa', 'acoso', 'contenido_prohibido', 'suplantacion'];
        if (in_array($legacyReason, $allowed, true)) {
            $motivoNormalizado = $legacyReason;
        }

        $reportedId = $validated['usuario_reportado_id'] ?? null;
        if (! $reportedId) {
            $reportedId = $this->inferReportedUser($validated['recurso_tipo'], (int) $validated['recurso_id']);
        }
        if (! $reportedId) {
            throw ValidationException::withMessages([
                'recurso_id' => ['No se pudo identificar el recurso reportado.'],
            ]);
        }
        $fingerprint = hash(
            'sha256',
            implode(':', [
                $request->user()->id,
                $validated['recurso_tipo'],
                (int) $validated['recurso_id'],
                $motivoNormalizado,
            ]),
        );
        $existing = DB::table('reportes')
            ->where('fingerprint', $fingerprint)
            ->whereIn('estado', ['pendiente', 'en_revision'])
            ->exists();
        if ($existing) {
            throw ValidationException::withMessages([
                'recurso_id' => ['Ya existe un reporte activo para este recurso.'],
            ]);
        }

        $id = DB::table('reportes')->insertGetId([
            'usuario_reporta_id' => $request->user()->id,
            'usuario_reportado_id' => $reportedId,
            'motivo' => $motivoNormalizado,
            'descripcion' => $validated['descripcion'] ?? null,
            'recurso_tipo' => $validated['recurso_tipo'],
            'recurso_id' => (int) $validated['recurso_id'],
            'estado' => 'pendiente',
            'prioridad' => in_array($motivoNormalizado, ['estafa', 'acoso', 'contenido_prohibido'], true)
                ? 'alta'
                : 'normal',
            'evidencia' => json_encode(array_values($validated['evidencia'] ?? [])),
            'fingerprint' => $fingerprint,
            'fecha_reporte' => now(),
        ]);

        return response()->json([
            'message' => 'Reporte enviado.',
            'data' => ['id' => $id],
        ], 201);
    }

    private function assertResourceExists(string $tipo, int $id): void
    {
        $exists = match ($tipo) {
            'post', 'discusion' => Publicacion::query()->whereKey($id)->exists(),
            'producto' => Producto::query()->whereKey($id)->exists(),
            'usuario' => Usuario::query()->whereKey($id)->exists(),
            'comentario' => DB::table('comentarios_foro')->where('id', $id)->exists(),
            'comunidad' => DB::table('comunidades')->where('id', $id)->exists(),
            'mensaje' => DB::table('mensajes')->where('id', $id)->exists(),
            'operacion' => DB::table('operaciones_comerciales')->where('id', $id)->exists()
                || DB::table('operaciones')->where('id', $id)->exists(),
        };
        if (! $exists) {
            throw ValidationException::withMessages([
                'recurso_id' => ['El recurso no existe.'],
            ]);
        }
    }

    private function inferReportedUser(string $tipo, int $id): ?int
    {
        return match ($tipo) {
            'usuario' => Usuario::query()->whereKey($id)->value('id'),
            'post', 'discusion' => Publicacion::query()->whereKey($id)->value('usuario_id'),
            'producto' => Producto::query()->whereKey($id)->value('usuario_id'),
            'comentario' => DB::table('comentarios_foro')->where('id', $id)->value('usuario_id'),
            'comunidad' => DB::table('comunidades')->where('id', $id)->value('owner_id'),
            'mensaje' => DB::table('mensajes')->where('id', $id)->value('autor_id'),
            'operacion' => DB::table('operaciones_comerciales')->where('id', $id)->value('comprador_id')
                ?? DB::table('operaciones')->where('id', $id)->value('comprador_id'),
            default => null,
        };
    }
}
