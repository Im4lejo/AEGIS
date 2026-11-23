<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccionComunidad;
use App\Models\Comunidad;
use App\Models\MembresiaComunidad;
use App\Models\Publicacion;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ComunidadController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'busqueda' => ['nullable', 'string', 'max:100'],
            'categoria' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = Comunidad::query()
            ->where('estado', 'activa')
            ->whereIn('visibilidad', ['publica', 'invitacion'])
            ->withCount([
                'membresias as miembros_count' => fn ($q) => $q->where('estado', 'activo'),
            ]);

        if (! empty($validated['busqueda'])) {
            $term = '%'.$validated['busqueda'].'%';
            $query->where(fn ($q) => $q
                ->where('nombre', 'like', $term)
                ->orWhere('descripcion', 'like', $term));
        }
        if (! empty($validated['categoria'])) {
            $query->where('categoria', $validated['categoria']);
        }

        $communities = $query
            ->orderByDesc('fecha_creacion')
            ->paginate($validated['per_page'] ?? 20);

        return response()->json([
            'data' => $communities->items(),
            'meta' => [
                'current_page' => $communities->currentPage(),
                'per_page' => $communities->perPage(),
                'total' => $communities->total(),
                'last_page' => $communities->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:150', 'unique:comunidades,nombre'],
            'descripcion' => ['nullable', 'string', 'max:5000'],
            'normas' => ['nullable', 'string', 'max:10000'],
            'categoria' => ['nullable', 'string', 'max:100'],
            'visibilidad' => ['required', 'in:publica,privada,invitacion'],
            'avisos_activos' => ['sometimes', 'boolean'],
        ]);

        $baseSlug = Str::slug($validated['nombre']);
        $slug = $baseSlug;
        $suffix = 2;
        while (Comunidad::query()->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$suffix++;
        }

        $community = Comunidad::query()->create([
            ...$validated,
            'owner_id' => $request->user()->id,
            'slug' => $slug,
        ]);

        MembresiaComunidad::query()->create([
            'comunidad_id' => $community->id,
            'usuario_id' => $request->user()->id,
            'rol' => 'owner',
            'estado' => 'activo',
            'fecha_union' => now(),
        ]);

        $this->audit($community, $request->user(), 'crear', null, ['slug' => $slug]);

        return response()->json([
            'message' => 'Comunidad creada.',
            'data' => $this->communityPayload($community, $request->user()),
        ], 201);
    }

    public function show(Request $request, int $comunidad)
    {
        $community = Comunidad::query()->withCount([
            'membresias as miembros_count' => fn ($q) => $q->where('estado', 'activo'),
        ])->findOrFail($comunidad);

        $membership = $this->getMembership($community, $request->user());
        if (
            $community->visibilidad === 'privada'
            && ! $this->canViewCommunity($community, $request->user(), $membership)
        ) {
            return response()->json([
                'message' => 'Esta comunidad es privada.',
                'code' => 'COMMUNITY_PRIVATE',
            ], 403);
        }

        return response()->json([
            'data' => $this->communityPayload($community, $request->user(), $membership),
        ]);
    }

    public function update(Request $request, int $comunidad)
    {
        $community = Comunidad::query()->findOrFail($comunidad);
        $this->authorizeManager($community, $request->user());

        $validated = $request->validate([
            'nombre' => ['sometimes', 'string', 'max:150', 'unique:comunidades,nombre,'.($community->id)],
            'descripcion' => ['nullable', 'string', 'max:5000'],
            'normas' => ['nullable', 'string', 'max:10000'],
            'categoria' => ['nullable', 'string', 'max:100'],
            'visibilidad' => ['sometimes', 'in:publica,privada,invitacion'],
            'avisos_activos' => ['sometimes', 'boolean'],
        ]);

        if (isset($validated['nombre'])) {
            $validated['slug'] = Str::slug($validated['nombre']);
        }
        $community->update($validated);
        $this->audit($community, $request->user(), 'editar', null);

        return response()->json([
            'message' => 'Comunidad actualizada.',
            'data' => $this->communityPayload($community, $request->user()),
        ]);
    }

    public function archive(Request $request, int $comunidad)
    {
        $community = Comunidad::query()->findOrFail($comunidad);
        $this->authorizeOwner($community, $request->user());
        $community->update(['estado' => 'archivada']);
        $this->audit($community, $request->user(), 'archivar', null);

        return response()->json([
            'message' => 'Comunidad archivada.',
            'data' => $this->communityPayload($community, $request->user()),
        ]);
    }

    public function membershipAction(Request $request, int $comunidad)
    {
        $community = Comunidad::query()->findOrFail($comunidad);
        $user = $request->user();

        if ($community->estado !== 'activa') {
            return response()->json(['message' => 'La comunidad no está activa.', 'code' => 'COMMUNITY_CLOSED'], 409);
        }

        $membership = MembresiaComunidad::query()
            ->where('comunidad_id', $community->id)
            ->where('usuario_id', $user->id)
            ->first();

        if ($membership && in_array($membership->estado, ['activo', 'invitado'], true)) {
            return response()->json([
                'message' => 'Ya perteneces o tienes una invitación pendiente.',
                'code' => 'ALREADY_MEMBER',
            ], 409);
        }
        if ($membership && $membership->estado === 'baneado') {
            return response()->json(['message' => 'No puedes unirte a esta comunidad.', 'code' => 'COMMUNITY_BANNED'], 403);
        }

        $state = 'activo';
        $role = 'miembro';
        if ($community->visibilidad === 'privada') {
            $state = 'solicitado';
        } elseif ($membership && $membership->estado === 'invitado') {
            $state = 'activo';
        }

        MembresiaComunidad::query()->updateOrCreate(
            ['comunidad_id' => $community->id, 'usuario_id' => $user->id],
            [
                'rol' => $role,
                'estado' => $state,
                'fecha_union' => $state === 'activo' ? now() : null,
                'fecha_solicitud' => $state === 'solicitado' ? now() : null,
            ],
        );

        $this->audit($community, $user, $state === 'solicitado' ? 'solicitar_membresia' : 'unirse', $user);

        return response()->json([
            'message' => $state === 'solicitado'
                ? 'Solicitud enviada.'
                : 'Te has unido a la comunidad.',
            'data' => ['estado' => $state, 'rol' => $role],
        ], 201);
    }

    public function leave(Request $request, int $comunidad)
    {
        $community = Comunidad::query()->findOrFail($comunidad);
        $membership = MembresiaComunidad::query()
            ->where('comunidad_id', $community->id)
            ->where('usuario_id', $request->user()->id)
            ->first();

        if (! $membership || $membership->rol === 'owner') {
            throw ValidationException::withMessages([
                'comunidad' => ['El propietario no puede salir; debe transferir o archivar la comunidad.'],
            ]);
        }

        $membership->update(['estado' => 'salido']);
        $this->audit($community, $request->user(), 'salir', $request->user());

        return response()->json(['message' => 'Has salido de la comunidad.']);
    }

    public function pending(Request $request, int $comunidad)
    {
        $community = Comunidad::query()->findOrFail($comunidad);
        $this->authorizeManager($community, $request->user());

        $pending = $community->membresias()
            ->where('estado', 'solicitado')
            ->with('usuario:id,nombre,apellido,username,foto_perfil_url')
            ->orderByDesc('fecha_solicitud')
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json([
            'data' => $pending->items(),
            'meta' => [
                'current_page' => $pending->currentPage(),
                'per_page' => $pending->perPage(),
                'total' => $pending->total(),
                'last_page' => $pending->lastPage(),
            ],
        ]);
    }

    public function decideMembership(Request $request, int $comunidad, int $usuario)
    {
        $community = Comunidad::query()->findOrFail($comunidad);
        $this->authorizeManager($community, $request->user());
        $validated = $request->validate([
            'decision' => ['required', 'in:aprobar,rechazar,expulsar,baneo'],
        ]);

        $membership = MembresiaComunidad::query()
            ->where('comunidad_id', $community->id)
            ->where('usuario_id', $usuario)
            ->first();
        if (! $membership) {
            throw ValidationException::withMessages([
                'usuario' => ['La membresía no existe.'],
            ]);
        }
        if ($membership->rol === 'owner') {
            throw ValidationException::withMessages([
                'usuario' => ['No se puede moderar al propietario.'],
            ]);
        }

        $state = match ($validated['decision']) {
            'aprobar' => 'activo',
            'rechazar' => 'salido',
            'expulsar' => 'expulsado',
            'baneo' => 'baneado',
        };
        $membership->update([
            'estado' => $state,
            'fecha_union' => $state === 'activo' ? now() : null,
        ]);
        $this->audit($community, $request->user(), $validated['decision'], Usuario::find($usuario));

        return response()->json([
            'message' => 'Decisión aplicada.',
            'data' => ['estado' => $state],
        ]);
    }

    public function invite(Request $request, int $comunidad)
    {
        $community = Comunidad::query()->findOrFail($comunidad);
        $this->authorizeManager($community, $request->user());
        $validated = $request->validate([
            'usuario_id' => ['required', 'integer', 'exists:usuarios,id'],
        ]);

        MembresiaComunidad::query()->updateOrCreate(
            ['comunidad_id' => $community->id, 'usuario_id' => $validated['usuario_id']],
            ['rol' => 'miembro', 'estado' => 'invitado', 'fecha_solicitud' => now()],
        );
        $this->audit($community, $request->user(), 'invitar', Usuario::find($validated['usuario_id']));

        return response()->json(['message' => 'Invitación creada.', 'data' => ['estado' => 'invitado']], 201);
    }

    public function members(Request $request, int $comunidad)
    {
        $community = Comunidad::query()->findOrFail($comunidad);
        $membership = $this->getMembership($community, $request->user());
        if (! $this->canViewCommunity($community, $request->user(), $membership)) {
            return response()->json(['message' => 'Sin acceso.', 'code' => 'COMMUNITY_PRIVATE'], 403);
        }

        $members = $community->membresias()
            ->where('estado', 'activo')
            ->with('usuario:id,nombre,apellido,username,foto_perfil_url')
            ->orderByRaw("FIELD(rol, 'owner', 'moderador', 'miembro')")
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json([
            'data' => $members->items(),
            'meta' => [
                'current_page' => $members->currentPage(),
                'per_page' => $members->perPage(),
                'total' => $members->total(),
                'last_page' => $members->lastPage(),
            ],
        ]);
    }

    public function posts(Request $request, int $comunidad)
    {
        $community = Comunidad::query()->findOrFail($comunidad);
        $membership = $this->getMembership($community, $request->user());
        if (! $this->canViewCommunity($community, $request->user(), $membership)) {
            return response()->json(['message' => 'Sin acceso.', 'code' => 'COMMUNITY_PRIVATE'], 403);
        }

        $postsQuery = $community->publicaciones()
            ->where('estado', 'publicado')
            ->with(['usuario:id,nombre,apellido,username,foto_perfil_url', 'imagenes:id,publicacion_id,imagen,orden'])
            ->withCount(['comentarios', 'reacciones']);
        if ($community->visibilidad === 'publica') {
            $postsQuery->where('visibilidad', 'publica');
        }
        $posts = $postsQuery
            ->orderByDesc('fijada')
            ->orderByDesc('fecha_publicacion')
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json([
            'data' => $posts->items(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
                'last_page' => $posts->lastPage(),
            ],
        ]);
    }

    public function storePost(Request $request, int $comunidad)
    {
        $community = Comunidad::query()->findOrFail($comunidad);
        $membership = MembresiaComunidad::query()
            ->where('comunidad_id', $community->id)
            ->where('usuario_id', $request->user()->id)
            ->where('estado', 'activo')
            ->first();
        if (! $membership) {
            return response()->json(['message' => 'Debes ser miembro.', 'code' => 'COMMUNITY_MEMBERSHIP_REQUIRED'], 403);
        }
        if ($community->estado !== 'activa') {
            return response()->json(['message' => 'La comunidad está cerrada.', 'code' => 'COMMUNITY_CLOSED'], 403);
        }

        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:200'],
            'contenido' => ['required', 'string', 'max:5000'],
            'visibilidad' => ['sometimes', 'in:publica,privada,grupo_privado'],
        ]);

        $post = Publicacion::query()->create([
            'usuario_id' => $request->user()->id,
            'comunidad_id' => $community->id,
            'titulo' => trim($validated['titulo']),
            'contenido' => trim($validated['contenido']),
            'visibilidad' => $community->visibilidad === 'publica'
                ? ($validated['visibilidad'] ?? 'publica')
                : 'grupo_privado',
            'estado' => 'publicado',
        ]);

        $this->audit($community, $request->user(), 'publicar_post', null, ['publicacion_id' => $post->id]);

        return response()->json(['data' => $post], 201);
    }

    public function suggestions(Request $request)
    {
        $category = $request->string('categoria')->toString();
        $query = Comunidad::query()
            ->where('estado', 'activa')
            ->whereIn('visibilidad', ['publica', 'invitacion'])
            ->withCount([
                'membresias as miembros_count' => fn ($q) => $q->where('estado', 'activo'),
            ]);

        if ($category !== '') {
            $query->orderByRaw('CASE WHEN categoria = ? THEN 0 ELSE 1 END', [$category])
                ->orderByDesc('miembros_count');
        } else {
            $query->orderByDesc('fecha_creacion');
        }

        return response()->json([
            'data' => $query->limit(10)->get(),
            'criterio' => $category !== ''
                ? 'misma categoría y mayor número de miembros'
                : 'comunidad activa más reciente',
        ]);
    }

    public function auditLog(Request $request, int $comunidad)
    {
        $community = Comunidad::query()->findOrFail($comunidad);
        $this->authorizeManager($community, $request->user());

        $actions = $community->acciones()
            ->with([
                'actor:id,nombre,apellido,username',
                'objetivo:id,nombre,apellido,username',
            ])
            ->latest('fecha')
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json([
            'data' => $actions->items(),
            'meta' => [
                'current_page' => $actions->currentPage(),
                'per_page' => $actions->perPage(),
                'total' => $actions->total(),
                'last_page' => $actions->lastPage(),
            ],
        ]);
    }

    private function getMembership(Comunidad $community, ?Usuario $user): ?MembresiaComunidad
    {
        return $user
            ? MembresiaComunidad::query()
                ->where('comunidad_id', $community->id)
                ->where('usuario_id', $user->id)
                ->first()
            : null;
    }

    private function canViewCommunity(
        Comunidad $community,
        ?Usuario $user,
        ?MembresiaComunidad $membership,
    ): bool {
        if ($community->visibilidad !== 'privada') {
            return true;
        }

        return $membership
            && $membership->estado === 'activo'
            && in_array($membership->rol, ['owner', 'moderador', 'miembro'], true);
    }

    private function authorizeManager(Comunidad $community, Usuario $user): void
    {
        $membership = MembresiaComunidad::query()
            ->where('comunidad_id', $community->id)
            ->where('usuario_id', $user->id)
            ->where('estado', 'activo')
            ->first();

        if (! $membership || ! in_array($membership->rol, ['owner', 'moderador'], true)) {
            throw ValidationException::withMessages([
                'comunidad' => ['Solo el propietario o moderador puede realizar esta acción.'],
            ]);
        }
    }

    private function authorizeOwner(Comunidad $community, Usuario $user): void
    {
        $membership = MembresiaComunidad::query()
            ->where('comunidad_id', $community->id)
            ->where('usuario_id', $user->id)
            ->where('estado', 'activo')
            ->where('rol', 'owner')
            ->exists();

        if (! $membership) {
            throw ValidationException::withMessages([
                'comunidad' => ['Solo el propietario puede realizar esta acción.'],
            ]);
        }
    }

    private function communityPayload(
        Comunidad $community,
        ?Usuario $user,
        ?MembresiaComunidad $membership = null,
    ): array {
        $membership = $membership ?? $this->getMembership($community, $user);

        return [
            'id' => $community->id,
            'nombre' => $community->nombre,
            'slug' => $community->slug,
            'descripcion' => $community->descripcion,
            'normas' => $community->normas,
            'categoria' => $community->categoria,
            'visibilidad' => $community->visibilidad,
            'estado' => $community->estado,
            'icono_url' => $community->icono_url,
            'portada_url' => $community->portada_url,
            'avisos_activos' => (bool) $community->avisos_activos,
            'fecha_creacion' => $community->fecha_creacion,
            'miembros_count' => $community->miembros_count
                ?? $community->membresias()->where('estado', 'activo')->count(),
            'membership' => $membership
                ? ['rol' => $membership->rol, 'estado' => $membership->estado]
                : null,
        ];
    }

    private function audit(
        Comunidad $community,
        Usuario $actor,
        string $accion,
        ?Usuario $objetivo,
        array $datos = [],
    ): void {
        AccionComunidad::query()->create([
            'comunidad_id' => $community->id,
            'actor_id' => $actor->id,
            'objetivo_id' => $objetivo?->id,
            'accion' => $accion,
            'datos' => $datos,
        ]);
    }
}
