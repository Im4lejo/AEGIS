<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversacion extends Model
{
    protected $table = 'conversaciones';

    public $timestamps = false;

    protected $fillable = [
        'tipo',
        'titulo',
        'producto_id',
        'contexto_clave',
        'estado',
        'ultimo_mensaje_en',
    ];

    protected function casts(): array
    {
        return [
            'fecha_creacion' => 'datetime',
            'ultimo_mensaje_en' => 'datetime',
        ];
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    public function participantes(): HasMany
    {
        return $this->hasMany(ParticipanteConversacion::class, 'conversacion_id');
    }

    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(Usuario::class, 'participantes_conversacion', 'conversacion_id', 'usuario_id')
            ->withPivot(['rol', 'estado', 'recibos_opt_in', 'notificar', 'ultimo_leido_en', 'oculto_en']);
    }

    public function mensajes(): HasMany
    {
        return $this->hasMany(Mensaje::class, 'conversacion_id');
    }
}
