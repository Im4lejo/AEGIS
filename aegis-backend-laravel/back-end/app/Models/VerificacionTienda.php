<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerificacionTienda extends Model
{
    protected $table = 'verificaciones_tienda';

    public $timestamps = false;

    protected $fillable = [
        'tienda_id',
        'solicitado_por',
        'revisado_por',
        'estado',
        'documentos',
        'nota',
        'fecha_solicitud',
        'fecha_revision',
    ];

    protected function casts(): array
    {
        return [
            'documentos' => 'array',
            'fecha_solicitud' => 'datetime',
            'fecha_revision' => 'datetime',
        ];
    }

    public function tienda(): BelongsTo
    {
        return $this->belongsTo(Tienda::class, 'tienda_id');
    }
}
