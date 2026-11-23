<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publicacion;
use App\Services\MediaManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class ForoController extends Controller
{
    public function __construct(private MediaManager $media) {}

    public function index(Request $request)
    {
        $filters = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $publicaciones = Publicacion::query()
            ->where('visibilidad', 'publica')
            ->with($this->publicacionRelations())
            ->withCount('comentarios')
            ->latest('fecha_publicacion')
            ->paginate($filters['per_page'] ?? 20);

        return response()->json([
            'data' => $publicaciones->items(),
            'meta' => [
                'current_page' => $publicaciones->currentPage(),
                'per_page' => $publicaciones->perPage(),
                'total' => $publicaciones->total(),
                'last_page' => $publicaciones->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titulo' => ['nullable', 'string', 'max:200'],
            'contenido' => ['required', 'string', 'max:5000'],
            'visibilidad' => ['nullable', 'in:publica,privada,grupo_privado'],
            'imagenes' => ['nullable', 'array', 'max:5'],
            'imagenes.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'alt_text' => ['nullable', 'string', 'max:255'],
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
                ]);

                foreach ($files as $index => $file) {
                    $resultado = $this->media->upload(
                        $file,
                        'foro_imagenes',
                        'Publicacion/'.$request->user()->getKey(),
                    );
                    $imagenesSubidas[] = $resultado['public_id'];
                    $publicacion->imagenes()->create([
                        'imagen' => $resultado['url'],
                        'public_id' => $resultado['public_id'],
                        'mime_type' => $resultado['mime_type'],
                        'size' => $resultado['size'],
                        'width' => $resultado['width'],
                        'height' => $resultado['height'],
                        'alt_text' => $validated['alt_text'] ?? null,
                        'estado' => 'activo',
                        'orden' => $index,
                    ]);
                }

                return $publicacion;
            });

            return response()->json([
                'data' => $publicacion
                    ->load($this->publicacionRelations())
                    ->loadCount('comentarios'),
            ], 201);
        } catch (\Throwable $e) {
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
        ]);
        $post = Publicacion::query()->findOrFail($publicacion);
        if (! Gate::forUser($request->user())->allows('view.post', $post)) {
            return response()->json([
                'message' => 'No tienes permiso para acceder a esta publicación.',
                'code' => 'PRIVATE_RESOURCE',
            ], 403);
        }
        $comment = $post->comentarios()->create([
            'usuario_id' => $request->user()->getKey(),
            'comentario' => trim($validated['comentario']),
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

        return response()->json(['data' => $post]);
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
        ]);
        $post->update($validated);

        return response()->json([
            'data' => $post->fresh($this->publicacionRelations())->loadCount('comentarios'),
        ]);
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

    private function publicacionRelations(): array
    {
        return [
            'usuario:id,nombre,username,foto_perfil_url as foto_perfil',
            'imagenes:id,publicacion_id,imagen,orden',
            'comentarios' => fn ($query) => $query
                ->with('usuario:id,nombre,username,foto_perfil_url as foto_perfil')
                ->orderBy('fecha_comentario'),
        ];
    }
}
