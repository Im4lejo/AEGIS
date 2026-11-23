<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParticipacionEvento extends Model
{
    protected $table = 'participaciones_evento';
    public $timestamps = false;
    protected $fillable = ['evento_id', 'usuario_id', 'estado', 'recordatorio', 'recordar_en', 'fecha'];
    protected function casts(): array
    {
        return [
            'recordatorio' => 'boolean',
            'recordar_en' => 'datetime',
            'fecha' => 'datetime',
        ];
    }
    public function evento(): BelongsTo
    {
        return $this->belongsTo(EventoComunidad::class, 'evento_id');
    }
}
