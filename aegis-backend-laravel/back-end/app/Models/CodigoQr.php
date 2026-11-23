<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CodigoQr extends Model
{
    protected $table = 'codigos_qr';

    public $timestamps = false;

    protected $fillable = [
        'encuentro_id',
        'codigo',
        'token_hash',
        'estado',
        'expira_en',
        'usado_en',
        'validado_por',
        'evidencia',
    ];

    protected function casts(): array
    {
        return [
            'fecha_generacion' => 'datetime',
            'expira_en' => 'datetime',
            'usado_en' => 'datetime',
            'evidencia' => 'array',
        ];
    }

    public function encuentro(): BelongsTo
    {
        return $this->belongsTo(Encuentro::class, 'encuentro_id');
    }
}
