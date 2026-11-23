<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReferenciaPublicacion extends Model
{
    protected $table = 'referencias_publicacion';

    protected $fillable = [
        'publicacion_id',
        'tipo',
        'producto_id',
        'publicacion_referida_id',
        'comunidad_id',
        'punto_id',
        'orden',
    ];

    public function publicacion(): BelongsTo
    {
        return $this->belongsTo(Publicacion::class, 'publicacion_id');
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    public function publicacionReferida(): BelongsTo
    {
        return $this->belongsTo(Publicacion::class, 'publicacion_referida_id');
    }

    public function comunidad(): BelongsTo
    {
        return $this->belongsTo(Comunidad::class, 'comunidad_id');
    }

    public function punto(): BelongsTo
    {
        return $this->belongsTo(PuntoFisico::class, 'punto_id');
    }
}
