<?php

namespace App\Jobs;

use App\Models\Historia;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ExpirarHistorias implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        Historia::query()
            ->where('estado', 'activa')
            ->where('expira_en', '<=', now())
            ->update(['estado' => 'expirada']);
    }
}
