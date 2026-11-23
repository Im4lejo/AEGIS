<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, Notifiable;

    protected $table = 'usuarios';

    public $timestamps = false;

    protected $hidden = ['password', 'remember_token'];

    protected $fillable = [
        'nombre',
        'apellido',
        'username',
        'email',
        'email_verified_at',
        'password',
        'telefono',
        'ciudad',
        'img_background_url',
        'img_background_id',
        'foto_perfil_url',
        'foto_perfil_id',
        'descripcion',
        'reputacion',
        'rol',
        'estado',
        'url_publica',
        'ciudad_aprox',
        'perfil_privado',
        'mostrar_seguidores',
        'mostrar_presencia',
        'ultima_actividad',
        'publicacion_fijada_id',
    ];

    protected function casts(): array
    {
        return [
            'reputacion' => 'decimal:2',
            'fecha_registro' => 'datetime',
            'email_verified_at' => 'datetime',
            'ultima_actividad' => 'datetime',
            'perfil_privado' => 'boolean',
            'mostrar_seguidores' => 'boolean',
            'mostrar_presencia' => 'boolean',
        ];
    }

    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'usuario_id');
    }

    public function publicaciones(): HasMany
    {
        return $this->hasMany(Publicacion::class, 'usuario_id');
    }

    public function comentarios(): HasMany
    {
        return $this->hasMany(Comentario::class, 'usuario_id');
    }

    public function puntosFisicos(): HasMany
    {
        return $this->hasMany(PuntoFisico::class, 'owner_id');
    }

    public function enlaces(): HasMany
    {
        return $this->hasMany(EnlacePerfil::class, 'usuario_id')->orderBy('orden');
    }

    public function seguimientoHecho(): HasMany
    {
        return $this->hasMany(Seguimiento::class, 'seguidor_id');
    }

    public function seguimientoRecibido(): HasMany
    {
        return $this->hasMany(Seguimiento::class, 'seguido_id');
    }

    public function publicacionFijada(): BelongsTo
    {
        return $this->belongsTo(Publicacion::class, 'publicacion_fijada_id');
    }

    public function preferenciasUsuario(): HasOne
    {
        return $this->hasOne(PreferenciaUsuario::class, 'usuario_id');
    }
}
