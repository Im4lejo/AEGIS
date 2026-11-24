<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Support\Facades\Schema;

class AdminCenterController extends Controller
{
    private function requireCapability(Request $request, string $capability): void
    {
        $admin = Gate::forUser($request->user())->allows('manage.accounts');
        $delegated = DB::table('permisos_operacion')
            ->where('usuario_id', $request->user()->id)
            ->where('capacidad', $capability)
            ->whereNull('revocado_en')
            ->exists();
        if (! $admin && ! $delegated) {
            throw new HttpException(403, 'No tienes permiso operativo para esta acción.');
        }
    }

    private function audit(Request $request, string $accion, string $tipo, ?int $id, array $detalle): void
    {
        $previous = DB::table('auditoria_moderacion')->orderByDesc('id')->value('hash');
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
            'detalle' => json_encode($detalle),
            'hash' => $hash,
            'fecha' => now(),
        ]));
    }

    public function dashboard(Request $request)
    {
        $this->requireCapability($request, 'dashboard');
        $validated = $request->validate([
            'periodo' => ['nullable', 'in:24h,7d,30d'],
        ]);
        $periodo = $validated['periodo'] ?? '30d';
        $desde = match ($periodo) {
            '24h' => now()->subDay(),
            '7d' => now()->subDays(7),
            default => now()->subDays(30),
        };

        return response()->json([
            'periodo' => $periodo,
            'desde' => $desde->toIso8601String(),
            'hasta' => now()->toIso8601String(),
            'data' => [
                'cuentas_total' => DB::table('usuarios')->count(),
                'cuentas_nuevas' => DB::table('usuarios')->where('fecha_registro', '>=', $desde)->count(),
                'posts_total' => DB::table('publicaciones_foro')->count(),
                'posts_nuevos' => DB::table('publicaciones_foro')->where('fecha_publicacion', '>=', $desde)->count(),
                'productos_total' => DB::table('productos')->count(),
                'productos_nuevos' => DB::table('productos')->where('fecha_publicacion', '>=', $desde)->count(),
                'comunidades_total' => DB::table('comunidades')->count(),
                'comunidades_nuevas' => DB::table('comunidades')->where('fecha_creacion', '>=', $desde)->count(),
                'reportes_pendientes' => DB::table('reportes')->where('estado', 'pendiente')->count(),
                'reportes_nuevos' => DB::table('reportes')->where('fecha_reporte', '>=', $desde)->count(),
                'puntos_total' => DB::table('puntos_fisicos')->count(),
                'operaciones_total' => Schema::hasTable('operaciones_comerciales')
                    ? DB::table('operaciones_comerciales')->count()
                    : (Schema::hasTable('operaciones') ? DB::table('operaciones')->count() : 0),
            ],
        ]);
    }

    public function users(Request $request)
    {
        $this->requireCapability($request, 'usuarios');
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'rol' => ['nullable', 'in:usuario,owner,admin'],
            'estado' => ['nullable', 'in:activo,suspendido,baneado'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);
        $query = Usuario::query()->select([
            'id', 'nombre', 'apellido', 'username', 'email', 'rol', 'estado', 'fecha_registro',
        ]);
        if (! empty($validated['q'])) {
            $term = '%'.trim($validated['q']).'%';
            $query->where(function ($where) use ($term): void {
                $where->where('nombre', 'like', $term)
                    ->orWhere('apellido', 'like', $term)
                    ->orWhere('username', 'like', $term)
                    ->orWhere('email', 'like', $term);
            });
        }
        if (! empty($validated['rol'])) {
            $query->where('rol', $validated['rol']);
        }
        if (! empty($validated['estado'])) {
            $query->where('estado', $validated['estado']);
        }
        $page = $query->orderByDesc('fecha_registro')->paginate((int) ($validated['per_page'] ?? 20));

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

    public function updateUser(Request $request, int $usuario)
    {
        $this->requireCapability($request, 'usuarios');
        $validated = $request->validate([
            'rol' => ['nullable', 'in:usuario,owner,admin'],
            'estado' => ['nullable', 'in:activo,suspendido,baneado'],
            'confirmacion' => ['required', 'string', 'size:6'],
        ]);
        if (strtoupper(trim($validated['confirmacion'])) !== 'CONFIR') {
            throw ValidationException::withMessages(['confirmacion' => ['Debes confirmar la operación escribiendo CONFIR.']]);
        }
        $account = Usuario::query()->findOrFail($usuario);
        $before = ['rol' => $account->rol, 'estado' => $account->estado];
        $account->update(array_filter([
            'rol' => $validated['rol'] ?? null,
            'estado' => $validated['estado'] ?? null,
        ], fn ($value) => $value !== null));
        if ($account->estado !== 'activo') {
            $account->tokens()->delete();
        }
        $detail = ['antes' => $before, 'despues' => ['rol' => $account->rol, 'estado' => $account->estado]];
        $this->audit($request, 'administrar_usuario', 'Usuario', $account->id, $detail);

        return response()->json(['data' => $account->only(['id', 'nombre', 'apellido', 'username', 'email', 'rol', 'estado'])]);
    }

    public function categories(Request $request)
    {
        $this->requireCapability($request, 'categorias');
        $categories = DB::table('categorias')
            ->select(['id', 'nombre', 'descripcion', 'estado', 'orden'])
            ->orderBy('orden')
            ->orderBy('nombre')
            ->paginate((int) $request->integer('per_page', 50));
        return response()->json([
            'data' => $categories->items(),
            'meta' => ['total' => $categories->total(), 'current_page' => $categories->currentPage(), 'last_page' => $categories->lastPage()],
        ]);
    }

    public function storeCategory(Request $request)
    {
        $this->requireCapability($request, 'categorias');
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:100', 'unique:categorias,nombre'],
            'descripcion' => ['nullable', 'string', 'max:1000'],
            'estado' => ['required', 'in:activa,inactiva'],
            'orden' => ['nullable', 'integer', 'min:0', 'max:65535'],
        ]);
        $id = DB::table('categorias')->insertGetId([
            'nombre' => trim($validated['nombre']),
            'descripcion' => $validated['descripcion'] ?? null,
            'estado' => $validated['estado'],
            'orden' => $validated['orden'] ?? 0,
        ]);
        $this->audit($request, 'crear_categoria', 'Categoria', $id, $validated);
        return response()->json(['data' => DB::table('categorias')->where('id', $id)->first()], 201);
    }

    public function updateCategory(Request $request, int $categoria)
    {
        $this->requireCapability($request, 'categorias');
        $validated = $request->validate([
            'nombre' => ['sometimes', 'string', 'max:100', 'unique:categorias,nombre,'.$categoria],
            'descripcion' => ['nullable', 'string', 'max:1000'],
            'estado' => ['sometimes', 'in:activa,inactiva'],
            'orden' => ['sometimes', 'integer', 'min:0', 'max:65535'],
        ]);
        $before = DB::table('categorias')->where('id', $categoria)->first();
        if (! $before) {
            return response()->json(['message' => 'Categoría inexistente.', 'code' => 'NOT_FOUND'], 404);
        }
        DB::table('categorias')->where('id', $categoria)->update($validated);
        $this->audit($request, 'editar_categoria', 'Categoria', $categoria, ['antes' => (array) $before, 'despues' => $validated]);
        return response()->json(['data' => DB::table('categorias')->where('id', $categoria)->first()]);
    }

    public function notices(Request $request)
    {
        $this->requireCapability($request, 'avisos');
        $notices = DB::table('avisos_sistema')
            ->orderByDesc('fecha_creacion')
            ->paginate((int) $request->integer('per_page', 20));
        return response()->json(['data' => $notices->items(), 'meta' => ['total' => $notices->total(), 'current_page' => $notices->currentPage(), 'last_page' => $notices->lastPage()]]);
    }

    public function storeNotice(Request $request)
    {
        $this->requireCapability($request, 'avisos');
        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:150'],
            'contenido' => ['required', 'string', 'max:5000'],
            'nivel' => ['required', 'in:info,advertencia,critico'],
            'estado' => ['required', 'in:borrador,publicado,archivado'],
            'vigente_desde' => ['nullable', 'date'],
            'vigente_hasta' => ['nullable', 'date', 'after_or_equal:vigente_desde'],
        ]);
        $id = DB::table('avisos_sistema')->insertGetId(array_merge($validated, [
            'creado_por' => $request->user()->id,
            'fecha_creacion' => now(),
        ]));
        $this->audit($request, 'crear_aviso', 'AvisoSistema', $id, $validated);
        return response()->json(['data' => DB::table('avisos_sistema')->where('id', $id)->first()], 201);
    }

    public function configuration(Request $request)
    {
        $this->requireCapability($request, 'configuracion');
        $config = DB::table('configuracion_global')
            ->orderBy('clave')
            ->get(['clave', 'valor', 'tipo', 'version', 'actualizado_en']);
        return response()->json(['data' => $config]);
    }

    public function updateConfiguration(Request $request)
    {
        $this->requireCapability($request, 'configuracion');
        $validated = $request->validate([
            'clave' => ['required', 'string', 'regex:/^[a-z0-9_.-]{2,100}$/'],
            'valor' => ['required', 'string', 'max:5000'],
            'tipo' => ['required', 'in:string,integer,boolean,json'],
            'version' => ['required', 'integer', 'min:1'],
        ]);
        $before = DB::table('configuracion_global')->where('clave', $validated['clave'])->first();
        if ($before && (int) $before->version !== (int) $validated['version']) {
            throw ValidationException::withMessages(['version' => ['La configuración cambió; recarga antes de guardar.']]);
        }
        $nextVersion = $before ? (int) $before->version + 1 : 1;
        DB::table('configuracion_global')->updateOrInsert(
            ['clave' => $validated['clave']],
            [
                'valor' => $validated['valor'],
                'tipo' => $validated['tipo'],
                'version' => $nextVersion,
                'actualizado_por' => $request->user()->id,
                'actualizado_en' => now(),
            ],
        );
        $this->audit($request, 'editar_configuracion', 'ConfiguracionGlobal', null, [
            'clave' => $validated['clave'],
            'tipo' => $validated['tipo'],
            'version' => $nextVersion,
        ]);
        return response()->json(['data' => DB::table('configuracion_global')->where('clave', $validated['clave'])->first()]);
    }

    public function permissions(Request $request)
    {
        $this->requireCapability($request, 'usuarios');
        $permissions = DB::table('permisos_operacion')
            ->leftJoin('usuarios', 'usuarios.id', '=', 'permisos_operacion.usuario_id')
            ->whereNull('permisos_operacion.revocado_en')
            ->select([
                'permisos_operacion.*',
                'usuarios.username',
            ])
            ->orderBy('usuarios.username')
            ->orderBy('permisos_operacion.capacidad')
            ->get();
        return response()->json(['data' => $permissions]);
    }

    public function grantPermission(Request $request)
    {
        if (! Gate::forUser($request->user())->allows('manage.accounts')) {
            throw new HttpException(403, 'Solo administradores pueden delegar permisos operativos.');
        }
        $validated = $request->validate([
            'usuario_id' => ['required', 'integer', 'exists:usuarios,id'],
            'capacidad' => ['required', 'in:dashboard,usuarios,categorias,avisos,configuracion,auditoria,auditoria_exportar'],
            'alcance' => ['nullable', 'string', 'max:80'],
        ]);
        DB::table('permisos_operacion')->updateOrInsert([
            'usuario_id' => (int) $validated['usuario_id'],
            'capacidad' => $validated['capacidad'],
            'alcance' => $validated['alcance'] ?? 'global',
        ], [
            'otorgado_por' => $request->user()->id,
            'otorgado_en' => now(),
            'revocado_en' => null,
        ]);
        $this->audit($request, 'delegar_permiso', 'PermisoOperacion', (int) $validated['usuario_id'], $validated);
        return response()->json(['message' => 'Permiso operativo otorgado.'], 201);
    }

    public function revokePermission(Request $request, int $permiso)
    {
        if (! Gate::forUser($request->user())->allows('manage.accounts')) {
            throw new HttpException(403, 'Solo administradores pueden revocar permisos operativos.');
        }
        $permission = DB::table('permisos_operacion')->where('id', $permiso)->first();
        if (! $permission) {
            return response()->json(['message' => 'Permiso inexistente.', 'code' => 'NOT_FOUND'], 404);
        }
        DB::table('permisos_operacion')->where('id', $permiso)->update(['revocado_en' => now()]);
        $this->audit($request, 'revocar_permiso', 'PermisoOperacion', $permission->usuario_id, [
            'permiso_id' => $permiso,
            'capacidad' => $permission->capacidad,
        ]);
        return response()->json(['message' => 'Permiso operativo revocado.']);
    }

    public function auditLog(Request $request)
    {
        $this->requireCapability($request, 'auditoria');
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'recurso_tipo' => ['nullable', 'string', 'max:80'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);
        $query = DB::table('auditoria_moderacion')
            ->leftJoin('usuarios', 'usuarios.id', '=', 'auditoria_moderacion.actor_id')
            ->select([
                'auditoria_moderacion.*',
                'usuarios.username as actor',
            ])
            ->orderByDesc('auditoria_moderacion.fecha');
        if (! empty($validated['recurso_tipo'])) {
            $query->where('auditoria_moderacion.recurso_tipo', $validated['recurso_tipo']);
        }
        if (! empty($validated['q'])) {
            $term = '%'.trim($validated['q']).'%';
            $query->where(function ($where) use ($term): void {
                $where->where('auditoria_moderacion.accion', 'like', $term)
                    ->orWhere('usuarios.username', 'like', $term);
            });
        }
        $page = $query->paginate((int) ($validated['per_page'] ?? 20));
        return response()->json(['data' => $page->items(), 'meta' => ['total' => $page->total(), 'current_page' => $page->currentPage(), 'last_page' => $page->lastPage()]]);
    }

    public function exportAudit(Request $request)
    {
        $this->requireCapability($request, 'auditoria_exportar');
        $this->audit($request, 'exportar_auditoria', 'Auditoria', null, ['formato' => 'csv']);
        $rows = DB::table('auditoria_moderacion')
            ->leftJoin('usuarios', 'usuarios.id', '=', 'auditoria_moderacion.actor_id')
            ->select(['auditoria_moderacion.fecha', 'usuarios.username', 'auditoria_moderacion.accion', 'auditoria_moderacion.recurso_tipo', 'auditoria_moderacion.recurso_id', 'auditoria_moderacion.hash'])
            ->orderByDesc('auditoria_moderacion.fecha')
            ->limit(10000)
            ->get();
        $csv = fopen('php://temp', 'r+');
        fputcsv($csv, ['fecha', 'actor', 'accion', 'recurso_tipo', 'recurso_id', 'hash']);
        foreach ($rows as $row) {
            fputcsv($csv, [(string) $row->fecha, $row->username, $row->accion, $row->recurso_tipo, $row->recurso_id, $row->hash]);
        }
        rewind($csv);
        $content = stream_get_contents($csv);
        fclose($csv);
        return response($content, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="aegis-auditoria.csv"',
        ]);
    }
}
