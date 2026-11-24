<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Schema;

class PersonalDataController extends Controller
{
    public function sellerStats(Request $request)
    {
        $validated = $request->validate([
            'periodo' => ['nullable', 'in:7d,30d,90d'],
        ]);
        $periodo = $validated['periodo'] ?? '30d';
        $days = (int) rtrim($periodo, 'd');
        $since = now()->subDays($days);
        $sellerId = $request->user()->id;

        $views = DB::table('eventos_comerciales_usuario')
            ->whereIn('producto_id', DB::table('productos')->where('usuario_id', $sellerId)->select('id'))
            ->where('tipo', 'vista')
            ->where('fecha', '>=', $since)
            ->count();
        $contacts = DB::table('mensajes')
            ->join('conversaciones', 'conversaciones.id', '=', 'mensajes.conversacion_id')
            ->where('mensajes.autor_id', '!=', $sellerId)
            ->where('conversaciones.producto_id', '!=', null)
            ->whereIn('conversaciones.producto_id', DB::table('productos')->where('usuario_id', $sellerId)->select('id'))
            ->where('mensajes.fecha_envio', '>=', $since)
            ->distinct('mensajes.autor_id')
            ->count('mensajes.autor_id');
        $offers = DB::table('ofertas')
            ->where('vendedor_id', $sellerId)
            ->where('created_at', '>=', $since)
            ->count();
        $reservations = DB::table('reservas_producto')
            ->whereIn('producto_id', DB::table('productos')->where('usuario_id', $sellerId)->select('id'))
            ->where('fecha', '>=', $since)
            ->count();
        $sold = DB::table('operaciones_comerciales')
            ->where('vendedor_id', $sellerId)
            ->where('estado', 'completada')
            ->where('fecha_completada', '>=', $since)
            ->count();

        $daily = DB::table('productos')
            ->where('usuario_id', $sellerId)
            ->where('fecha_publicacion', '>=', $since)
            ->selectRaw('COUNT(*) as publicaciones')
            ->first();

        return response()->json([
            'periodo' => $periodo,
            'desde' => $since->toIso8601String(),
            'hasta' => now()->toIso8601String(),
            'fuentes' => [
                'vistas' => 'eventos vista deduplicados',
                'contactos' => 'mensajería asociada a anuncios del vendedor',
                'ofertas' => 'tabla ofertas',
                'reservas' => 'tabla reservas_producto',
                'vendidos' => 'operaciones completadas',
            ],
            'data' => [
                'vistas_validas' => $views,
                'contactos' => $contacts,
                'ofertas' => $offers,
                'reservas' => $reservations,
                'vendidos_declarados' => $sold,
                'publicaciones_nuevas' => (int) ($daily->publicaciones ?? 0),
            ],
            'nota' => 'Valores almacenados; no representan tráfico externo ni ventas fuera de AEGIS.',
        ]);
    }

    public function recordView(Request $request, int $producto)
    {
        $product = DB::table('productos')->where('id', $producto)->first();
        if (! $product || $product->visibilidad !== 'publica' || $product->estado_publicacion !== 'activo') {
            return response()->json(['message' => 'Anuncio no disponible.', 'code' => 'RESOURCE_UNAVAILABLE'], 404);
        }
        $identity = $request->user()?->id
            ? 'u'.$request->user()->id
            : 'a'.substr(hash('sha256', $request->ip().'|'.$request->header('User-Agent', '')), 0, 32);
        $fingerprint = hash('sha256', $identity.'|'.$producto.'|'.now()->format('Y-m-d'));
        $ownerId = (int) $product->usuario_id;
        if ($request->user()?->id === $ownerId) {
            return response()->json(['data' => ['registrada' => false]]);
        }
        $eventExists = DB::table('eventos_comerciales_usuario')
            ->where('fingerprint', $fingerprint)
            ->where('tipo', 'vista')
            ->exists();
        if (! $eventExists) {
            DB::table('eventos_comerciales_usuario')->insert([
                'usuario_id' => $request->user()?->id,
                'producto_id' => $producto,
                'tipo' => 'vista',
                'fingerprint' => $fingerprint,
                'fecha' => now(),
            ]);
            DB::table('productos')->where('id', $producto)->increment('vistas');
            $this->upsertRollup($ownerId, $producto, 'vista');
        }
        return response()->json(['data' => ['registrada' => ! $eventExists]]);
    }

    private function upsertRollup(int $sellerId, int $productId, string $tipo): void
    {
        $key = [
            'usuario_id' => $sellerId,
            'producto_id' => $productId,
            'fecha' => now()->toDateString(),
            'tipo' => $tipo,
        ];
        $existing = DB::table('rollups_comerciales_usuario')->where($key)->first();
        if ($existing) {
            DB::table('rollups_comerciales_usuario')->where($key)->update([
                'cantidad' => (int) $existing->cantidad + 1,
                'actualizado_en' => now(),
            ]);
        } else {
            DB::table('rollups_comerciales_usuario')->insert(array_merge($key, [
                'cantidad' => 1,
                'actualizado_en' => now(),
            ]));
        }
    }

    public function activity(Request $request)
    {
        $userId = $request->user()->id;
        $perPage = (int) $request->integer('per_page', 20);
        $posts = DB::table('publicaciones_foro')
            ->where('usuario_id', $userId)
            ->select(['id', DB::raw("'publicacion' as tipo"), 'titulo', 'fecha_publicacion as fecha'])
            ->orderByDesc('fecha')
            ->limit(50)
            ->get();
        $offers = DB::table('ofertas')
            ->where(function ($query) use ($userId): void {
                $query->where('comprador_id', $userId)->orWhere('vendedor_id', $userId);
            })
            ->select(['id', 'estado as tipo', 'monto as titulo', 'created_at as fecha'])
            ->orderByDesc('fecha')
            ->limit(50)
            ->get();
        $operations = DB::table('operaciones_comerciales')
            ->where(function ($query) use ($userId): void {
                $query->where('comprador_id', $userId)->orWhere('vendedor_id', $userId);
            })
            ->select(['id', 'estado as tipo', 'monto_acordado as titulo', 'created_at as fecha'])
            ->orderByDesc('fecha')
            ->limit(50)
            ->get();
        $reviews = DB::table('calificaciones')
            ->where('usuario_calificado_id', $userId)
            ->select(['id', DB::raw("'resena' as tipo"), 'comentario as titulo', 'fecha_calificacion as fecha'])
            ->orderByDesc('fecha')
            ->limit(50)
            ->get();
        $items = $posts->concat($offers)->concat($operations)->concat($reviews)
            ->sortByDesc(fn ($item) => (string) $item->fecha)
            ->values();

        $page = $request->integer('page', 1);
        $slice = $items->forPage($page, $perPage)->values();
        return response()->json([
            'data' => $slice,
            'meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $items->count(),
                'last_page' => max(1, (int) ceil($items->count() / $perPage)),
            ],
        ]);
    }

    public function exportData(Request $request)
    {
        $validated = $request->validate([
            'confirmacion' => ['required', 'string', 'size:8'],
        ]);
        if (strtoupper(trim($validated['confirmacion'])) !== 'EXPORTAR') {
            throw ValidationException::withMessages(['confirmacion' => ['Escribe EXPORTAR para confirmar.']]);
        }
        $userId = $request->user()->id;
        $existing = DB::table('exportaciones_datos')
            ->where('usuario_id', $userId)
            ->whereIn('estado', ['solicitada', 'generada'])
            ->where(function ($query): void {
                $query->whereNull('expira_en')->orWhere('expira_en', '>', now());
            })
            ->exists();
        if ($existing) {
            throw ValidationException::withMessages(['exportacion' => ['Ya existe una exportación activa.']]);
        }
        $payload = [
            'formato' => 'AEGIS-personal-data-v1',
            'generado_en' => now()->toIso8601String(),
            'perfil' => Usuario::query()->findOrFail($userId)->only([
                'id', 'nombre', 'apellido', 'username', 'email', 'ciudad', 'fecha_registro',
            ]),
            'preferencias' => DB::table('preferencias_usuario')->where('usuario_id', $userId)->value('preferencias'),
            'publicaciones' => DB::table('publicaciones_foro')->where('usuario_id', $userId)->get([
                'id', 'titulo', 'contenido', 'visibilidad', 'estado', 'fecha_publicacion',
            ]),
            'productos' => DB::table('productos')->where('usuario_id', $userId)->get([
                'id', 'titulo', 'descripcion', 'precio', 'estado_publicacion', 'fecha_publicacion',
            ]),
            'ofertas' => DB::table('ofertas')
                ->where(function ($query) use ($userId): void {
                    $query->where('comprador_id', $userId)->orWhere('vendedor_id', $userId);
                })
                ->get(['id', 'producto_id', 'monto', 'estado', 'created_at']),
            'operaciones' => DB::table('operaciones_comerciales')
                ->where(function ($query) use ($userId): void {
                    $query->where('comprador_id', $userId)->orWhere('vendedor_id', $userId);
                })
                ->get(['id', 'producto_id', 'monto_acordado', 'estado', 'created_at']),
            'avisos_seguridad' => Schema::hasTable('notificaciones')
                ? DB::table('notificaciones')
                    ->where('usuario_id', $userId)
                    ->where('categoria', 'seguridad')
                    ->get(['id', 'tipo', 'titulo', 'mensaje', 'fecha_creacion'])
                    ->map(fn ($row) => (array) $row)
                : [],
        ];
        $json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $hash = hash('sha256', (string) $json);
        $id = DB::table('exportaciones_datos')->insertGetId([
            'usuario_id' => $userId,
            'formato' => 'json',
            'estado' => 'generada',
            'fecha_solicitud' => now(),
            'fecha_generacion' => now(),
            'expira_en' => now()->addHours(24),
            'ruta' => null,
            'hash_archivo' => $hash,
        ]);

        return response($json, 200, [
            'Content-Type' => 'application/json; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="aegis-datos-personales-'.$userId.'.json"',
            'X-AEGIS-Export-ID' => (string) $id,
            'X-AEGIS-Export-SHA256' => $hash,
        ]);
    }

    public function privacyRequest(Request $request)
    {
        $validated = $request->validate([
            'tipo' => ['required', 'in:desactivacion,eliminacion,correccion'],
            'motivo' => ['nullable', 'string', 'max:2000'],
            'confirmacion' => ['required', 'string', 'size:8'],
        ]);
        if (strtoupper(trim($validated['confirmacion'])) !== 'CONFIRME') {
            throw ValidationException::withMessages(['confirmacion' => ['Escribe CONFIRME para confirmar.']]);
        }
        $active = DB::table('solicitudes_privacidad')
            ->where('usuario_id', $request->user()->id)
            ->where('tipo', $validated['tipo'])
            ->whereIn('estado', ['solicitada', 'en_revision'])
            ->exists();
        if ($active) {
            throw ValidationException::withMessages(['tipo' => ['Ya existe una solicitud activa para esta opción.']]);
        }
        $id = DB::table('solicitudes_privacidad')->insertGetId([
            'usuario_id' => $request->user()->id,
            'tipo' => $validated['tipo'],
            'estado' => 'solicitada',
            'motivo' => $validated['motivo'] ?? null,
            'fecha_solicitud' => now(),
        ]);
        if ($validated['tipo'] === 'desactivacion') {
            Usuario::query()->whereKey($request->user()->id)->update(['estado' => 'suspendido']);
            DB::table('personal_access_tokens')->where('tokenable_id', $request->user()->id)->delete();
        }
        return response()->json([
            'message' => 'Solicitud registrada.',
            'data' => ['id' => $id, 'estado' => 'solicitada'],
        ], 201);
    }

    public function privacyRequests(Request $request)
    {
        $requests = DB::table('solicitudes_privacidad')
            ->where('usuario_id', $request->user()->id)
            ->orderByDesc('fecha_solicitud')
            ->paginate((int) $request->integer('per_page', 20));
        return response()->json([
            'data' => $requests->items(),
            'meta' => ['total' => $requests->total(), 'current_page' => $requests->currentPage(), 'last_page' => $requests->lastPage()],
        ]);
    }
}
