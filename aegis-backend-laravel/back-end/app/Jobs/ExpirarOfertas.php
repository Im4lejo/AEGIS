<?php

namespace App\Jobs;

use App\Models\Oferta;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ExpirarOfertas implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        Oferta::query()
            ->whereIn('estado', ['pendiente', 'contraoferta'])
            ->whereNotNull('expira_en')
            ->where('expira_en', '<=', now())
            ->update(['estado' => 'expirada']);
    }
}
