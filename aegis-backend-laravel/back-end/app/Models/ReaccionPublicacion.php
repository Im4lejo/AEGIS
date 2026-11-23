<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReaccionPublicacion extends Model
{
    protected $table = 'reacciones_publicacion';

    public $timestamps = false;

    protected $fillable = ['publicacion_id', 'usuario_id', 'tipo'];

    protected function casts(): array
    {
        return ['fecha_reaccion' => 'datetime'];
    }

    public function publicacion(): BelongsTo
    {
        return $this->belongsTo(Publicacion::class, 'publicacion_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
