<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductoResource;
use App\Models\Calificacion;
use App\Models\EnlacePerfil;
use App\Models\Producto;
use App\Models\Publicacion;
use App\Models\Seguimiento;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PerfilController extends Controller
{
    public function show(Request $request, int $usuario)
    {
        $profile = Usuario::query()
            ->select([
                'id',
                'nombre',
                'apellido',
                'username',
                'url_publica',
                'ciudad_aprox',
                'foto_perfil_url',
                'img_background_url',
                'descripcion',
                'reputacion',
                'fecha_registro',
                'perfil_privado',
                'mostrar_seguidores',
                'mostrar_presencia',
                'ultima_actividad',
                'publicacion_fijada_id',
            ])
            ->findOrFail($usuario);
        $profile->load(['enlaces', 'publicacionFijada']);

        $viewer = $request->user();
        if ($this->isBlocked($profile, $viewer)) {
            return response()->json([
                'message' => 'Este perfil no está disponible.',
                'code' => 'PROFILE_RESTRICTED',
            ], 403);
        }

        $ownProfile = $viewer && (int) $viewer->id === (int) $profile->id;
        $canViewPrivate = $ownProfile
            || ! (bool) $profile->perfil_privado
            || $this->isFollowingAccepted($viewer, $profile);

        if (! $canViewPrivate) {
            return response()->json([
                'message' => 'Este perfil es privado.',
                'code' => 'PROFILE_PRIVATE',
            ], 403);
        }

        $products = Producto::query()
            ->activo()
            ->where('visibilidad', 'publica')
            ->where('usuario_id', $profile->id)
            ->with([
                'categoria:id,nombre,descripcion',
                'vendedor:id,nombre,apellido,username,foto_perfil_url as foto_perfil,reputacion',
                'imagenes:id,producto_id,imagen,principal',
            ])
            ->latest('fecha_publicacion')
            ->limit(24)
            ->get();

        $posts = Publicacion::query()
            ->where('usuario_id', $profile->id)
            ->where('visibilidad', 'publica')
            ->when($profile->publicacion_fijada_id, fn ($query) => $query->whereKeyNot($profile->publicacion_fijada_id)
            )
            ->with([
                'imagenes:id,publicacion_id,imagen,orden',
                'comentarios' => fn ($query) => $query
                    ->with('usuario:id,nombre,username,foto_perfil_url as foto_perfil')
                    ->orderBy('fecha_comentario'),
            ])
            ->withCount('comentarios')
            ->latest('fecha_publicacion')
            ->limit(10)
            ->get(['id', 'usuario_id', 'titulo', 'contenido', 'fecha_publicacion']);
        $pinnedPost = $profile->publicacionFijada
            && (int) $profile->publicacion_fijada_id
            && (int) $profile->publicacionFijada->usuario_id === (int) $profile->id
            && $profile->publicacionFijada->visibilidad === 'publica'
                ? $profile->publicacionFijada
                    ->load(['imagenes:id,publicacion_id,imagen,orden'])
                    ->loadCount('comentarios')
                : null;

        return response()->json([
            'data' => [
                'perfil' => $this->publicInformationPayload($profile),
                'publicacion_fijada' => $pinnedPost,
                'productos' => ProductoResource::collection($products)->resolve(),
                'publicaciones' => $posts,
            ],
        ]);
    }

    public function own(Request $request)
    {
        $usuario = $request->user();
        $usuario->load(['enlaces', 'publicacionFijada']);

        return response()->json([
            'data' => [
                'perfil' => $this->privateProfilePayload($usuario),
                'actividad' => $this->activityPayload($usuario),
            ],
        ]);
    }

    public function updateOwn(Request $request)
    {
        $usuario = $request->user();
        $validated = $request->validate([
            'nombre' => ['sometimes', 'string', 'max:100'],
            'apellido' => ['sometimes', 'string', 'max:100'],
            'username' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-Z0-9_.-]+$/', 'unique:usuarios,username,'.($usuario->id)],
            'url_publica' => ['nullable', 'string', 'max:100', 'regex:/^[a-zA-Z0-9_-]+$/', 'unique:usuarios,url_publica,'.($usuario->id)],
            'descripcion' => ['nullable', 'string', 'max:1000'],
            'ciudad_aprox' => ['nullable', 'string', 'max:100'],
            'perfil_privado' => ['sometimes', 'boolean'],
            'mostrar_seguidores' => ['sometimes', 'boolean'],
            'mostrar_presencia' => ['sometimes', 'boolean'],
            'publicacion_fijada_id' => ['nullable', 'integer', 'exists:publicaciones_foro,id'],
            'enlaces' => ['sometimes', 'array', 'max:5'],
            'enlaces.*.tipo' => ['required_with:enlaces', 'in:web,instagram,x,linkedin,github,otro'],
            'enlaces.*.url' => ['required_with:enlaces', 'string', 'max:2048'],
        ]);

        if (array_key_exists('publicacion_fijada_id', $validated)) {
            $postId = $validated['publicacion_fijada_id'];
            if ($postId && ! Publicacion::query()
                ->whereKey($postId)
                ->where('usuario_id', $usuario->id)
                ->exists()) {
                throw ValidationException::withMessages([
                    'publicacion_fijada_id' => ['Solo puedes fijar una publicación propia.'],
                ]);
            }
        }

        $enlaces = $validated['enlaces'] ?? null;
        unset($validated['enlaces']);

        if (array_key_exists('url_publica', $validated) && $validated['url_publica']) {
            $validated['url_publica'] = Str::lower(trim($validated['url_publica']));
        }
        $usuario->update($validated);

        if (is_array($enlaces)) {
            foreach ($enlaces as $link) {
                $scheme = parse_url(trim($link['url']), PHP_URL_SCHEME);
                if (! in_array(strtolower((string) $scheme), ['http', 'https'], true)) {
                    throw ValidationException::withMessages([
                        'enlaces' => ['Solo se permiten enlaces HTTPS o HTTP.'],
                    ]);
                }
            }
            $usuario->enlaces()->delete();
            foreach (array_values($enlaces) as $index => $link) {
                EnlacePerfil::query()->create([
                    'usuario_id' => $usuario->id,
                    'tipo' => $link['tipo'],
                    'url' => trim($link['url']),
                    'orden' => $index,
                ]);
            }
        }

        $usuario->load(['enlaces', 'publicacionFijada']);
        $usuario->ultima_actividad = now();
        $usuario->save();

        return response()->json([
            'message' => 'Perfil actualizado.',
            'data' => [
                'perfil' => $this->privateProfilePayload($usuario),
                'actividad' => $this->activityPayload($usuario),
            ],
        ]);
    }

    public function tab(Request $request, int $usuario, string $tab)
    {
        $profile = Usuario::query()->findOrFail($usuario);
        $viewer = $request->user();
        if ($this->isBlocked($profile, $viewer)) {
            return response()->json(['message' => 'Perfil restringido.', 'code' => 'PROFILE_RESTRICTED'], 403);
        }
        if (! $this->canViewProfile($viewer, $profile)) {
            return response()->json(['message' => 'Este perfil es privado.', 'code' => 'PROFILE_PRIVATE'], 403);
        }

        $perPage = (int) $request->integer('per_page', 12);
        $perPage = max(1, min(50, $perPage));

        $allowed = ['publicaciones', 'productos', 'comunidades', 'resenas', 'informacion'];
        if (! in_array($tab, $allowed, true)) {
            return response()->json(['message' => 'Pestaña no válida.', 'code' => 'INVALID_TAB'], 404);
        }

        if ($tab === 'comunidades') {
            return response()->json([
                'data' => [],
                'meta' => ['current_page' => 1, 'per_page' => $perPage, 'total' => 0, 'last_page' => 1],
            ]);
        }

        if ($tab === 'informacion') {
            return response()->json(['data' => $this->publicInformationPayload($profile)]);
        }

        $query = match ($tab) {
            'publicaciones' => Publicacion::query()
                ->where('usuario_id', $profile->id)
                ->where('visibilidad', 'publica')
                ->with(['imagenes:id,publicacion_id,imagen,orden'])
                ->withCount('comentarios')
                ->latest('fecha_publicacion'),
            'productos' => Producto::query()
                ->activo()
                ->where('visibilidad', 'publica')
                ->where('usuario_id', $profile->id)
                ->with(['imagenes:id,producto_id,imagen,principal'])
                ->latest('fecha_publicacion'),
            'resenas' => Calificacion::query()
                ->where('receptor_id', $profile->id)
                ->with('autor:id,nombre,apellido,username,foto_perfil_url')
                ->latest('fecha_calificacion'),
        };
        $page = $query->paginate($perPage);

        if ($tab === 'productos') {
            $items = $page->getCollection()->map(
                fn (Producto $producto) => (new ProductoResource($producto))->resolve($request),
            );
            $page->setCollection($items);
        }

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

    public function follow(Request $request, int $usuario)
    {
        $viewer = $request->user();
        $profile = Usuario::query()->findOrFail($usuario);
        if ($viewer->id === $profile->id) {
            return response()->json(['message' => 'No puedes seguirte a ti mismo.', 'code' => 'INVALID_RELATION'], 422);
        }
        if ($this->isBlocked($profile, $viewer)) {
            return response()->json(['message' => 'No puedes seguir este perfil.', 'code' => 'PROFILE_RESTRICTED'], 403);
        }

        $estado = $profile->perfil_privado ? 'pendiente' : 'aceptado';
        Seguimiento::query()->updateOrCreate(
            ['seguidor_id' => $viewer->id, 'seguido_id' => $profile->id],
            ['estado' => $estado],
        );

        return response()->json([
            'message' => $estado === 'pendiente' ? 'Solicitud enviada.' : 'Ahora sigues a esta cuenta.',
            'data' => ['estado' => $estado],
        ], 201);
    }

    public function unfollow(Request $request, int $usuario)
    {
        Seguimiento::query()
            ->where('seguidor_id', $request->user()->id)
            ->where('seguido_id', $usuario)
            ->delete();

        return response()->json(['message' => 'Dejaste de seguir esta cuenta.']);
    }

    public function followers(Request $request, int $usuario)
    {
        $profile = Usuario::query()->findOrFail($usuario);
        if (! $this->canViewProfile($request->user(), $profile)
            || ! $profile->mostrar_seguidores
        ) {
            return response()->json([
                'message' => 'La lista de seguidores no está disponible.',
                'code' => 'PROFILE_RESTRICTED',
            ], 403);
        }

        $followers = Usuario::query()
            ->whereHas('seguimientoRecibido', fn ($query) => $query
                ->where('estado', 'aceptado'))
            ->whereIn('id', DB::table('seguimientos')
                ->where('seguido_id', $profile->id)
                ->where('estado', 'aceptado')
                ->pluck('seguidor_id'))
            ->select(['id', 'nombre', 'apellido', 'username', 'foto_perfil_url'])
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json([
            'data' => $followers->items(),
            'meta' => [
                'current_page' => $followers->currentPage(),
                'per_page' => $followers->perPage(),
                'total' => $followers->total(),
                'last_page' => $followers->lastPage(),
            ],
        ]);
    }

    public function following(Request $request, int $usuario)
    {
        $profile = Usuario::query()->findOrFail($usuario);
        if (! $this->canViewProfile($request->user(), $profile)
            || ! $profile->mostrar_seguidores
        ) {
            return response()->json([
                'message' => 'La lista de seguidos no está disponible.',
                'code' => 'PROFILE_RESTRICTED',
            ], 403);
        }

        $following = Usuario::query()
            ->whereIn('id', DB::table('seguimientos')
                ->where('seguidor_id', $profile->id)
                ->where('estado', 'aceptado')
                ->pluck('seguido_id'))
            ->select(['id', 'nombre', 'apellido', 'username', 'foto_perfil_url'])
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json([
            'data' => $following->items(),
            'meta' => [
                'current_page' => $following->currentPage(),
                'per_page' => $following->perPage(),
                'total' => $following->total(),
                'last_page' => $following->lastPage(),
            ],
        ]);
    }

    public function restrict(Request $request, int $usuario)
    {
        $validated = $request->validate([
            'tipo' => ['required', 'in:bloqueo,silencio'],
        ]);
        DB::table('bloqueos_usuario')->updateOrInsert(
            [
                'bloqueador_id' => $request->user()->id,
                'bloqueado_id' => $usuario,
                'tipo' => $validated['tipo'],
            ],
            ['updated_at' => now(), 'created_at' => now()],
        );

        return response()->json([
            'message' => $validated['tipo'] === 'bloqueo'
                ? 'Usuario bloqueado.'
                : 'Usuario silenciado.',
            'data' => ['tipo' => $validated['tipo']],
        ]);
    }

    public function unrestrict(Request $request, int $usuario)
    {
        DB::table('bloqueos_usuario')
            ->where('bloqueador_id', $request->user()->id)
            ->where('bloqueado_id', $usuario)
            ->delete();

        return response()->json(['message' => 'Restricciones eliminadas.']);
    }

    public function deactivate(Request $request)
    {
        $usuario = $request->user();
        DB::table('desactivaciones_usuario')->updateOrInsert(
            ['usuario_id' => $usuario->id, 'estado' => 'pendiente_retencion'],
            [
                'programada_para' => now()->addDays(30),
                'updated_at' => now(),
                'created_at' => now(),
            ],
        );
        $usuario->tokens()->delete();

        return response()->json([
            'message' => 'Desactivación solicitada. Los datos se conservan durante 30 días.',
            'code' => 'DEACTIVATION_PENDING',
        ]);
    }

    private function privateProfilePayload(Usuario $usuario): array
    {
        return [
            'id' => $usuario->id,
            'nombre' => $usuario->nombre,
            'apellido' => $usuario->apellido,
            'username' => $usuario->username,
            'url_publica' => $usuario->url_publica,
            'ciudad_aprox' => $usuario->ciudad_aprox,
            'descripcion' => $usuario->descripcion,
            'foto_perfil_url' => $usuario->foto_perfil_url,
            'img_background_url' => $usuario->img_background_url,
            'reputacion' => $usuario->reputacion,
            'perfil_privado' => (bool) $usuario->perfil_privado,
            'mostrar_seguidores' => (bool) $usuario->mostrar_seguidores,
            'mostrar_presencia' => (bool) $usuario->mostrar_presencia,
            'ultima_actividad' => $usuario->mostrar_presencia
                ? $usuario->ultima_actividad?->toISOString()
                : null,
            'publicacion_fijada_id' => $usuario->publicacion_fijada_id,
            'enlaces' => $usuario->enlaces->map(fn (EnlacePerfil $link) => [
                'tipo' => $link->tipo,
                'url' => $link->url,
                'orden' => $link->orden,
            ])->values(),
        ];
    }

    private function publicInformationPayload(Usuario $profile): array
    {
        $payload = [
            'id' => $profile->id,
            'nombre' => $profile->nombre,
            'apellido' => $profile->apellido,
            'username' => $profile->username,
            'url_publica' => $profile->url_publica,
            'ciudad_aprox' => $profile->ciudad_aprox,
            'descripcion' => $profile->descripcion,
            'foto_perfil_url' => $profile->foto_perfil_url,
            'img_background_url' => $profile->img_background_url,
            'reputacion' => $profile->reputacion,
            'fecha_registro' => $profile->fecha_registro,
            'mostrar_presencia' => (bool) $profile->mostrar_presencia,
            'ultima_actividad' => $profile->mostrar_presencia
                ? $profile->ultima_actividad
                : null,
            'enlaces' => $profile->relationLoaded('enlaces')
                ? $profile->enlaces->map(fn (EnlacePerfil $link) => [
                    'tipo' => $link->tipo,
                    'url' => $link->url,
                ])->values()
                : [],
        ];

        if ($profile->mostrar_seguidores) {
            $payload['seguidores'] = Seguimiento::query()
                ->where('seguido_id', $profile->id)
                ->where('estado', 'aceptado')
                ->count();
            $payload['siguiendo'] = Seguimiento::query()
                ->where('seguidor_id', $profile->id)
                ->where('estado', 'aceptado')
                ->count();
        }

        return $payload;
    }

    private function activityPayload(Usuario $usuario): array
    {
        return [
            'publicaciones' => Publicacion::query()->where('usuario_id', $usuario->id)->count(),
            'productos' => Producto::query()->where('usuario_id', $usuario->id)->count(),
            'resenas' => Calificacion::query()->where('receptor_id', $usuario->id)->count(),
            'interacciones' => DB::table('comentarios_foro')
                ->where('usuario_id', $usuario->id)
                ->count(),
        ];
    }

    private function canViewProfile(?Usuario $viewer, Usuario $profile): bool
    {
        $ownProfile = $viewer && (int) $viewer->id === (int) $profile->id;

        return $ownProfile
            || ! (bool) $profile->perfil_privado
            || $this->isFollowingAccepted($viewer, $profile);
    }

    private function isFollowingAccepted(?Usuario $viewer, Usuario $profile): bool
    {
        return $viewer
            ? Seguimiento::query()
                ->where('seguidor_id', $viewer->id)
                ->where('seguido_id', $profile->id)
                ->where('estado', 'aceptado')
                ->exists()
            : false;
    }

    private function isBlocked(Usuario $profile, ?Usuario $viewer): bool
    {
        if (! $viewer) {
            return false;
        }

        return DB::table('bloqueos_usuario')
            ->where('tipo', 'bloqueo')
            ->where(function ($query) use ($profile, $viewer): void {
                $query->where(function ($sub) use ($profile, $viewer): void {
                    $sub->where('bloqueador_id', $profile->id)
                        ->where('bloqueado_id', $viewer->id);
                })->orWhere(function ($sub) use ($profile, $viewer): void {
                    $sub->where('bloqueador_id', $viewer->id)
                        ->where('bloqueado_id', $profile->id);
                });
            })
            ->exists();
    }
}
