<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdjuntoMensaje extends Model
{
    protected $table = 'adjuntos_mensaje';

    public $timestamps = false;

    protected $fillable = [
        'mensaje_id',
        'public_id',
        'url',
        'nombre_original',
        'mime_type',
        'size',
    ];

    protected function casts(): array
    {
        return ['fecha' => 'datetime'];
    }

    public function mensaje(): BelongsTo
    {
        return $this->belongsTo(Mensaje::class, 'mensaje_id');
    }
}
