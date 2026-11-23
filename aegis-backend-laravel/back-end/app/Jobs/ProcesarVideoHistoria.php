<?php

namespace App\Jobs;

use App\Models\Historia;
use App\Services\MediaManager;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcesarVideoHistoria implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private int $historiaId) {}

    public function handle(MediaManager $media): void
    {
        $story = Historia::query()->find($this->historiaId);
        if (! $story || $story->tipo_media !== 'video') {
            return;
        }
        $ready = $story->media_public_id
            && $media->exists((string) $story->media_public_id, 'video');
        $story->update([
            'poster_url' => $story->poster_url ?: $media->videoPosterUrl((string) $story->media_url),
            'playback_url' => $story->playback_url ?: (string) $story->media_url,
            'procesamiento_estado' => $ready ? 'listo' : 'error',
        ]);
    }
}
