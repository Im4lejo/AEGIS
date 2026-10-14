<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reporte extends Model
{
    protected $table = 'reportes';

    public $timestamps = false;

    protected $fillable = [
        'usuario_reporta_id',
        'usuario_reportado_id',
        'motivo',
        'descripcion',
        'estado',
    ];

    protected function casts(): array
    {
        return ['fecha_reporte' => 'datetime'];
    }

    public function reportante(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_reporta_id');
    }

    public function reportado(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_reportado_id');
    }
}
