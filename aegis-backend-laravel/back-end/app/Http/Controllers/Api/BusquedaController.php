<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comunidad;
use App\Models\Producto;
use App\Models\Publicacion;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BusquedaController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:200'],
            'entidad' => ['nullable', 'in:todos,productos,publicaciones,personas,comunidades'],
            'categoria' => ['nullable', 'string', 'max:100'],
            'ciudad' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);
        $term = trim($validated['q']);
        $like = '%'.$term.'%';
        $entity = $validated['entidad'] ?? 'todos';
        $perPage = $validated['per_page'] ?? 20;

        $results = [];
        if (in_array($entity, ['todos', 'productos'], true)) {
            $products = Producto::query()
                ->activo()
                ->where('visibilidad', 'publica')
                ->where(fn ($q) => $q
                    ->where('titulo', 'like', $like)
                    ->orWhere('descripcion', 'like', $like))
                ->when(! empty($validated['categoria']), fn ($q) => $q
                    ->whereHas('categoria', fn ($cat) => $cat
                        ->where('nombre', 'like', '%'.$validated['categoria'].'%')))
                ->when(! empty($validated['ciudad']), fn ($q) => $q
                    ->where('ciudad_aprox', 'like', '%'.$validated['ciudad'].'%'))
                ->with([
                    'categoria:id,nombre',
                    'imagenes:id,producto_id,imagen,principal',
                ])
                ->latest('fecha_publicacion')
                ->limit($perPage)
                ->get()
                ->map(fn (Producto $p) => [
                    'tipo' => 'producto',
                    'id' => $p->id,
                    'titulo' => $p->titulo,
                    'descripcion' => $p->descripcion,
                    'precio' => $p->precio,
                    'estado' => $p->estado_publicacion,
                    'imagen' => $p->imagenes->firstWhere('principal', true)?->imagen
                        ?? $p->imagenes->first()?->imagen,
                    'destino' => '/productos/detalle?id='.$p->id,
                ]);
            $results['productos'] = $products;
        }

        if (in_array($entity, ['todos', 'publicaciones'], true)) {
            $posts = Publicacion::query()
                ->where('estado', 'publicado')
                ->where('visibilidad', 'publica')
                ->where(fn ($q) => $q
                    ->where('titulo', 'like', $like)
                    ->orWhere('contenido', 'like', $like))
                ->latest('fecha_publicacion')
                ->limit($perPage)
                ->get(['id', 'titulo', 'contenido', 'tipo', 'fecha_publicacion'])
                ->map(fn (Publicacion $post) => [
                    'tipo' => 'publicacion',
                    'id' => $post->id,
                    'titulo' => $post->titulo,
                    'descripcion' => substr(strip_tags($post->contenido), 0, 180),
                    'estado' => $post->tipo,
                    'destino' => '/publicacion?id='.$post->id,
                ]);
            $results['publicaciones'] = $posts;
        }

        if (in_array($entity, ['todos', 'personas'], true)) {
            $people = Usuario::query()
                ->where('estado', 'activo')
                ->where('perfil_privado', false)
                ->where(fn ($q) => $q
                    ->where('nombre', 'like', $like)
                    ->orWhere('apellido', 'like', $like)
                    ->orWhere('username', 'like', $like))
                ->limit($perPage)
                ->get(['id', 'nombre', 'apellido', 'username', 'foto_perfil_url'])
                ->map(fn (Usuario $user) => [
                    'tipo' => 'persona',
                    'id' => $user->id,
                    'titulo' => trim($user->nombre.' '.$user->apellido),
                    'descripcion' => '@'.$user->username,
                    'estado' => 'publico',
                    'destino' => '/perfil?id='.$user->id,
                ]);
            $results['personas'] = $people;
        }

        if (in_array($entity, ['todos', 'comunidades'], true)) {
            $communities = Comunidad::query()
                ->where('estado', 'activa')
                ->whereIn('visibilidad', ['publica', 'invitacion'])
                ->where(fn ($q) => $q
                    ->where('nombre', 'like', $like)
                    ->orWhere('descripcion', 'like', $like))
                ->latest('fecha_creacion')
                ->limit($perPage)
                ->get(['id', 'nombre', 'descripcion', 'categoria', 'visibilidad'])
                ->map(fn (Comunidad $community) => [
                    'tipo' => 'comunidad',
                    'id' => $community->id,
                    'titulo' => $community->nombre,
                    'descripcion' => $community->descripcion,
                    'estado' => $community->visibilidad,
                    'destino' => '/comunidades?id='.$community->id,
                ]);
            $results['comunidades'] = $communities;
        }

        DB::table('historial_busqueda')->insert([
            'usuario_id' => $request->user()?->id,
            'sesion_key' => $request->header('X-AEGIS-Session'),
            'termino' => $term,
            'entidad' => $entity,
            'fecha' => now(),
        ]);

        $total = collect($results)->flatten(1)->count();

        return response()->json([
            'data' => $results,
            'meta' => [
                'q' => $term,
                'entidad' => $entity,
                'total' => $total,
            ],
        ]);
    }

    public function suggestions(Request $request)
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:100'],
        ]);
        $like = '%'.$validated['q'].'%';
        $suggestions = [];
        $suggestions = array_merge(
            $suggestions,
            Producto::query()
                ->activo()
                ->where('visibilidad', 'publica')
                ->where('titulo', 'like', $like)
                ->limit(5)
                ->pluck('titulo')
                ->map(fn ($title) => ['tipo' => 'producto', 'titulo' => $title])
                ->all(),
        );
        $suggestions = array_merge(
            $suggestions,
            Usuario::query()
                ->where('estado', 'activo')
                ->where('perfil_privado', false)
                ->where('username', 'like', $like)
                ->limit(5)
                ->pluck('username')
                ->map(fn ($username) => ['tipo' => 'persona', 'titulo' => '@'.$username])
                ->all(),
        );
        $suggestions = array_slice($suggestions, 0, 10);

        return response()->json(['data' => $suggestions]);
    }

    public function savedIndex(Request $request)
    {
        $saved = DB::table('busquedas_guardadas')
            ->where('usuario_id', $request->user()->id)
            ->orderByDesc('updated_at')
            ->get();

        return response()->json(['data' => $saved]);
    }

    public function saveSearch(Request $request)
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:150'],
            'termino' => ['nullable', 'string', 'max:200'],
            'entidad' => ['required', 'in:todos,productos,publicaciones,personas,comunidades'],
            'filtros' => ['nullable', 'array'],
            'alerta_activa' => ['sometimes', 'boolean'],
            'frecuencia' => ['nullable', 'in:diaria,semanal'],
        ]);
        $existing = DB::table('busquedas_guardadas')
            ->where('usuario_id', $request->user()->id)
            ->where('nombre', trim($validated['nombre']))
            ->first();
        if ($existing) {
            return response()->json(['message' => 'Ya existe una búsqueda con ese nombre.', 'code' => 'SAVED_SEARCH_EXISTS'], 409);
        }

        $id = DB::table('busquedas_guardadas')->insertGetId([
            'usuario_id' => $request->user()->id,
            'nombre' => trim($validated['nombre']),
            'termino' => $validated['termino'] ?? null,
            'entidad' => $validated['entidad'],
            'filtros' => json_encode($validated['filtros'] ?? []),
            'alerta_activa' => $validated['alerta_activa'] ?? false,
            'frecuencia' => $validated['frecuencia'] ?? 'diaria',
            'ultima_revision' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['data' => DB::table('busquedas_guardadas')->find($id)], 201);
    }

    public function deleteSaved(Request $request, int $busqueda)
    {
        DB::table('busquedas_guardadas')
            ->where('id', $busqueda)
            ->where('usuario_id', $request->user()->id)
            ->delete();

        return response()->json(['message' => 'Búsqueda guardada eliminada.']);
    }

    public function recent(Request $request)
    {
        $recent = DB::table('historial_busqueda')
            ->where('usuario_id', $request->user()->id)
            ->where('termino', '!=', '')
            ->orderByDesc('fecha')
            ->limit(20)
            ->get(['termino', 'entidad', 'fecha']);

        return response()->json(['data' => $recent]);
    }

    public function trends(Request $request)
    {
        $days = (int) $request->integer('dias', 7);
        $days = max(1, min(30, $days));
        $trends = DB::table('historial_busqueda')
            ->where('fecha', '>=', now()->subDays($days))
            ->selectRaw('LOWER(termino) as termino, COUNT(*) as apariciones')
            ->groupBy('termino')
            ->orderByDesc('apariciones')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => $trends,
            'ventana_dias' => $days,
            'nota' => 'Tendencias agregadas sin exponer identidades ni perfiles privados.',
        ]);
    }

    public function preference(Request $request)
    {
        $validated = $request->validate([
            'tipo' => ['required', 'in:categoria,comunidad,persona,producto'],
            'valor' => ['required', 'string', 'max:100'],
            'accion' => ['required', 'in:interes,silenciar,no_interesa'],
        ]);
        DB::table('preferencias_busqueda')->updateOrInsert(
            [
                'usuario_id' => $request->user()->id,
                'tipo' => $validated['tipo'],
                'valor' => $validated['valor'],
            ],
            [
                'accion' => $validated['accion'],
                'updated_at' => now(),
                'created_at' => now(),
            ],
        );

        return response()->json(['data' => $validated]);
    }

    public function recommendations(Request $request)
    {
        $preferences = DB::table('preferencias_busqueda')
            ->where('usuario_id', $request->user()->id)
            ->whereIn('accion', ['interes', 'silenciar'])
            ->get();
        $categories = $preferences
            ->where('tipo', 'categoria')
            ->where('accion', 'interes')
            ->pluck('valor');

        $query = Producto::query()
            ->activo()
            ->where('visibilidad', 'publica')
            ->with(['categoria:id,nombre', 'imagenes:id,producto_id,imagen,principal']);
        if ($categories->isNotEmpty()) {
            $query->whereHas('categoria', fn ($cat) => $cat
                ->whereIn('nombre', $categories));
        }
        $muted = $preferences
            ->where('tipo', 'categoria')
            ->whereIn('accion', ['silenciar', 'no_interesa'])
            ->pluck('valor');
        if ($muted->isNotEmpty()) {
            $query->whereHas('categoria', fn ($cat) => $cat
                ->whereNotIn('nombre', $muted));
        }
        $products = $query->latest('fecha_publicacion')->limit(12)->get();

        return response()->json([
            'data' => $products,
            'criterio' => $categories->isNotEmpty()
                ? 'Categorías marcadas como interés'
                : 'Productos recientes no silenciados',
        ]);
    }
}
