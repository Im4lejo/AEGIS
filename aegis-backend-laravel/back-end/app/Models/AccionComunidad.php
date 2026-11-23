<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccionComunidad extends Model
{
    protected $table = 'acciones_comunidad';

    public $timestamps = false;

    protected $fillable = [
        'comunidad_id',
        'actor_id',
        'objetivo_id',
        'accion',
        'datos',
    ];

    protected function casts(): array
    {
        return [
            'datos' => 'array',
            'fecha' => 'datetime',
        ];
    }

    public function comunidad(): BelongsTo
    {
        return $this->belongsTo(Comunidad::class, 'comunidad_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'actor_id');
    }

    public function objetivo(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'objetivo_id');
    }
}
