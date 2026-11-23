<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VisualizacionHistoria extends Model
{
    protected $table = 'visualizaciones_historia';
    public $timestamps = false;
    protected $fillable = ['historia_id', 'usuario_id', 'fecha'];
    protected function casts(): array
    {
        return ['fecha' => 'datetime'];
    }
    public function historia(): BelongsTo
    {
        return $this->belongsTo(Historia::class, 'historia_id');
    }
}
