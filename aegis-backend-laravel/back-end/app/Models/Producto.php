<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Producto extends Model
{
    protected $table = 'productos';

    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'categoria_id',
        'titulo',
        'descripcion',
        'precio',
        'estado_producto',
        'ciudad',
        'estado_publicacion',
    ];

    protected function casts(): array
    {
        return [
            'precio' => 'decimal:2',
            'fecha_publicacion' => 'datetime',
        ];
    }

    public function scopeActivo(Builder $query): Builder
    {
        return $query->where('estado_publicacion', 'activo');
    }

    public function vendedor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function imagenes(): HasMany
    {
        return $this->hasMany(ImagenProducto::class, 'producto_id')
            ->orderByDesc('principal')
            ->orderBy('id');
    }

    public function encuentros(): HasMany
    {
        return $this->hasMany(Encuentro::class, 'producto_id');
    }
}