<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Publicacion extends Model
{
    protected $table = 'publicaciones_foro';

    public $timestamps = false;

    protected $attributes = [
        'visibilidad' => 'publica',
    ];

    protected $fillable = [
        'usuario_id',
        'titulo',
        'contenido',
        'visibilidad',
        'estado',
        'programada_para',
        'editada_en',
        'fijada',
        'rank_base',
        'etiquetas',
        'menciones',
        'comunidad_id',
        'enlace_preview_url',
        'enlace_preview_titulo',
        'tipo',
        'interaccion_estado',
        'respuesta_aceptada_id',
        'cerrado_en',
        'ultima_actividad',
        'actividad_score',
    ];

    protected function casts(): array
    {
        return [
            'fecha_publicacion' => 'datetime',
            'programada_para' => 'datetime',
            'editada_en' => 'datetime',
            'fijada' => 'boolean',
            'etiquetas' => 'array',
            'menciones' => 'array',
            'cerrado_en' => 'datetime',
            'ultima_actividad' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function comentarios(): HasMany
    {
        return $this->hasMany(Comentario::class, 'publicacion_id');
    }

    public function imagenes(): HasMany
    {
        return $this->hasMany(ImagenPublicacionForo::class, 'publicacion_id')
            ->orderBy('orden');
    }

    public function reacciones(): HasMany
    {
        return $this->hasMany(ReaccionPublicacion::class, 'publicacion_id');
    }

    public function menciones(): BelongsToMany
    {
        return $this->belongsToMany(
            Usuario::class,
            'menciones_publicacion',
            'publicacion_id',
            'usuario_id',
        )->withTimestamps();
    }

    public function comunidad(): BelongsTo
    {
        return $this->belongsTo(Comunidad::class, 'comunidad_id');
    }

    public function referencias(): HasMany
    {
        return $this->hasMany(ReferenciaPublicacion::class, 'publicacion_id')
            ->orderBy('orden');
    }
}
