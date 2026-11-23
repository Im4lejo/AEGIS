<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OpcionEncuesta extends Model
{
    protected $table = 'opciones_encuesta';

    protected $fillable = ['encuesta_id', 'texto', 'orden'];

    public function encuesta(): BelongsTo
    {
        return $this->belongsTo(Encuesta::class, 'encuesta_id');
    }

    public function votos(): HasMany
    {
        return $this->hasMany(VotoEncuesta::class, 'opcion_id');
    }
}
