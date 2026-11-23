<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistorialOferta extends Model
{
    protected $table = 'historial_oferta';

    public $timestamps = false;

    protected $fillable = ['oferta_id', 'actor_id', 'accion', 'estado_anterior', 'estado_nuevo', 'monto_anterior', 'monto_nuevo', 'nota'];

    protected function casts(): array
    {
        return ['monto_anterior' => 'decimal:2', 'monto_nuevo' => 'decimal:2', 'fecha' => 'datetime'];
    }

    public function oferta(): BelongsTo
    {
        return $this->belongsTo(Oferta::class, 'oferta_id');
    }
}
