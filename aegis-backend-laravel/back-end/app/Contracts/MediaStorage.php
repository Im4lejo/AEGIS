<?php

namespace App\Contracts;

use Illuminate\Http\UploadedFile;

interface MediaStorage
{
    public function upload(UploadedFile $file, string $folder, array $options = []): array;

    public function destroy(string $publicId, string $resourceType = 'image'): bool;

    public function exists(string $publicId, string $resourceType = 'image'): bool;
}
