<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publicacion;
use Illuminate\Http\Request;

class ForoController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $publicaciones = Publicacion::query()
            ->with([
                'usuario:id,nombre,username,foto_perfil',
                'comentarios' => fn ($query) => $query
                    ->with('usuario:id,nombre,username,foto_perfil')
                    ->orderBy('fecha_comentario'),
            ])
            ->latest('fecha_publicacion')
            ->paginate($filters['per_page'] ?? 20);

        return response()->json([
            'data' => $publicaciones->items(),
            'meta' => [
                'current_page' => $publicaciones->currentPage(),
                'per_page' => $publicaciones->perPage(),
                'total' => $publicaciones->total(),
                'last_page' => $publicaciones->lastPage(),
            ],
        ]);
    }
}
