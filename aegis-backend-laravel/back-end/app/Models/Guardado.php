<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Guardado extends Model
{
    protected $table = 'guardados';

    protected $fillable = [
        'usuario_id',
        'coleccion_id',
        'recurso_tipo',
        'recurso_id',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function coleccion(): BelongsTo
    {
        return $this->belongsTo(ColeccionGuardado::class, 'coleccion_id');
    }
}
