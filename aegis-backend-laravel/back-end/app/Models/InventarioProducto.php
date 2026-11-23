<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventarioProducto extends Model
{
    protected $table = 'inventario_producto';

    protected $fillable = [
        'producto_id',
        'tienda_id',
        'stock',
        'stock_reservado',
        'seguimiento_stock',
        'actualizado_en',
    ];

    protected function casts(): array
    {
        return [
            'seguimiento_stock' => 'boolean',
            'actualizado_en' => 'datetime',
        ];
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    public function tienda(): BelongsTo
    {
        return $this->belongsTo(Tienda::class, 'tienda_id');
    }

    public function movimientos(): HasMany
    {
        return $this->hasMany(MovimientoInventario::class, 'inventario_id');
    }
}
