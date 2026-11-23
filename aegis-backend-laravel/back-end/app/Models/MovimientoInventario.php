<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovimientoInventario extends Model
{
    protected $table = 'movimientos_inventario';

    public $timestamps = false;

    protected $fillable = [
        'inventario_id',
        'actor_id',
        'tipo',
        'cantidad',
        'stock_antes',
        'stock_despues',
        'motivo',
    ];

    protected function casts(): array
    {
        return ['fecha' => 'datetime'];
    }

    public function inventario(): BelongsTo
    {
        return $this->belongsTo(InventarioProducto::class, 'inventario_id');
    }
}
