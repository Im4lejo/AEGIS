<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publicacion;
use App\Models\Producto;
use App\Models\Usuario;
use App\Services\NotificationDispatcher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ModeracionController extends Controller
{
    private function requireModerator(Request $request): void
    {
        if (! Gate::forUser($request->user())->allows('manage.accounts')) {
            throw new HttpException(403, 'Solo administradores pueden moderar.');
        }
    }

    private function audit(Request $request, string $accion, string $tipo, ?int $id, array $detalle): void
    {
        $previous = DB::table('auditoria_moderacion')
            ->orderByDesc('id')
            ->value('hash');
        $payload = [
            'actor_id' => $request->user()->id,
            'accion' => $accion,
            'recurso_tipo' => $tipo,
            'recurso_id' => $id,
            'detalle' => $detalle,
            'fecha' => now()->toIso8601String(),
            'hash_anterior' => $previous,
        ];
        $hash = hash('sha256', json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        DB::table('auditoria_moderacion')->insert(array_merge($payload, [
            'hash' => $hash,
            'hash_anterior' => $previous,
            'fecha' => now(),
            'detalle' => json_encode($detalle),
        ]));
    }

    public function mine(Request $request)
    {
        $reportes = DB::table('reportes')
            ->where('usuario_reporta_id', $request->user()->id)
            ->orderByDesc('fecha_reporte')
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json([
            'data' => $reportes->getCollection()->map(fn ($row) => [
                'id' => $row->id,
                'motivo' => $row->motivo,
                'recurso_tipo' => $row->recurso_tipo,
                'estado' => $row->estado,
                'prioridad' => $row->prioridad,
                'fecha_reporte' => $row->fecha_reporte,
                'razon_resolucion' => $row->razon_resolucion,
            ]),
            'meta' => [
                'current_page' => $reportes->currentPage(),
                'per_page' => $reportes->perPage(),
                'total' => $reportes->total(),
                'last_page' => $reportes->lastPage(),
            ],
        ]);
    }

    public function queue(Request $request)
    {
        $this->requireModerator($request);
        $filters = $request->validate([
            'estado' => ['nullable', 'in:pendiente,en_revision,resuelto,descartado'],
            'prioridad' => ['nullable', 'in:baja,normal,alta,critica'],
            'recurso_tipo' => ['nullable', 'string', 'max:50'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = DB::table('reportes')
            ->leftJoin('usuarios as reportante', 'reportante.id', '=', 'reportes.usuario_reporta_id')
            ->leftJoin('usuarios as reportado', 'reportado.id', '=', 'reportes.usuario_reportado_id')
            ->leftJoin('usuarios as asignado', 'asignado.id', '=', 'reportes.asignado_id')
            ->select([
                'reportes.*',
                'reportante.username as reportante_username',
                'reportado.username as reportado_username',
                'asignado.username as asignado_username',
            ]);
        if (! empty($filters['estado'])) {
            $query->where('reportes.estado', $filters['estado']);
        }
        if (! empty($filters['prioridad'])) {
            $query->where('reportes.prioridad', $filters['prioridad']);
        }
        if (! empty($filters['recurso_tipo'])) {
            $query->where('reportes.recurso_tipo', $filters['recurso_tipo']);
        }
        $query->orderByRaw("CASE reportes.prioridad WHEN 'critica' THEN 1 WHEN 'alta' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END")
            ->orderBy('reportes.fecha_reporte');
        $page = $query->paginate((int) ($filters['per_page'] ?? 20));

        return response()->json([
            'data' => $page->items(),
            'meta' => [
                'current_page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
                'last_page' => $page->lastPage(),
            ],
        ]);
    }

    public function assign(Request $request, int $reporte)
    {
        $this->requireModerator($request);
        $exists = DB::table('reportes')->where('id', $reporte)->exists();
        if (! $exists) {
            return response()->json(['message' => 'Reporte inexistente.', 'code' => 'REPORT_NOT_FOUND'], 404);
        }
        DB::table('reportes')->where('id', $reporte)->update([
            'asignado_id' => $request->user()->id,
            'asignado_en' => now(),
            'revision_en' => now(),
            'estado' => 'en_revision',
        ]);
        DB::table('acciones_moderacion')->insert([
            'moderador_id' => $request->user()->id,
            'reporte_id' => $reporte,
            'accion' => 'asignar',
            'detalle' => json_encode(['asignado_id' => $request->user()->id]),
            'fecha' => now(),
        ]);
        $this->audit($request, 'asignar_reporte', 'Reporte', $reporte, ['asignado_id' => $request->user()->id]);

        return response()->json(['message' => 'Reporte asignado.', 'data' => DB::table('reportes')->where('id', $reporte)->first()]);
    }

    public function resolve(Request $request, int $reporte, NotificationDispatcher $notifications)
    {
        $this->requireModerator($request);
        $validated = $request->validate([
            'resultado' => ['required', 'in:resuelto,descartado'],
            'razon' => ['required', 'string', 'min:10', 'max:3000'],
            'sancion' => ['nullable', 'in:ninguna,advertencia,suspension,baneo'],
            'dias' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);
        $report = DB::table('reportes')->where('id', $reporte)->first();
        if (! $report) {
            return response()->json(['message' => 'Reporte inexistente.', 'code' => 'REPORT_NOT_FOUND'], 404);
        }
        if ($report->estado === 'resuelto') {
            throw ValidationException::withMessages(['reporte' => ['El reporte ya fue resuelto.']]);
        }

        $sancionTipo = $validated['resultado'] === 'resuelto'
            ? ($validated['sancion'] ?? 'ninguna')
            : 'ninguna';
        $sancionId = null;
        if ($sancionTipo !== 'ninguna') {
            $finaliza = match ($sancionTipo) {
                'advertencia' => null,
                'suspension' => now()->addDays((int) ($validated['dias'] ?? 7)),
                'baneo' => null,
            };
            $sancionId = DB::table('sanciones_moderacion')->insertGetId([
                'usuario_id' => $report->usuario_reportado_id,
                'moderador_id' => $request->user()->id,
                'reporte_id' => $reporte,
                'tipo' => $sancionTipo,
                'motivo' => trim($validated['razon']),
                'inicia_en' => now(),
                'finaliza_en' => $finaliza,
                'estado' => 'activa',
            ]);
            if ($sancionTipo === 'baneo') {
                Usuario::query()->whereKey($report->usuario_reportado_id)->update(['estado' => 'baneado']);
            } elseif ($sancionTipo === 'suspension') {
                Usuario::query()->whereKey($report->usuario_reportado_id)->update(['estado' => 'suspendido']);
            }
        }

        DB::table('reportes')->where('id', $reporte)->update([
            'estado' => $validated['resultado'],
            'resuelto_en' => now(),
            'razon_resolucion' => trim($validated['razon']),
            'sancion_tipo' => $sancionTipo,
            'sancion_hasta' => $sancionTipo === 'suspension'
                ? now()->addDays((int) ($validated['dias'] ?? 7))
                : null,
        ]);
        DB::table('acciones_moderacion')->insert([
            'moderador_id' => $request->user()->id,
            'reporte_id' => $reporte,
            'usuario_afectado_id' => $report->usuario_reportado_id,
            'accion' => $validated['resultado'],
            'detalle' => json_encode(['razon' => trim($validated['razon']), 'sancion' => $sancionTipo]),
            'fecha' => now(),
        ]);
        $this->audit($request, 'resolver_reporte', 'Reporte', $reporte, [
            'resultado' => $validated['resultado'],
            'razon' => trim($validated['razon']),
            'sancion' => $sancionTipo,
            'sancion_id' => $sancionId,
        ]);

        $notifications->emit(
            (int) $report->usuario_reportado_id,
            'seguridad',
            'moderacion',
            'Actualización de moderación',
            'Se resolvió una acción de seguridad relacionada con tu cuenta. Puedes presentar una apelación.',
            $request->user()->id,
            'reporte',
            (int) $reporte,
            '/ajustes',
            'moderacion-reporte-'.$reporte,
        );

        return response()->json([
            'message' => 'Reporte resuelto.',
            'data' => ['id' => $reporte, 'sancion_id' => $sancionId],
        ]);
    }

    public function fraudQueue(Request $request)
    {
        $this->requireModerator($request);
        $signals = DB::table('senales_antifraude')
            ->where('estado', 'revision')
            ->orderByDesc('puntaje')
            ->orderByDesc('fecha')
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json([
            'data' => $signals->items(),
            'meta' => [
                'current_page' => $signals->currentPage(),
                'per_page' => $signals->perPage(),
                'total' => $signals->total(),
                'last_page' => $signals->lastPage(),
            ],
        ]);
    }

    public function scanFraud(Request $request, int $producto)
    {
        $this->requireModerator($request);
        $product = Producto::query()->findOrFail($producto);
        $signals = [];
        $duplicateCount = Producto::query()
            ->where('usuario_id', $product->usuario_id)
            ->whereRaw('LOWER(titulo) = ?', [strtolower((string) $product->titulo)])
            ->count();
        if ($duplicateCount > 1) {
            $signals[] = ['regla' => 'titulo_duplicado', 'puntaje' => 60, 'evidencia' => ['cantidad' => $duplicateCount]];
        }
        if ((float) $product->precio <= 0) {
            $signals[] = ['regla' => 'precio_sin_valor_real', 'puntaje' => 75, 'evidencia' => ['precio' => $product->precio]];
        }
        foreach ($signals as $signal) {
            $existing = DB::table('senales_antifraude')
                ->where('entidad_tipo', 'producto')
                ->where('entidad_id', $product->id)
                ->where('regla', $signal['regla'])
                ->where('estado', 'revision')
                ->exists();
            if (! $existing) {
                DB::table('senales_antifraude')->insert([
                    'entidad_tipo' => 'producto',
                    'entidad_id' => $product->id,
                    'usuario_id' => $product->usuario_id,
                    'regla' => $signal['regla'],
                    'puntaje' => $signal['puntaje'],
                    'evidencia' => json_encode($signal['evidencia']),
                    'estado' => 'revision',
                    'fecha' => now(),
                ]);
            }
        }
        $this->audit($request, 'evaluar_antifraude', 'Producto', $product->id, [
            'senales' => array_column($signals, 'regla'),
            'clasificacion_automatica' => false,
        ]);

        return response()->json(['data' => $signals]);
    }

    public function appeal(Request $request, int $reporte)
    {
        $validated = $request->validate([
            'argumento' => ['required', 'string', 'min:20', 'max:3000'],
        ]);
        $report = DB::table('reportes')->where('id', $reporte)->first();
        if (! $report) {
            return response()->json(['message' => 'Reporte inexistente.', 'code' => 'REPORT_NOT_FOUND'], 404);
        }
        if ((int) $report->usuario_reportado_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'Solo la persona afectada puede apelar.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }
        if (! in_array($report->estado, ['resuelto', 'descartado'], true)) {
            throw ValidationException::withMessages(['reporte' => ['El reporte todavía no puede ser apelado.']]);
        }
        $existing = DB::table('apelaciones_moderacion')
            ->where('reporte_id', $reporte)
            ->where('usuario_id', $request->user()->id)
            ->where('estado', 'pendiente')
            ->exists();
        if ($existing) {
            throw ValidationException::withMessages(['reporte' => ['Ya existe una apelación pendiente.']]);
        }
        $sancionId = DB::table('sanciones_moderacion')
            ->where('reporte_id', $reporte)
            ->where('estado', 'activa')
            ->value('id');
        $id = DB::table('apelaciones_moderacion')->insertGetId([
            'reporte_id' => $reporte,
            'usuario_id' => $request->user()->id,
            'sancion_id' => $sancionId,
            'argumento' => trim($validated['argumento']),
            'estado' => 'pendiente',
            'fecha' => now(),
        ]);

        $this->audit($request, 'crear_apelacion', 'Reporte', $reporte, ['apelacion_id' => $id]);

        return response()->json(['message' => 'Apelación enviada.', 'data' => ['id' => $id]], 201);
    }

    public function appealQueue(Request $request)
    {
        $this->requireModerator($request);
        $appeals = DB::table('apelaciones_moderacion')
            ->leftJoin('usuarios', 'usuarios.id', '=', 'apelaciones_moderacion.usuario_id')
            ->select([
                'apelaciones_moderacion.*',
                'usuarios.username',
            ])
            ->orderBy('apelaciones_moderacion.estado')
            ->orderByDesc('apelaciones_moderacion.fecha')
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json([
            'data' => $appeals->items(),
            'meta' => [
                'current_page' => $appeals->currentPage(),
                'per_page' => $appeals->perPage(),
                'total' => $appeals->total(),
                'last_page' => $appeals->lastPage(),
            ],
        ]);
    }

    public function resolveAppeal(Request $request, int $apelacion)
    {
        $this->requireModerator($request);
        $validated = $request->validate([
            'resultado' => ['required', 'in:aceptada,rechazada'],
            'resolucion' => ['required', 'string', 'min:10', 'max:3000'],
        ]);
        $appeal = DB::table('apelaciones_moderacion')->where('id', $apelacion)->first();
        if (! $appeal) {
            return response()->json(['message' => 'Apelación inexistente.', 'code' => 'APPEAL_NOT_FOUND'], 404);
        }
        DB::transaction(function () use ($request, $validated, $appeal): void {
            DB::table('apelaciones_moderacion')->where('id', $appeal->id)->update([
                'estado' => $validated['resultado'],
                'resolucion' => trim($validated['resolucion']),
                'revisor_id' => $request->user()->id,
                'resuelta_en' => now(),
            ]);
            if ($validated['resultado'] === 'aceptada' && $appeal->sancion_id) {
                DB::table('sanciones_moderacion')->where('id', $appeal->sancion_id)->update([
                    'estado' => 'revocada',
                    'revocada_en' => now(),
                    'revocada_por' => $request->user()->id,
                    'razon_revocacion' => trim($validated['resolucion']),
                ]);
                DB::table('usuarios')->where('id', $appeal->usuario_id)->update(['estado' => 'activo']);
                DB::table('reportes')->where('id', $appeal->reporte_id)->update([
                    'estado' => 'descartado',
                    'razon_resolucion' => 'Apelación aceptada: '.trim($validated['resolucion']),
                    'sancion_tipo' => null,
                    'sancion_hasta' => null,
                ]);
            }
        });
        $this->audit($request, 'resolver_apelacion', 'Apelacion', $apelacion, [
            'resultado' => $validated['resultado'],
            'resolucion' => trim($validated['resolucion']),
        ]);

        return response()->json(['message' => 'Apelación revisada.', 'data' => ['id' => $apelacion]]);
    }
}
