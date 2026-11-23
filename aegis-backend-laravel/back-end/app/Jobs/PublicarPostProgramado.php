<?php

namespace App\Jobs;

use App\Models\Publicacion;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class PublicarPostProgramado implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $publicacionId) {}

    public function handle(): void
    {
        $post = Publicacion::query()->find($this->publicacionId);
        if (! $post || $post->estado !== 'programado') {
            return;
        }

        if (! $post->programada_para || $post->programada_para->isFuture()) {
            return;
        }

        $post->update([
            'estado' => 'publicado',
            'fecha_publicacion' => now(),
        ]);
    }
}
