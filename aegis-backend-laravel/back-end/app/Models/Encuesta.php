<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Encuesta extends Model
{
    protected $table = 'encuestas';

    protected $fillable = [
        'publicacion_id',
        'pregunta',
        'permite_multiple',
        'finaliza_en',
    ];

    protected function casts(): array
    {
        return [
            'permite_multiple' => 'boolean',
            'finaliza_en' => 'datetime',
        ];
    }

    public function publicacion(): BelongsTo
    {
        return $this->belongsTo(Publicacion::class, 'publicacion_id');
    }

    public function opciones(): HasMany
    {
        return $this->hasMany(OpcionEncuesta::class, 'encuesta_id')
            ->orderBy('orden');
    }

    public function votos(): HasMany
    {
        return $this->hasMany(VotoEncuesta::class, 'encuesta_id');
    }
}
