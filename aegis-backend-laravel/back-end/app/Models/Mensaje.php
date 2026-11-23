<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mensaje extends Model
{
    protected $table = 'mensajes';

    public $timestamps = false;

    protected $fillable = [
        'conversacion_id',
        'autor_id',
        'respondido_a_id',
        'contenido',
        'estado',
        'editado_en',
        'fecha_envio',
    ];

    protected function casts(): array
    {
        return [
            'editado_en' => 'datetime',
            'fecha_envio' => 'datetime',
        ];
    }

    public function autor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'autor_id');
    }

    public function conversacion(): BelongsTo
    {
        return $this->belongsTo(Conversacion::class, 'conversacion_id');
    }

    public function adjuntos(): HasMany
    {
        return $this->hasMany(AdjuntoMensaje::class, 'mensaje_id');
    }

    public function respuestas(): HasMany
    {
        return $this->hasMany(Mensaje::class, 'respondido_a_id');
    }
}
