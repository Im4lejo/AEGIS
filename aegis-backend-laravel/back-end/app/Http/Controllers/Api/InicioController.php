<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductoResource;
use App\Models\Producto;

class InicioController extends Controller
{
    public function __invoke()
    {
        $productos = Producto::query()
            ->activo()
            ->with([
                'categoria:id,nombre,descripcion',
                'vendedor:id,nombre,apellido,username,foto_perfil,reputacion',
                'imagenes:id,producto_id,imagen,principal',
            ])
            ->latest('fecha_publicacion')
            ->limit(8)
            ->get();

        return ProductoResource::collection($productos);
    }
}
