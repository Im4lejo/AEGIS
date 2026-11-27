<?php

namespace App\Services;

use App\Contracts\MediaStorage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MediaManager
{
    public function __construct(private MediaStorage $storage) {}

    public function videoPosterUrl(string $secureUrl): string
    {
        return str_contains($secureUrl, '/upload/')
            ? str_replace('/upload/', '/upload/so_1,w_1280,c_limit,q_auto,f_jpg/', $secureUrl)
            : $secureUrl;
    }

    public function validate(UploadedFile $file, bool $allowVideo = false): array
    {
        $mime = strtolower((string) $file->getMimeType());
        $allowedImage = ['image/jpeg', 'image/png', 'image/webp'];
        $allowedVideo = ['video/mp4', 'video/webm', 'video/quicktime'];
        $allowed = $allowVideo
            ? array_merge($allowedImage, $allowedVideo)
            : $allowedImage;

        if (! in_array($mime, $allowed, true)) {
            throw ValidationException::withMessages([
                'media' => ['Formato no permitido.'],
            ]);
        }

        $maxBytes = str_starts_with($mime, 'video/') ? 25 * 1024 * 1024 : 5 * 1024 * 1024;
        if ($file->getSize() === false || $file->getSize() > $maxBytes) {
            throw ValidationException::withMessages([
                'media' => ['El archivo excede el límite permitido.'],
            ]);
        }

        $width = null;
        $height = null;
        if (str_starts_with($mime, 'image/') && $file->getRealPath()) {
            $size = getimagesize($file->getRealPath());
            if ($size !== false) {
                [$width, $height] = [$size[0], $size[1]];
                if ($width > 5000 || $height > 5000) {
                    throw ValidationException::withMessages([
                        'media' => ['La imagen excede el límite de 5000 x 5000 píxeles.'],
                    ]);
                }
            }
        }

        return [
            'mime' => $mime,
            'size' => $file->getSize(),
            'width' => $width,
            'height' => $height,
            'resource_type' => str_starts_with($mime, 'video/') ? 'video' : 'image',
        ];
    }

    public function upload(
        UploadedFile $file,
        string $folder,
        string $resourceId,
        bool $allowVideo = false,
        array $storageOptions = [],
    ): array {
        $metadata = $this->validate($file, $allowVideo);
        $uploaded = $this->storage->upload(
            $file,
            $folder,
            array_merge(
                ['resource_type' => $metadata['resource_type']],
                $storageOptions,
            ),
        );

        if (! $uploaded['public_id'] || ! $uploaded['url']) {
            throw new \RuntimeException('El proveedor no devolvió identificador o URL.');
        }

        return [
            'public_id' => $uploaded['public_id'],
            'url' => $uploaded['url'],
            'poster_url' => $metadata['resource_type'] === 'video'
                ? $this->videoPosterUrl($uploaded['url'])
                : null,
            'playback_url' => $metadata['resource_type'] === 'video'
                ? $uploaded['url']
                : null,
            'mime_type' => $metadata['mime'],
            'size' => $metadata['size'],
            'width' => $uploaded['width'] ?? $metadata['width'],
            'height' => $uploaded['height'] ?? $metadata['height'],
            'estado' => 'activo',
            'resource_type' => $metadata['resource_type'],
        ];
    }

    public function exists(string $publicId, string $resourceType = 'image'): bool
    {
        return $this->storage->exists($publicId, $resourceType);
    }

    public function destroyWithRetry(
        string $publicId,
        string $resourceType,
        string $resourceKey,
    ): void {
        $attempted = false;
        for ($attempt = 1; $attempt <= 3; $attempt++) {
            try {
                if ($this->storage->destroy($publicId, $resourceType)) {
                    $attempted = true;
                    break;
                }
            } catch (\Throwable $error) {
                report($error);
            }
            usleep(100000 * $attempt);
        }

        if (! $attempted) {
            DB::table('operaciones_media')->updateOrInsert(
                ['clave' => $resourceKey],
                [
                    'accion' => 'eliminar',
                    'recurso_tipo' => $resourceType,
                    'recurso_id' => 0,
                    'public_id' => $publicId,
                    'payload' => json_encode(['resource_type' => $resourceType]),
                    'estado' => 'pendiente',
                    'intentos' => 0,
                    'proximo_intento' => now()->addMinutes(5),
                    'updated_at' => now(),
                    'created_at' => now(),
                ],
            );
        }
    }

    public function normalizeOrder(array $ids): array
    {
        $ids = array_values(array_unique(array_map('intval', $ids)));
        if ($ids === []) {
            throw ValidationException::withMessages([
                'orden' => ['Debe incluir al menos un identificador.'],
            ]);
        }

        return $ids;
    }
}
