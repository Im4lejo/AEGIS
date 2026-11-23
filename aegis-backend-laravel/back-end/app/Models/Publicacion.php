<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Publicacion extends Model
{
    protected $table = 'publicaciones_foro';

    public $timestamps = false;

    protected $attributes = [
        'visibilidad' => 'publica',
    ];

    protected $fillable = ['usuario_id', 'titulo', 'contenido', 'visibilidad'];

    protected function casts(): array
    {
        return ['fecha_publicacion' => 'datetime'];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function comentarios(): HasMany
    {
        return $this->hasMany(Comentario::class, 'publicacion_id');
    }

    public function imagenes(): HasMany
    {
        return $this->hasMany(ImagenPublicacionForo::class, 'publicacion_id')
            ->orderBy('orden');
    }
}
