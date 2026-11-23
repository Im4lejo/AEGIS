<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcesarVideoAsset;
use App\Jobs\PublicarPostProgramado;
use App\Models\Comentario;
use App\Models\Comunidad;
use App\Models\Encuesta;
use App\Models\MembresiaComunidad;
use App\Models\OpcionEncuesta;
use App\Models\Producto;
use App\Models\Publicacion;
use App\Models\ReaccionPublicacion;
use App\Models\ReferenciaPublicacion;
use App\Models\Repost;
use App\Models\Usuario;
use App\Models\VotoEncuesta;
use App\Services\MediaManager;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ForoController extends Controller
{
    public function __construct(private MediaManager $media) {}

    public function index(Request $request)
    {
        $filters = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
            'cursor' => ['nullable', 'string', 'max:255'],
            'tab' => ['nullable', 'in:para-ti,siguiendo,recientes,marketplace'],
            'tipo' => ['nullable', 'in:discusion,pregunta,tutorial,encuesta,anuncio'],
            'comunidad_id' => ['nullable', 'integer', 'exists:comunidades,id'],
            'busqueda' => ['nullable', 'string', 'max:100'],
            'orden' => ['nullable', 'in:recientes,actividad,popularidad'],
        ]);

        $viewer = $request->user();
        $tab = $filters['tab'] ?? 'recientes';
        $blockedIds = $this->blockedUserIds($viewer);
        $followedIds = $viewer
            ? DB::table('seguimientos')
                ->where('seguidor_id', $viewer->id)
                ->where('estado', 'aceptado')
                ->pluck('seguido_id')
                ->all()
            : [];
        $communityMemberIds = $viewer
            ? MembresiaComunidad::query()
                ->where('usuario_id', $viewer->id)
                ->where('estado', 'activo')
                ->pluck('comunidad_id')
                ->all()
            : [];

        $query = Publicacion::query()
            ->where('estado', 'publicado')
            ->where('visibilidad', 'publica')
            ->where('fecha_publicacion', '<=', now())
            ->when($blockedIds !== [], fn ($q) => $q->whereNotIn('usuario_id', $blockedIds))
            ->with($this->publicacionRelations())
            ->withCount(['comentarios', 'reacciones']);
        $query->where(function ($q) use ($communityMemberIds): void {
            $q->whereNull('comunidad_id')
                ->orWhereHas('comunidad', fn ($community) => $community
                    ->where('visibilidad', 'publica')
                    ->where('estado', 'activa'));
            if ($communityMemberIds !== []) {
                $q->orWhereIn('comunidad_id', $communityMemberIds);
            }
        });
        if (! empty($filters['tipo'])) {
            $query->where('tipo', $filters['tipo']);
        }
        if (! empty($filters['comunidad_id'])) {
            $query->where('comunidad_id', $filters['comunidad_id']);
        }
        if (! empty($filters['busqueda'])) {
            $term = '%'.$filters['busqueda'].'%';
            $query->where(fn ($q) => $q
                ->where('titulo', 'like', $term)
                ->orWhere('contenido', 'like', $term));
        }

        if ($tab === 'siguiendo' && $followedIds !== []) {
            $query->whereIn('usuario_id', $followedIds);
        } elseif ($tab === 'siguiendo') {
            $query->whereRaw('1 = 0');
        }
        if ($tab === 'marketplace') {
            $query->whereHas('referencias', fn ($reference) => $reference
                ->where('tipo', 'producto')
                ->whereHas('producto', fn ($product) => $product
                    ->where('visibilidad', 'publica')
                    ->whereIn('estado_publicacion', ['activo', 'reservado'])));
        }

        if (($filters['orden'] ?? null) === 'actividad') {
            $query->orderByDesc('ultima_actividad')
                ->orderByDesc('fecha_publicacion')
                ->orderByDesc('id');
        } elseif (($filters['orden'] ?? null) === 'popularidad') {
            $query->orderByDesc('actividad_score')
                ->orderByDesc('fecha_publicacion')
                ->orderByDesc('id');
        } elseif ($tab === 'para-ti') {
            $query->orderByDesc('fijada')
                ->orderByDesc('rank_base')
                ->orderByDesc('fecha_publicacion')
                ->orderByDesc('id');
        } else {
            $query->orderByDesc('fijada')
                ->orderByDesc('fecha_publicacion')
                ->orderByDesc('id');
        }

        if (! empty($filters['cursor'])) {
            [$cursorDate, $cursorId] = array_pad(explode(':', base64_decode($filters['cursor'])), 2, null);
            if ($cursorDate && ctype_digit((string) $cursorId)) {
                $query->where(function ($q) use ($cursorDate, $cursorId): void {
                    $q->where('fecha_publicacion', '<', $cursorDate)
                        ->orWhere(function ($same) use ($cursorDate, $cursorId): void {
                            $same->where('fecha_publicacion', '=', $cursorDate)
                                ->where('id', '<', (int) $cursorId);
                        });
                });
            }
        }

        $perPage = $filters['per_page'] ?? 20;
        $posts = $query->limit($perPage + 1)->get();
        $hasMore = $posts->count() > $perPage;
        $items = $posts->take($perPage);
        $last = $items->last();
        $nextCursor = $hasMore && $last
            ? base64_encode($last->fecha_publicacion->format('Y-m-d H:i:s').':'.$last->id)
            : null;

        return response()->json([
            'data' => $items,
            'meta' => [
                'per_page' => $perPage,
                'current_page' => 1,
                'total' => $items->count(),
                'last_page' => $hasMore ? 2 : 1,
                'tab' => $tab,
                'ranking' => $tab === 'para-ti'
                    ? 'fijados y rank_base descendente, luego fecha e id'
                    : 'recientes por fecha e id',
                'next_cursor' => $nextCursor,
                'has_more' => $hasMore,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titulo' => ['nullable', 'string', 'max:200'],
            'contenido' => ['required', 'string', 'max:5000'],
            'tipo' => ['nullable', 'in:discusion,pregunta,tutorial,encuesta,anuncio'],
            'visibilidad' => ['nullable', 'in:publica,privada,grupo_privado'],
            'estado' => ['nullable', 'in:borrador,publicado,programado'],
            'programada_para' => ['nullable', 'date'],
            'etiquetas' => ['nullable', 'array', 'max:10'],
            'etiquetas.*' => ['string', 'max:100'],
            'menciones' => ['nullable', 'array', 'max:20'],
            'menciones.*' => ['integer', 'exists:usuarios,id'],
            'enlace_preview_url' => ['nullable', 'url', 'max:2048'],
            'enlace_preview_titulo' => ['nullable', 'string', 'max:255'],
            'imagenes' => ['nullable', 'array', 'max:5'],
            'imagenes.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'producto_id' => ['nullable', 'integer', 'exists:productos,id'],
            'comunidad_id_referencia' => ['nullable', 'integer', 'exists:comunidades,id'],
        ]);
        $contenido = trim($validated['contenido']);
        $titulo = trim($validated['titulo'] ?? '');
        $files = $validated['imagenes'] ?? [];

        if ($titulo === '') {
            $titulo = Str::limit($contenido, 200, '');
        }

        $imagenesSubidas = [];

        try {
            $publicacion = DB::transaction(function () use (
                $contenido,
                $titulo,
                $files,
                $request,
                $validated,
                &$imagenesSubidas
            ) {
                $publicacion = Publicacion::query()->create([
                    'usuario_id' => $request->user()->getKey(),
                    'titulo' => $titulo,
                    'contenido' => $contenido,
                    'visibilidad' => $validated['visibilidad'] ?? 'publica',
                    'tipo' => $validated['tipo'] ?? 'discusion',
                    'interaccion_estado' => 'abierto',
                    'ultima_actividad' => now(),
                    'estado' => $validated['estado'] ?? 'publicado',
                    'programada_para' => isset($validated['programada_para'])
                        ? Carbon::parse($validated['programada_para'])
                        : null,
                    'etiquetas' => $validated['etiquetas'] ?? [],
                    'menciones' => $validated['menciones'] ?? [],
                    'enlace_preview_url' => $this->safePreviewUrl($validated['enlace_preview_url'] ?? null),
                    'enlace_preview_titulo' => $validated['enlace_preview_titulo'] ?? null,
                ]);

                foreach ($files as $index => $file) {
                    $resultado = $this->media->upload(
                        $file,
                        'foro_imagenes',
                        'Publicacion/'.$request->user()->getKey(),
                        str_starts_with(strtolower((string) $file->getMimeType()), 'video/'),
                    );
                    $imagenesSubidas[] = $resultado['public_id'];
                    $asset = $publicacion->imagenes()->create([
                        'imagen' => $resultado['url'],
                        'public_id' => $resultado['public_id'],
                        'mime_type' => $resultado['mime_type'],
                        'size' => $resultado['size'],
                        'width' => $resultado['width'],
                        'height' => $resultado['height'],
                        'poster_url' => $resultado['poster_url'] ?? null,
                        'playback_url' => $resultado['playback_url'] ?? null,
                        'procesamiento_estado' => str_starts_with($resultado['mime_type'], 'video/')
                            ? 'procesando'
                            : 'listo',
                        'alt_text' => $validated['alt_text'] ?? null,
                        'estado' => 'activo',
                        'orden' => $index,
                    ]);
                    if (str_starts_with($resultado['mime_type'], 'video/')) {
                        ProcesarVideoAsset::dispatch($asset->id);
                    }
                }

                if (! empty($validated['menciones'])) {
                    $publicacion->menciones()->sync($validated['menciones']);
                }

                if (! empty($validated['producto_id'])) {
                    $product = Producto::query()->find($validated['producto_id']);
                    if (
                        ! $product
                        || $product->visibilidad !== 'publica'
                        || $product->estado_publicacion === 'borrador'
                        || $product->estado_publicacion === 'archivado'
                    ) {
                        throw ValidationException::withMessages([
                            'producto_id' => ['El anuncio no está disponible para compartir.'],
                        ]);
                    }
                    ReferenciaPublicacion::query()->create([
                        'publicacion_id' => $publicacion->id,
                        'tipo' => 'producto',
                        'producto_id' => $product->id,
                        'orden' => 0,
                    ]);
                }

                if (($validated['estado'] ?? 'publicado') === 'programado'
                    && $publicacion->programada_para
                ) {
                    PublicarPostProgramado::dispatch($publicacion->id)
                        ->delay($publicacion->programada_para);
                }

                return $publicacion;
            });

            return response()->json([
                'data' => $publicacion
                    ->load($this->publicacionRelations())
                    ->loadCount('comentarios'),
            ], 201);
        } catch (\Throwable $e) {
            if ($e instanceof ValidationException) {
                throw $e;
            }
            foreach ($imagenesSubidas as $publicId) {
                try {
                    $this->media->destroyWithRetry($publicId, 'image', 'foro-store-'.uniqid());
                } catch (\Throwable $error) {
                    report($error);
                }
            }

            report($e);

            return response()->json([
                'message' => 'Error al crear la publicación.',
            ], 500);
        }
    }

    public function storeComment(Request $request, int $publicacion)
    {
        $validated = $request->validate([
            'comentario' => ['required', 'string', 'max:2000'],
            'comentario_padre_id' => ['nullable', 'integer', 'exists:comentarios_foro,id'],
        ]);
        $post = Publicacion::query()->findOrFail($publicacion);
        if ($post->interaccion_estado === 'cerrado') {
            return response()->json([
                'message' => 'El hilo está cerrado.',
                'code' => 'THREAD_CLOSED',
            ], 403);
        }
        if ($post->comunidad_id) {
            $member = MembresiaComunidad::query()
                ->where('comunidad_id', $post->comunidad_id)
                ->where('usuario_id', $request->user()->id)
                ->where('estado', 'activo')
                ->exists();
            $community = Comunidad::query()->find($post->comunidad_id);
            if ($community && $community->visibilidad === 'privada' && ! $member) {
                return response()->json([
                    'message' => 'Debes pertenecer a la comunidad para comentar.',
                    'code' => 'COMMUNITY_PRIVATE',
                ], 403);
            }
        }
        if (! Gate::forUser($request->user())->allows('view.post', $post)) {
            return response()->json([
                'message' => 'No tienes permiso para acceder a esta publicación.',
                'code' => 'PRIVATE_RESOURCE',
            ], 403);
        }
        if (! empty($validated['comentario_padre_id'])) {
            $parent = Comentario::query()
                ->whereKey($validated['comentario_padre_id'])
                ->where('publicacion_id', $post->id)
                ->whereNull('comentario_padre_id')
                ->where('estado', '!=', 'eliminado')
                ->first();
            if (! $parent) {
                throw ValidationException::withMessages([
                    'comentario_padre_id' => ['Solo se permiten respuestas a un comentario principal.'],
                ]);
            }
        }
        if ($this->isBlockedFromPost($request->user(), $post)) {
            return response()->json(['message' => 'No puedes interactuar.', 'code' => 'PROFILE_RESTRICTED'], 403);
        }
        $recentComments = Comentario::query()
            ->where('usuario_id', $request->user()->id)
            ->where('fecha_comentario', '>=', now()->subMinute())
            ->count();
        if ($recentComments >= 10) {
            return response()->json([
                'message' => 'Has alcanzado el límite temporal de comentarios.',
                'code' => 'COMMENT_RATE_LIMIT',
            ], 429);
        }
        $comment = $post->comentarios()->create([
            'usuario_id' => $request->user()->getKey(),
            'comentario' => trim($validated['comentario']),
            'comentario_padre_id' => $validated['comentario_padre_id'] ?? null,
            'estado' => 'activo',
        ]);
        $post->update([
            'ultima_actividad' => now(),
            'actividad_score' => $post->actividad_score + 1,
        ]);

        return response()->json([
            'data' => $comment->load(
                'usuario:id,nombre,username,foto_perfil_url as foto_perfil'
            ),
        ], 201);
    }

    public function show(Request $request, int $publicacion)
    {
        $post = Publicacion::query()
            ->with($this->publicacionRelations())
            ->withCount('comentarios')
            ->findOrFail($publicacion);

        $usuario = $request->user();
        if ($post->comunidad_id) {
            $community = Comunidad::query()->find($post->comunidad_id);
            $member = $usuario
                ? MembresiaComunidad::query()
                    ->where('comunidad_id', $post->comunidad_id)
                    ->where('usuario_id', $usuario->id)
                    ->where('estado', 'activo')
                    ->exists()
                : false;
            if (
                $community
                && $community->visibilidad === 'privada'
                && ! $member
            ) {
                return response()->json([
                    'message' => 'Esta publicación pertenece a una comunidad privada.',
                    'code' => 'COMMUNITY_PRIVATE',
                ], 403);
            }
        }
        if (
            ! in_array($post->visibilidad, ['publica', null], true)
            && (
                ! $usuario
                || ! Gate::forUser($usuario)->allows('view.post', $post)
            )
        ) {
            return response()->json([
                'message' => 'Esta publicación privada no está disponible para tu cuenta.',
                'code' => 'PRIVATE_RESOURCE',
            ], 403);
        }

        $payload = $post->toArray();
        $payload['referencias_comerciales'] = $post->referencias()
            ->where('tipo', 'producto')
            ->with(['producto.imagenes:id,producto_id,imagen,principal'])
            ->get()
            ->map(function (ReferenciaPublicacion $reference): ?array {
                $product = $reference->producto;
                if (
                    ! $product
                    || $product->visibilidad !== 'publica'
                    || in_array($product->estado_publicacion, ['borrador', 'archivado', 'vendido', 'oculto'], true)
                ) {
                    return [
                        'tipo' => 'producto',
                        'producto_id' => $reference->producto_id,
                        'disponible' => false,
                        'razon' => 'El anuncio ya no está disponible.',
                    ];
                }

                return [
                    'tipo' => 'producto',
                    'producto_id' => $product->id,
                    'disponible' => $product->estado_publicacion === 'activo',
                    'titulo' => $product->titulo,
                    'precio' => $product->precio,
                    'estado_producto' => $product->estado_producto,
                    'estado_publicacion' => $product->estado_publicacion,
                    'ciudad_aprox' => $product->ciudad_aprox,
                    'imagen' => $product->imagenes->firstWhere('principal', true)?->imagen
                        ?? $product->imagenes->first()?->imagen,
                ];
            })
            ->filter()
            ->values();

        return response()->json(['data' => $payload]);
    }

    public function update(Request $request, int $publicacion)
    {
        $post = Publicacion::query()->findOrFail($publicacion);
        if (! Gate::forUser($request->user())->allows('update.post', $post)) {
            return response()->json([
                'message' => 'No tienes permiso para editar esta publicación.',
                'code' => 'FORBIDDEN_RESOURCE',
            ], 403);
        }

        $validated = $request->validate([
            'titulo' => ['nullable', 'string', 'max:200'],
            'contenido' => ['sometimes', 'string', 'max:5000'],
            'visibilidad' => ['sometimes', 'in:publica,privada,grupo_privado'],
            'estado' => ['sometimes', 'in:borrador,publicado,programado,archivado'],
            'programada_para' => ['nullable', 'date'],
            'fijada' => ['sometimes', 'boolean'],
            'etiquetas' => ['nullable', 'array', 'max:10'],
            'etiquetas.*' => ['string', 'max:100'],
            'menciones' => ['nullable', 'array', 'max:20'],
            'menciones.*' => ['integer', 'exists:usuarios,id'],
            'enlace_preview_url' => ['nullable', 'url', 'max:2048'],
            'enlace_preview_titulo' => ['nullable', 'string', 'max:255'],
        ]);

        if (isset($validated['enlace_preview_url'])) {
            $validated['enlace_preview_url'] = $this->safePreviewUrl(
                $validated['enlace_preview_url'],
            );
        }
        if (isset($validated['programada_para'])) {
            $validated['programada_para'] = Carbon::parse($validated['programada_para']);
        }

        $menciones = $validated['menciones'] ?? null;
        unset($validated['menciones']);
        $post->update($validated);
        $post->update(['editada_en' => now()]);
        if (is_array($menciones)) {
            $post->menciones()->sync($menciones);
        }

        if (($validated['estado'] ?? null) === 'programado'
            && $post->programada_para
        ) {
            PublicarPostProgramado::dispatch($post->id)->delay($post->programada_para);
        }

        return response()->json([
            'data' => $post->fresh($this->publicacionRelations())->loadCount('comentarios'),
        ]);
    }

    public function setSolution(Request $request, int $publicacion)
    {
        $post = Publicacion::query()->findOrFail($publicacion);
        $validated = $request->validate([
            'comentario_id' => ['required', 'integer', 'exists:comentarios_foro,id'],
            'aceptada' => ['sometimes', 'boolean'],
        ]);
        $comment = Comentario::query()
            ->whereKey($validated['comentario_id'])
            ->where('publicacion_id', $post->id)
            ->where('estado', '!=', 'eliminado')
            ->first();
        if (! $comment) {
            throw ValidationException::withMessages([
                'comentario_id' => ['La respuesta no pertenece a este hilo.'],
            ]);
        }

        $isOwner = (int) $post->usuario_id === (int) $request->user()->id;
        $isCommunityModerator = false;
        if ($post->comunidad_id) {
            $isCommunityModerator = MembresiaComunidad::query()
                ->where('comunidad_id', $post->comunidad_id)
                ->where('usuario_id', $request->user()->id)
                ->where('estado', 'activo')
                ->whereIn('rol', ['owner', 'moderador'])
                ->exists();
        }
        if (! $isOwner && ! $isCommunityModerator && $request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Sin permiso para marcar solución.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }

        $accepted = $validated['aceptada'] ?? true;
        if ($accepted) {
            Comentario::query()
                ->where('publicacion_id', $post->id)
                ->update(['es_solucion' => false]);
            $comment->update(['es_solucion' => true]);
            $post->update([
                'respuesta_aceptada_id' => $comment->id,
                'ultima_actividad' => now(),
                'actividad_score' => $post->actividad_score + 5,
            ]);
        } else {
            $comment->update(['es_solucion' => false]);
            $post->update(['respuesta_aceptada_id' => null]);
        }

        return response()->json([
            'data' => [
                'respuesta_aceptada_id' => $post->respuesta_aceptada_id,
                'es_solucion' => (bool) $accepted,
            ],
        ]);
    }

    public function toggleThread(Request $request, int $publicacion)
    {
        $post = Publicacion::query()->findOrFail($publicacion);
        $isOwner = (int) $post->usuario_id === (int) $request->user()->id;
        $isModerator = $post->comunidad_id
            ? MembresiaComunidad::query()
                ->where('comunidad_id', $post->comunidad_id)
                ->where('usuario_id', $request->user()->id)
                ->where('estado', 'activo')
                ->whereIn('rol', ['owner', 'moderador'])
                ->exists()
            : false;
        if (! $isOwner && ! $isModerator && $request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Sin permiso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }

        $validated = $request->validate([
            'estado' => ['required', 'in:abierto,cerrado'],
        ]);
        $post->update([
            'interaccion_estado' => $validated['estado'],
            'cerrado_en' => $validated['estado'] === 'cerrado' ? now() : null,
        ]);

        return response()->json([
            'data' => [
                'interaccion_estado' => $post->interaccion_estado,
                'cerrado_en' => $post->cerrado_en,
            ],
        ]);
    }

    public function subscribe(Request $request, int $publicacion)
    {
        $post = Publicacion::query()->findOrFail($publicacion);
        DB::table('suscripciones_hilo')->updateOrInsert(
            ['publicacion_id' => $post->id, 'usuario_id' => $request->user()->id],
            [
                'estado' => 'activa',
                'updated_at' => now(),
                'created_at' => now(),
            ],
        );

        return response()->json(['data' => ['suscrito' => true]]);
    }

    public function unsubscribe(Request $request, int $publicacion)
    {
        DB::table('suscripciones_hilo')
            ->where('publicacion_id', $publicacion)
            ->where('usuario_id', $request->user()->id)
            ->delete();

        return response()->json(['data' => ['suscrito' => false]]);
    }

    public function createPoll(Request $request, int $publicacion)
    {
        $post = Publicacion::query()->findOrFail($publicacion);
        if (! Gate::forUser($request->user())->allows('update.post', $post)) {
            return response()->json(['message' => 'Sin permiso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }
        $validated = $request->validate([
            'pregunta' => ['required', 'string', 'max:500'],
            'permite_multiple' => ['sometimes', 'boolean'],
            'finaliza_en' => ['nullable', 'date', 'after:now'],
            'opciones' => ['required', 'array', 'min:2', 'max:10'],
            'opciones.*' => ['required', 'string', 'max:255'],
        ]);

        $poll = Encuesta::query()->updateOrCreate(
            ['publicacion_id' => $post->id],
            [
                'pregunta' => trim($validated['pregunta']),
                'permite_multiple' => $validated['permite_multiple'] ?? false,
                'finaliza_en' => isset($validated['finaliza_en'])
                    ? Carbon::parse($validated['finaliza_en'])
                    : null,
            ],
        );
        $poll->opciones()->delete();
        $options = [];
        foreach (array_values(array_unique($validated['opciones'])) as $index => $text) {
            $options[] = $poll->opciones()->create([
                'texto' => trim($text),
                'orden' => $index,
            ]);
        }
        $post->update(['tipo' => 'encuesta', 'ultima_actividad' => now()]);

        return response()->json([
            'data' => $poll->load('opciones'),
        ], 201);
    }

    public function votePoll(Request $request, int $publicacion)
    {
        $post = Publicacion::query()->findOrFail($publicacion);
        $poll = Encuesta::query()->where('publicacion_id', $post->id)->first();
        if (! $poll) {
            throw ValidationException::withMessages([
                'encuesta' => ['La publicación no tiene una encuesta.'],
            ]);
        }
        if ($poll->finaliza_en && now()->greaterThan($poll->finaliza_en)) {
            throw ValidationException::withMessages([
                'encuesta' => ['El período de votación terminó.'],
            ]);
        }
        if ($post->interaccion_estado === 'cerrado') {
            return response()->json(['message' => 'El hilo está cerrado.', 'code' => 'THREAD_CLOSED'], 403);
        }

        $validated = $request->validate([
            'opcion_id' => ['required', 'integer', 'exists:opciones_encuesta,id'],
        ]);
        $option = OpcionEncuesta::query()
            ->whereKey($validated['opcion_id'])
            ->where('encuesta_id', $poll->id)
            ->first();
        if (! $option) {
            throw ValidationException::withMessages([
                'opcion_id' => ['La opción no pertenece a esta encuesta.'],
            ]);
        }

        if (! $poll->permite_multiple) {
            VotoEncuesta::query()
                ->where('encuesta_id', $poll->id)
                ->where('usuario_id', $request->user()->id)
                ->delete();
        }
        VotoEncuesta::query()->firstOrCreate([
            'encuesta_id' => $poll->id,
            'opcion_id' => $option->id,
            'usuario_id' => $request->user()->id,
        ]);

        $results = $poll->opciones()
            ->withCount('votos')
            ->get(['id', 'texto', 'orden'])
            ->map(fn (OpcionEncuesta $item) => [
                'id' => $item->id,
                'texto' => $item->texto,
                'votos' => $item->votos_count,
            ]);

        return response()->json([
            'data' => [
                'pregunta' => $poll->pregunta,
                'permite_multiple' => (bool) $poll->permite_multiple,
                'opciones' => $results,
            ],
        ], 201);
    }

    public function destroy(Request $request, int $publicacion)
    {
        $post = Publicacion::query()->findOrFail($publicacion);
        if (! Gate::forUser($request->user())->allows('delete.post', $post)) {
            return response()->json([
                'message' => 'No tienes permiso para eliminar esta publicación.',
                'code' => 'FORBIDDEN_RESOURCE',
            ], 403);
        }

        DB::table('auditoria_accesos')->insert([
            'actor_id' => $request->user()->id,
            'accion' => 'eliminar',
            'recurso_tipo' => 'Publicacion',
            'recurso_id' => $post->id,
            'datos' => json_encode(['propietario_id' => $post->usuario_id]),
            'fecha' => now(),
        ]);
        $post->delete();

        return response()->json([
            'message' => 'Publicación eliminada correctamente.',
            'code' => 'RESOURCE_DELETED',
        ]);
    }

    public function archive(Request $request, int $publicacion)
    {
        $post = Publicacion::query()->findOrFail($publicacion);
        if (! Gate::forUser($request->user())->allows('update.post', $post)) {
            return response()->json(['message' => 'Sin permiso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }

        $post->update([
            'estado' => 'archivado',
            'editada_en' => now(),
        ]);

        return response()->json([
            'message' => 'Publicación archivada.',
            'data' => $post->fresh($this->publicacionRelations()),
        ]);
    }

    public function react(Request $request, int $publicacion)
    {
        $post = Publicacion::query()->findOrFail($publicacion);
        if (! Gate::forUser($request->user())->allows('view.post', $post)) {
            return response()->json(['message' => 'Sin acceso.', 'code' => 'PRIVATE_RESOURCE'], 403);
        }

        $validated = $request->validate([
            'tipo' => ['required', 'in:me_gusta,util,apoyo'],
        ]);

        $reaction = ReaccionPublicacion::query()->firstOrCreate([
            'publicacion_id' => $post->id,
            'usuario_id' => $request->user()->id,
            'tipo' => $validated['tipo'],
        ]);

        return response()->json([
            'data' => [
                'tipo' => $reaction->tipo,
                'count' => $post->reacciones()->where('tipo', $reaction->tipo)->count(),
            ],
        ], 201);
    }

    public function unreact(Request $request, int $publicacion)
    {
        $validated = $request->validate([
            'tipo' => ['required', 'in:me_gusta,util,apoyo'],
        ]);

        ReaccionPublicacion::query()
            ->where('publicacion_id', $publicacion)
            ->where('usuario_id', $request->user()->id)
            ->where('tipo', $validated['tipo'])
            ->delete();

        $count = ReaccionPublicacion::query()
            ->where('publicacion_id', $publicacion)
            ->where('tipo', $validated['tipo'])
            ->count();

        return response()->json(['data' => ['tipo' => $validated['tipo'], 'count' => $count]]);
    }

    public function comments(Request $request, int $publicacion)
    {
        $post = Publicacion::query()->findOrFail($publicacion);
        $viewer = $request->user();
        $allowed = in_array($post->visibilidad, ['publica', null], true)
            || ($viewer && Gate::forUser($viewer)->allows('view.post', $post));
        if (! $allowed) {
            return response()->json(['message' => 'Sin acceso.', 'code' => 'PRIVATE_RESOURCE'], 403);
        }

        $perPage = max(1, min(50, (int) $request->integer('per_page', 20)));
        $comments = Comentario::query()
            ->where('publicacion_id', $post->id)
            ->whereNull('comentario_padre_id')
            ->where('estado', '!=', 'eliminado')
            ->with([
                'usuario:id,nombre,username,foto_perfil_url',
                'respuestas' => fn ($query) => $query
                    ->with('usuario:id,nombre,username,foto_perfil_url')
                    ->orderBy('fecha_comentario')
                    ->limit(20),
            ])
            ->orderByDesc('fecha_comentario')
            ->orderByDesc('id')
            ->paginate($perPage);

        return response()->json([
            'data' => $comments->items(),
            'meta' => [
                'current_page' => $comments->currentPage(),
                'per_page' => $comments->perPage(),
                'total' => $comments->total(),
                'last_page' => $comments->lastPage(),
            ],
        ]);
    }

    public function updateComment(Request $request, int $publicacion, int $comentario)
    {
        $post = Publicacion::query()->findOrFail($publicacion);
        $comment = Comentario::query()
            ->whereKey($comentario)
            ->where('publicacion_id', $post->id)
            ->firstOrFail();

        if ((int) $comment->usuario_id !== (int) $request->user()->id
            && $request->user()->rol !== 'admin'
        ) {
            return response()->json(['message' => 'Sin permiso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }

        $validated = $request->validate([
            'comentario' => ['required', 'string', 'max:2000'],
        ]);
        $comment->update([
            'comentario' => trim($validated['comentario']),
            'estado' => 'editado',
            'editado_en' => now(),
        ]);

        return response()->json(['data' => $comment->fresh('usuario')]);
    }

    public function destroyComment(Request $request, int $publicacion, int $comentario)
    {
        $comment = Comentario::query()
            ->whereKey($comentario)
            ->where('publicacion_id', $publicacion)
            ->firstOrFail();

        if ((int) $comment->usuario_id !== (int) $request->user()->id
            && $request->user()->rol !== 'admin'
        ) {
            return response()->json(['message' => 'Sin permiso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }

        $comment->update([
            'estado' => 'eliminado',
            'comentario' => '[comentario eliminado]',
        ]);

        return response()->json([
            'message' => 'Comentario eliminado.',
            'code' => 'RESOURCE_DELETED',
        ]);
    }

    public function repost(Request $request, int $publicacion)
    {
        $post = Publicacion::query()->findOrFail($publicacion);
        if (! Gate::forUser($request->user())->allows('view.post', $post)
            && $post->visibilidad !== 'publica'
        ) {
            return response()->json(['message' => 'Sin acceso.', 'code' => 'PRIVATE_RESOURCE'], 403);
        }

        $validated = $request->validate([
            'comentario' => ['nullable', 'string', 'max:500'],
        ]);
        $repost = Repost::query()->firstOrCreate([
            'usuario_id' => $request->user()->id,
            'publicacion_id' => $post->id,
        ], [
            'comentario' => trim($validated['comentario'] ?? ''),
        ]);

        return response()->json([
            'message' => 'Publicación compartida.',
            'data' => [
                'id' => $repost->id,
                'count' => Repost::query()->where('publicacion_id', $post->id)->count(),
            ],
        ], 201);
    }

    public function unrepost(Request $request, int $publicacion)
    {
        Repost::query()
            ->where('usuario_id', $request->user()->id)
            ->where('publicacion_id', $publicacion)
            ->delete();

        return response()->json([
            'data' => [
                'count' => Repost::query()->where('publicacion_id', $publicacion)->count(),
            ],
        ]);
    }

    private function publicacionRelations(): array
    {
        return [
            'usuario:id,nombre,username,foto_perfil_url as foto_perfil',
            'imagenes:id,publicacion_id,imagen,orden',
            'menciones:id,nombre,username,foto_perfil_url as foto_perfil',
            'referencias:id,publicacion_id,tipo,producto_id,orden',
            'referencias.producto:id,titulo,precio,estado_publicacion,estado_producto,ciudad_aprox,visibilidad',
            'referencias.producto.imagenes:id,producto_id,imagen,principal',
            'comentarios' => fn ($query) => $query
                ->with('usuario:id,nombre,username,foto_perfil_url as foto_perfil')
                ->orderBy('fecha_comentario'),
        ];
    }

    private function blockedUserIds(?Usuario $viewer): array
    {
        if (! $viewer) {
            return [];
        }

        return DB::table('bloqueos_usuario')
            ->where('tipo', 'bloqueo')
            ->where(function ($query) use ($viewer): void {
                $query->where('bloqueador_id', $viewer->id)
                    ->orWhere('bloqueado_id', $viewer->id);
            })
            ->get(['bloqueador_id', 'bloqueado_id'])
            ->flatMap(fn ($row) => [(int) $row->bloqueador_id, (int) $row->bloqueado_id])
            ->filter(fn (int $id) => $id !== (int) $viewer->id)
            ->unique()
            ->values()
            ->all();
    }

    private function isBlockedFromPost(Usuario $viewer, Publicacion $post): bool
    {
        return DB::table('bloqueos_usuario')
            ->where('tipo', 'bloqueo')
            ->where(function ($query) use ($viewer, $post): void {
                $query->where(function ($sub) use ($viewer, $post): void {
                    $sub->where('bloqueador_id', $viewer->id)
                        ->where('bloqueado_id', $post->usuario_id);
                })->orWhere(function ($sub) use ($viewer, $post): void {
                    $sub->where('bloqueador_id', $post->usuario_id)
                        ->where('bloqueado_id', $viewer->id);
                });
            })
            ->exists();
    }

    private function safePreviewUrl(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME));
        if (! in_array($scheme, ['http', 'https'], true)) {
            throw ValidationException::withMessages([
                'enlace_preview_url' => ['Solo se permiten enlaces HTTP o HTTPS.'],
            ]);
        }

        return $url;
    }
}
