<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Encuentro extends Model
{
    protected $table = 'encuentros';

    public $timestamps = false;

    protected $fillable = [
        'comprador_id',
        'vendedor_id',
        'producto_id',
        'punto_fisico_id',
        'fecha_encuentro',
        'hora_encuentro',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'fecha_encuentro' => 'date',
            'fecha_creacion' => 'datetime',
        ];
    }

    public function comprador(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'comprador_id');
    }

    public function vendedor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'vendedor_id');
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    public function puntoFisico(): BelongsTo
    {
        return $this->belongsTo(PuntoFisico::class, 'punto_fisico_id');
    }

    public function codigoQr(): HasOne
    {
        return $this->hasOne(CodigoQr::class, 'encuentro_id');
    }

    public function calificaciones(): HasMany
    {
        return $this->hasMany(Calificacion::class, 'encuentro_id');
    }
}
