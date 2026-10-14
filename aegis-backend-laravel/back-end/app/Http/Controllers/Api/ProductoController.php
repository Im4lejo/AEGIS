<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductoResource;
use App\Models\Categoria;
use App\Models\Producto;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    public function categorias()
    {
        return response()->json([
            'data' => Categoria::query()->orderBy('nombre')->get(['id', 'nombre', 'descripcion']),
        ]);
    }

    public function index(Request $request)
    {
        $filters = $request->validate([
            'busqueda' => ['nullable', 'string', 'max:100'],
            'precio_max' => ['nullable', 'numeric', 'min:0'],
            'estado' => ['nullable', 'in:todo,nuevo,usado,reacondicionado'],
            'cat' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'in:reciente,precio-asc,precio-desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = Producto::query()
            ->activo()
            ->with([
                'categoria:id,nombre,descripcion',
                'vendedor:id,nombre,apellido,username,foto_perfil,reputacion',
                'imagenes:id,producto_id,imagen,principal',
            ]);

        if (! empty($filters['busqueda'])) {
            $term = '%'.$filters['busqueda'].'%';
            $query->where(fn ($builder) => $builder
                ->where('titulo', 'like', $term)
                ->orWhere('descripcion', 'like', $term));
        }

        if (! empty($filters['precio_max'])) {
            $query->where('precio', '<=', $filters['precio_max']);
        }

        if (! empty($filters['estado']) && $filters['estado'] !== 'todo') {
            $query->where('estado_producto', $filters['estado']);
        }

        if (! empty($filters['cat'])) {
            $query->whereHas('categoria', fn ($builder) => $builder
                ->where('nombre', 'like', '%'.$filters['cat'].'%'));
        }

        match ($filters['sort'] ?? 'reciente') {
            'precio-asc' => $query->orderBy('precio'),
            'precio-desc' => $query->orderByDesc('precio'),
            default => $query->latest('fecha_publicacion'),
        };

        $products = $query->paginate($filters['per_page'] ?? 24);

        return ProductoResource::collection($products);
    }

    public function show(int $producto)
    {
        $product = Producto::query()
            ->activo()
            ->with([
                'categoria:id,nombre,descripcion',
                'vendedor:id,nombre,apellido,username,foto_perfil,reputacion',
                'imagenes:id,producto_id,imagen,principal',
            ])
            ->findOrFail($producto);

        return new ProductoResource($product);
    }
}
