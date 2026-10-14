<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Calificacion extends Model
{
    protected $table = 'calificaciones';

    public $timestamps = false;

    protected $fillable = [
        'encuentro_id',
        'autor_id',
        'receptor_id',
        'puntuacion',
        'comentario',
    ];

    protected function casts(): array
    {
        return [
            'puntuacion' => 'integer',
            'fecha_calificacion' => 'datetime',
        ];
    }

    public function encuentro(): BelongsTo
    {
        return $this->belongsTo(Encuentro::class, 'encuentro_id');
    }

    public function autor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'autor_id');
    }

    public function receptor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'receptor_id');
    }
}
