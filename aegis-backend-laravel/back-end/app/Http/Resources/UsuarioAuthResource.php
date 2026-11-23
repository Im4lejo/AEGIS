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
        ];
    }
}
