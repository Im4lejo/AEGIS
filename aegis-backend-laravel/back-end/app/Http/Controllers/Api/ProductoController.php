<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductoResource;
use App\Models\Categoria;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Cloudinary\Cloudinary;
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
                'vendedor:id,nombre,apellido,username,foto_perfil_url as foto_perfil,reputacion',
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
                'vendedor:id,nombre,apellido,username,foto_perfil_url as foto_perfil,reputacion',
                'imagenes:id,producto_id,imagen,principal',
            ])
            ->findOrFail($producto);

        return new ProductoResource($product);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'categoria_id' => 'required|exists:categorias,id',
            'titulo' => 'required|string|max:150',
            'descripcion' => 'required|string',
            'precio' => 'required|numeric|min:0|max:9999999999.99',
            'estado_producto' => 'required|in:nuevo,usado,reacondicionado',
            'ciudad' => 'nullable|string|max:100',
            'imagenes' => 'required|array|min:1|max:5',
            'imagenes.*' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $usuarioId = $request->user()->getKey();
        $cloudinary = new Cloudinary(config('cloudinary.cloud_url'));

        $imagenesSubidas = [];

        try {
            $producto = DB::transaction(function () use (
                $validated,
                $cloudinary,
                $usuarioId,
                &$imagenesSubidas
            ) {
                $producto = Producto::create([
                    'usuario_id' => $usuarioId,
                    'categoria_id' => $validated['categoria_id'],
                    'titulo' => $validated['titulo'],
                    'descripcion' => $validated['descripcion'],
                    'precio' => $validated['precio'],
                    'estado_producto' => $validated['estado_producto'],
                    'ciudad' => $validated['ciudad'] ?? null,
                ]);

                foreach ($validated['imagenes'] as $index => $file) {
                    $resultado = $cloudinary->uploadApi()->upload(
                        $file->getRealPath(),
                        [
                            'folder' => 'productos',
                            'resource_type' => 'image',
                        ]
                    );

                    $imagenesSubidas[] = $resultado['public_id'];

                    $producto->imagenes()->create([
                        'imagen' => $resultado['secure_url'],
                        'principal' => $index === 0,
                    ]);
                }

                return $producto;
            });

            return response()->json([
                'message' => 'Producto creado correctamente',
                'data' => $producto->load('imagenes'),
            ], 201);
        } catch (\Throwable $e) {
            foreach ($imagenesSubidas as $publicId) {
                try {
                    $cloudinary->uploadApi()->destroy($publicId);
                } catch (\Throwable $error) {
                    report($error);
                }
            }

            report($e);

            return response()->json([
                'message' => 'Error al crear el producto.',
            ], 500);
        }
    }
}