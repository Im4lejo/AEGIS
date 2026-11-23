<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembresiaComunidad extends Model
{
    protected $table = 'membresias_comunidad';

    protected $fillable = [
        'comunidad_id',
        'usuario_id',
        'rol',
        'estado',
        'fecha_union',
        'fecha_solicitud',
    ];

    protected function casts(): array
    {
        return [
            'fecha_union' => 'datetime',
            'fecha_solicitud' => 'datetime',
        ];
    }

    public function comunidad(): BelongsTo
    {
        return $this->belongsTo(Comunidad::class, 'comunidad_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
