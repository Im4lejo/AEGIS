<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ColeccionGuardado extends Model
{
    protected $table = 'colecciones_guardado';

    protected $fillable = ['usuario_id', 'nombre', 'privada'];

    protected function casts(): array
    {
        return ['privada' => 'boolean'];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function guardados(): HasMany
    {
        return $this->hasMany(Guardado::class, 'coleccion_id');
    }
}
