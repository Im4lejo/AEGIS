<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comunidad extends Model
{
    protected $table = 'comunidades';

    public $timestamps = false;

    protected $fillable = [
        'owner_id',
        'nombre',
        'slug',
        'descripcion',
        'normas',
        'categoria',
        'visibilidad',
        'estado',
        'icono_url',
        'icono_id',
        'portada_url',
        'portada_id',
        'avisos_activos',
    ];

    protected function casts(): array
    {
        return [
            'fecha_creacion' => 'datetime',
            'avisos_activos' => 'boolean',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'owner_id');
    }

    public function membresias(): HasMany
    {
        return $this->hasMany(MembresiaComunidad::class, 'comunidad_id');
    }

    public function publicaciones(): HasMany
    {
        return $this->hasMany(Publicacion::class, 'comunidad_id');
    }

    public function acciones(): HasMany
    {
        return $this->hasMany(AccionComunidad::class, 'comunidad_id');
    }
}
