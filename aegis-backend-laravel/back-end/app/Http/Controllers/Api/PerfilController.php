<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductoResource;
use App\Models\Producto;
use App\Models\Publicacion;
use App\Models\Usuario;

class PerfilController extends Controller
{
    public function show(int $usuario)
    {
        $profile = Usuario::query()
            ->select([
                'id',
                'nombre',
                'apellido',
                'username',
                'ciudad',
                'foto_perfil',
                'descripcion',
                'reputacion',
                'fecha_registro',
            ])
            ->findOrFail($usuario);

        $products = Producto::query()
            ->activo()
            ->where('usuario_id', $profile->id)
            ->with([
                'categoria:id,nombre,descripcion',
                'vendedor:id,nombre,apellido,username,foto_perfil,reputacion',
                'imagenes:id,producto_id,imagen,principal',
            ])
            ->latest('fecha_publicacion')
            ->limit(24)
            ->get();

        $posts = Publicacion::query()
            ->where('usuario_id', $profile->id)
            ->latest('fecha_publicacion')
            ->limit(10)
            ->get(['id', 'usuario_id', 'titulo', 'contenido', 'fecha_publicacion']);

        return response()->json([
            'data' => [
                'perfil' => $profile,
                'productos' => ProductoResource::collection($products)->resolve(),
                'publicaciones' => $posts,
            ],
        ]);
    }
}
