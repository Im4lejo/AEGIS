<?php

namespace App\Jobs;

use App\Models\ImagenPublicacionForo;
use App\Services\MediaManager;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcesarVideoAsset implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private int $assetId) {}

    public function handle(MediaManager $media): void
    {
        $asset = ImagenPublicacionForo::query()->find($this->assetId);
        if (! $asset || ! str_starts_with((string) $asset->mime_type, 'video/')) {
            return;
        }
        if (! $asset->public_id || ! $media->exists((string) $asset->public_id, 'video')) {
            $asset->update(['procesamiento_estado' => 'error']);
            return;
        }
        $asset->update([
            'poster_url' => $asset->poster_url ?: $media->videoPosterUrl((string) $asset->imagen),
            'playback_url' => $asset->playback_url ?: (string) $asset->imagen,
            'procesamiento_estado' => 'listo',
        ]);
    }
}
