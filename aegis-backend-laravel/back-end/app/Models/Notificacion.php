<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notificacion extends Model
{
    protected $table = 'notificaciones';

    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'categoria',
        'tipo',
        'actor_id',
        'objeto_tipo',
        'objeto_id',
        'destino',
        'dedupe_key',
        'titulo',
        'mensaje',
        'leida',
        'leida_en',
        'archivada_en',
    ];

    protected function casts(): array
    {
        return [
            'leida' => 'boolean',
            'fecha_creacion' => 'datetime',
            'leida_en' => 'datetime',
            'archivada_en' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
