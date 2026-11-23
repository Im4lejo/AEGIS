<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;

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
    ];

    protected function casts(): array
    {
        return [
            'reputacion' => 'decimal:2',
            'fecha_registro' => 'datetime',
            'email_verified_at' => 'datetime',
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
}
