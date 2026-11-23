<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OperacionComercial extends Model
{
    protected $table = 'operaciones_comerciales';

    protected $fillable = ['producto_id', 'comprador_id', 'vendedor_id', 'oferta_id', 'conversacion_id', 'encuentro_id', 'monto_acordado', 'estado', 'fecha_acuerdo', 'fecha_completada'];

    protected function casts(): array
    {
        return ['monto_acordado' => 'decimal:2', 'fecha_acuerdo' => 'datetime', 'fecha_completada' => 'datetime'];
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
}
