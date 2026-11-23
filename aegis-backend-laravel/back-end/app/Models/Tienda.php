<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tienda extends Model
{
    protected $table = 'tiendas';

    public $timestamps = false;

    protected $fillable = [
        'owner_id',
        'tipo',
        'nombre',
        'slug',
        'descripcion',
        'politicas',
        'horario',
        'categorias',
        'enlaces',
        'contacto_permitido',
        'ciudad_aprox',
        'logo_url',
        'logo_id',
        'portada_url',
        'portada_id',
        'estado',
        'estado_verificacion',
        'verificada_en',
    ];

    protected function casts(): array
    {
        return [
            'horario' => 'array',
            'categorias' => 'array',
            'enlaces' => 'array',
            'fecha_creacion' => 'datetime',
            'verificada_en' => 'datetime',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'owner_id');
    }

    public function miembros(): HasMany
    {
        return $this->hasMany(MiembroTienda::class, 'tienda_id');
    }

    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'tienda_id');
    }

    public function verificaciones(): HasMany
    {
        return $this->hasMany(VerificacionTienda::class, 'tienda_id');
    }
}
