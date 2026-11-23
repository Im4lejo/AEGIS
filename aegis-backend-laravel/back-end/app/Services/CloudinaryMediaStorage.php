<?php

namespace App\Services;

use App\Contracts\MediaStorage;
use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;

class CloudinaryMediaStorage implements MediaStorage
{
    private ?Cloudinary $cloudinary = null;

    public function __construct() {}

    private function cloudinary(): Cloudinary
    {
        return $this->cloudinary
            ??= new Cloudinary(config('cloudinary.cloud_url'));
    }

    public function upload(UploadedFile $file, string $folder, array $options = []): array
    {
        $resultado = $this->cloudinary()->uploadApi()->upload(
            $file->getRealPath(),
            array_merge([
                'folder' => $folder,
                'resource_type' => $options['resource_type'] ?? 'image',
                'overwrite' => false,
                'unique_filename' => true,
                'transformation' => [
                    'quality' => 'auto',
                    'fetch_format' => 'auto',
                    'width' => 1600,
                    'height' => 1600,
                    'crop' => 'limit',
                ],
            ], $options),
        );

        return [
            'public_id' => $resultado['public_id'] ?? null,
            'url' => $resultado['secure_url'] ?? null,
            'width' => $resultado['width'] ?? null,
            'height' => $resultado['height'] ?? null,
            'bytes' => $resultado['bytes'] ?? null,
            'format' => $resultado['format'] ?? null,
        ];
    }

    public function destroy(string $publicId, string $resourceType = 'image'): bool
    {
        $resultado = $this->cloudinary()->uploadApi()->destroy(
            $publicId,
            ['resource_type' => $resourceType],
        );

        return ($resultado['result'] ?? null) === 'ok';
    }

    public function exists(string $publicId, string $resourceType = 'image'): bool
    {
        try {
            $this->cloudinary()->adminApi()->asset(
                $publicId,
                ['resource_type' => $resourceType],
            );

            return true;
        } catch (\Throwable) {
            return false;
        }
    }
}
