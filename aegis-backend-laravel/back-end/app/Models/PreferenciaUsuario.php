<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreferenciaUsuario extends Model
{
    protected $table = 'preferencias_usuario';

    protected $fillable = [
        'usuario_id',
        'version',
        'preferencias',
        'ultima_sincronizacion',
    ];

    protected function casts(): array
    {
        return [
            'preferencias' => 'array',
            'ultima_sincronizacion' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
