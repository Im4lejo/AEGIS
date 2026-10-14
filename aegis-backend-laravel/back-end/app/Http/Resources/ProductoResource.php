<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class ProductoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $imagenes = $this->whenLoaded('imagenes');
        $imagenPrincipal = $imagenes instanceof Collection
            ? ($imagenes->firstWhere('principal', true) ?? $imagenes->first())
            : null;

        return [
            'id' => $this->id,
            'usuario_id' => $this->usuario_id,
            'categoria_id' => $this->categoria_id,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'precio' => $this->precio,
            'estado_producto' => $this->estado_producto,
            'ciudad' => $this->ciudad,
            'estado_publicacion' => $this->estado_publicacion,
            'fecha_publicacion' => $this->fecha_publicacion,
            'categoria' => $this->whenLoaded('categoria', fn () => $this->categoria->only([
                'id',
                'nombre',
                'descripcion',
            ])),
            'vendedor' => $this->whenLoaded('vendedor', fn () => $this->vendedor->only([
                'id',
                'nombre',
                'apellido',
                'username',
                'foto_perfil',
                'reputacion',
            ])),
            'imagenes' => $this->whenLoaded('imagenes', fn () => $imagenes->map(
                fn ($imagen) => $imagen->only(['id', 'imagen', 'principal'])
            )->values()),
            'imagen_principal' => $imagenPrincipal?->imagen,
        ];
    }
}
