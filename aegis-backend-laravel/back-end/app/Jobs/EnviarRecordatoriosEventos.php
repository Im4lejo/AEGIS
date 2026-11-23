<?php

namespace App\Jobs;

use App\Models\ParticipacionEvento;
use App\Services\NotificationDispatcher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EnviarRecordatoriosEventos implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(NotificationDispatcher $notifications): void
    {
        ParticipacionEvento::query()
            ->with('evento')
            ->where('recordatorio', true)
            ->where('estado', 'asistira')
            ->whereNotNull('recordar_en')
            ->where('recordar_en', '<=', now())
            ->chunkById(100, function ($participations): void {
                foreach ($participations as $participation) {
                    if (! $participation->evento || $participation->evento->estado !== 'activo') {
                        continue;
                    }
                    $notifications->emit(
                        (int) $participation->usuario_id,
                        'marketplace',
                        'evento',
                        'Recordatorio de evento',
                        'Tu evento '.$participation->evento->titulo.' comienza pronto.',
                        null,
                        'evento',
                        (int) $participation->evento_id,
                        '/comunidades',
                        'evento-recordatorio-'.$participation->id,
                    );
                    $participation->update(['recordatorio' => false]);
                }
            });
    }
}
