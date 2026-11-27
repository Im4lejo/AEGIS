<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcesarVideoAsset;
use App\Models\Producto;
use App\Models\Publicacion;
use App\Services\MediaManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class MediaController extends Controller
{
    public function __construct(private MediaManager $media) {}

    public function storeProducto(Request $request, int $producto)
    {
        $product = Producto::query()->findOrFail($producto);
        if (! Gate::forUser($request->user())->allows('update.product', $product)) {
            return response()->json([
                'message' => 'No tienes permiso para modificar media de este producto.',
                'code' => 'FORBIDDEN_RESOURCE',
            ], 403);
        }

        $validated = $request->validate([
            'imagenes' => ['required', 'array', 'min:1', 'max:5'],
            'imagenes.*' => ['required', 'file'],
            'alt_text' => ['nullable', 'string', 'max:255'],
        ]);
        $current = $product->imagenes()->where('estado', 'activo')->count();
        if ($current + count($validated['imagenes']) > 5) {
            return response()->json([
                'message' => 'Un producto puede tener máximo 5 imágenes.',
                'code' => 'MEDIA_LIMIT',
            ], 422);
        }

        $created = [];
        foreach ($validated['imagenes'] as $index => $file) {
            $uploaded = $this->media->upload($file, 'productos', 'Producto/'.$product->id);
            $created[] = $product->imagenes()->create([
                'imagen' => $uploaded['url'],
                'public_id' => $uploaded['public_id'],
                'mime_type' => $uploaded['mime_type'],
                'size' => $uploaded['size'],
                'width' => $uploaded['width'],
                'height' => $uploaded['height'],
                'alt_text' => $validated['alt_text'] ?? null,
                'estado' => 'activo',
                'orden' => $current + $index,
                'principal' => $current === 0 && $index === 0,
            ]);
        }

        $this->markPrincipal($product);

        return response()->json([
            'message' => 'Media agregada correctamente.',
            'data' => $product->imagenes()->where('estado', 'activo')->orderBy('orden')->get(),
        ], 201);
    }

    public function destroyProducto(Request $request, int $producto, int $imagen)
    {
        $product = Producto::query()->findOrFail($producto);
        if (! Gate::forUser($request->user())->allows('update.product', $product)) {
            return response()->json([
                'message' => 'No tienes permiso para modificar media de este producto.',
                'code' => 'FORBIDDEN_RESOURCE',
            ], 403);
        }

        $media = $product->imagenes()->whereKey($imagen)->where('estado', 'activo')->first();
        if (! $media) {
            return response()->json([
                'message' => 'El adjunto no existe o ya fue eliminado.',
                'code' => 'RESOURCE_DELETED',
            ], 404);
        }

        $publicId = $media->public_id;
        $media->update(['estado' => 'eliminando']);
        $media->delete();
        $this->markPrincipal($product);
        $this->normalizeProducto($product);

        if ($publicId) {
            $this->media->destroyWithRetry($publicId, 'image', 'producto-media-'.$media->id);
        }

        return response()->json([
            'message' => 'Adjunto eliminado.',
            'code' => 'RESOURCE_DELETED',
        ]);
    }

    public function reorderProducto(Request $request, int $producto)
    {
        $product = Producto::query()->findOrFail($producto);
        if (! Gate::forUser($request->user())->allows('update.product', $product)) {
            return response()->json(['message' => 'Sin permiso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }

        $validated = $request->validate(['orden' => ['required', 'array', 'max:5']]);
        $ids = $this->media->normalizeOrder($validated['orden']);

        DB::transaction(function () use ($product, $ids): void {
            foreach ($ids as $index => $id) {
                $product->imagenes()->whereKey($id)->update([
                    'orden' => $index,
                    'principal' => $index === 0,
                ]);
            }
        });

        return response()->json([
            'data' => $product->imagenes()->where('estado', 'activo')->orderBy('orden')->get(),
        ]);
    }

    public function storeForo(Request $request, int $publicacion)
    {
        $post = Publicacion::query()->findOrFail($publicacion);
        if (! Gate::forUser($request->user())->allows('update.post', $post)) {
            return response()->json(['message' => 'Sin permiso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }

        $validated = $request->validate([
            'imagenes' => ['nullable', 'array', 'max:5'],
            'imagenes.*' => ['nullable', 'file'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'videos' => ['nullable', 'array', 'max:1'],
            'videos.*' => ['nullable', 'file'],
        ]);
        $files = array_merge(
            $validated['imagenes'] ?? [],
            $validated['videos'] ?? [],
        );
        if ($files === []) {
            throw ValidationException::withMessages([
                'imagenes' => ['Debes adjuntar al menos una imagen o video.'],
            ]);
        }
        $current = $post->imagenes()->where('estado', 'activo')->count();
        if ($current + count($files) > 5) {
            throw ValidationException::withMessages([
                'imagenes' => ['El post puede tener máximo 5 adjuntos.'],
            ]);
        }

        $created = [];
        foreach ($files as $index => $file) {
            $allowVideo = str_starts_with(strtolower((string) $file->getMimeType()), 'video/');
            $uploaded = $this->media->upload($file, 'foro_imagenes', 'Publicacion/'.$post->id, $allowVideo);
            $asset = $post->imagenes()->create([
                'imagen' => $uploaded['url'],
                'public_id' => $uploaded['public_id'],
                'mime_type' => $uploaded['mime_type'],
                'size' => $uploaded['size'],
                'width' => $uploaded['width'],
                'height' => $uploaded['height'],
                'poster_url' => $uploaded['poster_url'] ?? null,
                'playback_url' => $uploaded['playback_url'] ?? null,
                'procesamiento_estado' => str_starts_with($uploaded['mime_type'], 'video/')
                    ? 'procesando'
                    : 'listo',
                'alt_text' => $validated['alt_text'] ?? null,
                'estado' => 'activo',
                'orden' => $current + $index,
            ]);
            $created[] = $asset;
            if (str_starts_with($uploaded['mime_type'], 'video/')) {
                ProcesarVideoAsset::dispatch($asset->id);
            }
        }

        return response()->json([
            'message' => 'Adjuntos agregados.',
            'data' => $created,
        ], 201);
    }

    public function destroyForo(Request $request, int $publicacion, int $imagen)
    {
        $post = Publicacion::query()->findOrFail($publicacion);
        if (! Gate::forUser($request->user())->allows('update.post', $post)) {
            return response()->json(['message' => 'Sin permiso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }

        $attachment = $post->imagenes()->whereKey($imagen)->where('estado', 'activo')->first();
        if (! $attachment) {
            return response()->json(['message' => 'Adjunto inexistente.', 'code' => 'RESOURCE_DELETED'], 404);
        }

        $publicId = $attachment->public_id;
        $attachment->update(['estado' => 'eliminando']);
        $attachment->delete();
        $this->normalizeForo($post);
        if ($publicId) {
            $resourceType = str_starts_with((string) $attachment->mime_type, 'video/') ? 'video' : 'image';
            $this->media->destroyWithRetry($publicId, $resourceType, 'foro-media-'.$attachment->id);
        }

        return response()->json(['message' => 'Adjunto eliminado.', 'code' => 'RESOURCE_DELETED']);
    }

    public function reorderForo(Request $request, int $publicacion)
    {
        $post = Publicacion::query()->findOrFail($publicacion);
        if (! Gate::forUser($request->user())->allows('update.post', $post)) {
            return response()->json(['message' => 'Sin permiso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }

        $validated = $request->validate(['orden' => ['required', 'array', 'max:5']]);
        $ids = $this->media->normalizeOrder($validated['orden']);
        DB::transaction(function () use ($post, $ids): void {
            foreach ($ids as $index => $id) {
                $post->imagenes()->whereKey($id)->update(['orden' => $index]);
            }
        });

        return response()->json([
            'data' => $post->imagenes()->where('estado', 'activo')->orderBy('orden')->get(),
        ]);
    }

    public function replaceAvatar(Request $request)
    {
        $validated = $request->validate([
            'imagen' => ['required', 'file'],
            'alt_text' => ['nullable', 'string', 'max:255'],
        ]);

        $uploaded = $this->media->upload(
            $validated['imagen'],
            'profile_images',
            'Usuario/'.$request->user()->id,
        );
        $usuario = $request->user();
        $previousId = $usuario->foto_perfil_id;

        $usuario->update([
            'foto_perfil_url' => $uploaded['url'],
            'foto_perfil_id' => $uploaded['public_id'],
        ]);

        if ($previousId) {
            $this->media->destroyWithRetry(
                $previousId,
                'image',
                'usuario-avatar-'.$usuario->id,
            );
        }

        return response()->json([
            'message' => 'Foto de perfil reemplazada.',
            'data' => [
                'url' => $usuario->foto_perfil_url,
                'alt_text' => $validated['alt_text'] ?? 'Foto de perfil',
            ],
        ]);
    }

    public function replaceCover(Request $request)
    {
        $validated = $request->validate([
            'imagen' => ['required', 'file'],
            'alt_text' => ['nullable', 'string', 'max:255'],
        ]);

        $uploaded = $this->media->upload(
            $validated['imagen'],
            'background_images',
            'Usuario/'.$request->user()->id,
            false,
            [
                'transformation' => [
                    'quality' => 'auto',
                    'fetch_format' => 'jpg',
                    'width' => 1280,
                    'height' => 1600,
                    'crop' => 'limit',
                ],
            ],
        );
        $usuario = $request->user();
        $previousId = $usuario->img_background_id;

        $usuario->update([
            'img_background_url' => $uploaded['url'],
            'img_background_id' => $uploaded['public_id'],
        ]);

        if ($previousId) {
            $this->media->destroyWithRetry(
                $previousId,
                'image',
                'usuario-portada-'.$usuario->id,
            );
        }

        return response()->json([
            'message' => 'Portada reemplazada.',
            'data' => [
                'url' => $usuario->img_background_url,
                'alt_text' => $validated['alt_text'] ?? 'Portada de perfil',
            ],
        ]);
    }

    private function markPrincipal(Producto $product): void
    {
        $first = $product->imagenes()->where('estado', 'activo')->orderBy('orden')->first();
        $product->imagenes()->where('estado', 'activo')->update(['principal' => false]);
        if ($first) {
            $first->update(['principal' => true]);
        }
    }

    private function normalizeProducto(Producto $product): void
    {
        $ids = $product->imagenes()->where('estado', 'activo')->orderBy('orden')->pluck('id');
        foreach ($ids->values() as $index => $id) {
            $product->imagenes()->whereKey($id)->update(['orden' => $index]);
        }
    }

    private function normalizeForo(Publicacion $post): void
    {
        $ids = $post->imagenes()->where('estado', 'activo')->orderBy('orden')->pluck('id');
        foreach ($ids->values() as $index => $id) {
            $post->imagenes()->whereKey($id)->update(['orden' => $index]);
        }
    }
}
