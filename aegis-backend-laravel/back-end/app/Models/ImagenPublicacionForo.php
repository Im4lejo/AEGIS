<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImagenPublicacionForo extends Model
{
    protected $table = 'imagenes_publicacion_foro';

    protected $fillable = [
        'publicacion_id',
        'imagen',
        'public_id',
        'orden',
    ];

    protected $hidden = ['public_id'];

    public function publicacion(): BelongsTo
    {
        return $this->belongsTo(Publicacion::class, 'publicacion_id');
    }
}
