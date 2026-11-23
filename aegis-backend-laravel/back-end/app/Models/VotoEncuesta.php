<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VotoEncuesta extends Model
{
    protected $table = 'votos_encuesta';

    public $timestamps = false;

    protected $fillable = ['encuesta_id', 'opcion_id', 'usuario_id'];

    protected function casts(): array
    {
        return ['fecha_voto' => 'datetime'];
    }

    public function encuesta(): BelongsTo
    {
        return $this->belongsTo(Encuesta::class, 'encuesta_id');
    }

    public function opcion(): BelongsTo
    {
        return $this->belongsTo(OpcionEncuesta::class, 'opcion_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
