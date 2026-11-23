<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PuntoFisico extends Model
{
    protected $table = 'puntos_fisicos';

    public $timestamps = false;

    protected $fillable = [
        'owner_id',
        'nombre',
        'descripcion',
        'direccion',
        'ciudad',
        'telefono',
        'imagen',
        'reputacion',
        'estado',
        'servicios',
        'reglas',
        'latitud',
        'longitud',
        'estado_revision',
    ];

    protected function casts(): array
    {
        return [
            'reputacion' => 'decimal:2',
            'fecha_registro' => 'datetime',
            'servicios' => 'array',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'owner_id');
    }

    public function encuentros(): HasMany
    {
        return $this->hasMany(Encuentro::class, 'punto_fisico_id');
    }
}
