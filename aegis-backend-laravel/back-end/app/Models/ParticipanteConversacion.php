<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParticipanteConversacion extends Model
{
    protected $table = 'participantes_conversacion';

    protected $fillable = [
        'conversacion_id',
        'usuario_id',
        'rol',
        'estado',
        'recibos_opt_in',
        'notificar',
        'oculto_en',
        'ultimo_leido_en',
    ];

    protected function casts(): array
    {
        return [
            'recibos_opt_in' => 'boolean',
            'notificar' => 'boolean',
            'oculto_en' => 'datetime',
            'ultimo_leido_en' => 'datetime',
        ];
    }

    public function conversacion(): BelongsTo
    {
        return $this->belongsTo(Conversacion::class, 'conversacion_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
