<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Historia extends Model
{
    protected $table = 'historias';

    public $timestamps = false;

    protected $fillable = [
        'usuario_id', 'comunidad_id', 'tipo_media', 'media_url', 'media_public_id',
        'mime_type', 'texto', 'audiencia', 'estado', 'expira_en', 'visualizaciones',
    ];

    protected function casts(): array
    {
        return [
            'expira_en' => 'datetime',
            'fecha_creacion' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function visualizaciones(): HasMany
    {
        return $this->hasMany(VisualizacionHistoria::class, 'historia_id');
    }
}
