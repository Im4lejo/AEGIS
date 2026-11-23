<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UsuarioAuthResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'apellido' => $this->apellido,
            'username' => $this->username,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'foto_perfil_url' => $this->foto_perfil_url,
            'rol' => $this->rol,
            'estado' => $this->estado,
            'capabilities' => [
                'leer_publico' => in_array($this->estado, ['activo', null], true),
                'publicar' => in_array($this->estado, ['activo', null], true),
                'editar_propios' => in_array($this->estado, ['activo', null], true),
                'eliminar_propios' => in_array($this->estado, ['activo', null], true),
                'moderar' => in_array($this->estado, ['activo', null], true) && in_array($this->rol, ['owner', 'admin'], true),
                'gestionar_puntos' => in_array($this->estado, ['activo', null], true) && in_array($this->rol, ['owner', 'admin'], true),
                'gestionar_tienda' => in_array($this->estado, ['activo', null], true),
                'administrar_cuentas' => in_array($this->estado, ['activo', null], true) && $this->rol === 'admin',
            ],
        ];
    }
}
