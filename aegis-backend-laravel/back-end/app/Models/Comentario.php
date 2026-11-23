<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comentario extends Model
{
    protected $table = 'comentarios_foro';

    public $timestamps = false;

    protected $fillable = [
        'publicacion_id',
        'usuario_id',
        'comentario_padre_id',
        'comentario',
        'estado',
        'editado_en',
        'votos_utiles',
        'es_solucion',
    ];

    protected function casts(): array
    {
        return [
            'fecha_comentario' => 'datetime',
            'editado_en' => 'datetime',
            'es_solucion' => 'boolean',
        ];
    }

    public function publicacion(): BelongsTo
    {
        return $this->belongsTo(Publicacion::class, 'publicacion_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function padre(): BelongsTo
    {
        return $this->belongsTo(Comentario::class, 'comentario_padre_id');
    }

    public function respuestas(): HasMany
    {
        return $this->hasMany(Comentario::class, 'comentario_padre_id')
            ->where('estado', '!=', 'eliminado')
            ->orderBy('fecha_comentario');
    }
}
