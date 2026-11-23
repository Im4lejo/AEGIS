<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EnlacePerfil extends Model
{
    protected $table = 'enlaces_perfil';

    protected $fillable = ['usuario_id', 'tipo', 'url', 'orden'];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
