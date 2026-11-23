<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreguntaProducto extends Model
{
    protected $table = 'preguntas_producto';

    public $timestamps = false;

    protected $fillable = [
        'producto_id',
        'usuario_id',
        'pregunta',
        'respuesta',
        'respondido_por',
        'estado',
        'fecha_pregunta',
        'fecha_respuesta',
        'editada_en',
    ];

    protected function casts(): array
    {
        return [
            'fecha_pregunta' => 'datetime',
            'fecha_respuesta' => 'datetime',
            'editada_en' => 'datetime',
        ];
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function respondidoPor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'respondido_por');
    }
}
