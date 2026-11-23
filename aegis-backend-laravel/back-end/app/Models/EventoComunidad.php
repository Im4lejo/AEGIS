<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventoComunidad extends Model
{
    protected $table = 'eventos_comunidad';
    public $timestamps = false;
    protected $fillable = [
        'comunidad_id', 'creador_id', 'titulo', 'descripcion', 'lugar',
        'fecha_inicio', 'fecha_fin', 'cupo', 'estado',
    ];
    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'datetime',
            'fecha_fin' => 'datetime',
            'fecha_creacion' => 'datetime',
        ];
    }
    public function comunidad(): BelongsTo
    {
        return $this->belongsTo(Comunidad::class, 'comunidad_id');
    }
    public function participaciones(): HasMany
    {
        return $this->hasMany(ParticipacionEvento::class, 'evento_id');
    }
}
