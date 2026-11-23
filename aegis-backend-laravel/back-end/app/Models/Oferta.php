<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Oferta extends Model
{
    protected $table = 'ofertas';

    protected $fillable = [
        'producto_id', 'comprador_id', 'vendedor_id', 'conversacion_id',
        'monto', 'estado', 'expira_en', 'mensaje',
    ];

    protected function casts(): array
    {
        return [
            'monto' => 'decimal:2',
            'expira_en' => 'datetime',
        ];
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    public function comprador(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'comprador_id');
    }

    public function vendedor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'vendedor_id');
    }

    public function conversacion(): BelongsTo
    {
        return $this->belongsTo(Conversacion::class, 'conversacion_id');
    }

    public function historial(): HasMany
    {
        return $this->hasMany(HistorialOferta::class, 'oferta_id');
    }
}
