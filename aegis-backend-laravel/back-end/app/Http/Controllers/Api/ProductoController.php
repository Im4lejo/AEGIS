<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductoResource;
use App\Models\Categoria;
use App\Models\Producto;
use App\Services\MediaManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class ProductoController extends Controller
{
    public function __construct(private MediaManager $media) {}

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
            ->where('visibilidad', 'publica')
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

    public function show(Request $request, int $producto)
    {
        $product = Producto::query()
            ->with([
                'categoria:id,nombre,descripcion',
                'vendedor:id,nombre,apellido,username,foto_perfil_url as foto_perfil,reputacion',
                'imagenes:id,producto_id,imagen,principal',
            ])
            ->findOrFail($producto);

        $usuario = $request->user();
        if (
            ! in_array($product->visibilidad, ['publica', null], true)
            && (
                ! $usuario
                || ! Gate::forUser($usuario)->allows('view.product', $product)
            )
        ) {
            return response()->json([
                'message' => 'Este contenido privado no está disponible para tu cuenta.',
                'code' => 'PRIVATE_RESOURCE',
            ], 403);
        }

        if (
            $product->estado_publicacion !== 'activo'
            && (
                ! $usuario
                || ! Gate::forUser($usuario)->allows('update.product', $product)
            )
        ) {
            abort(404);
        }

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
            'visibilidad' => 'nullable|in:publica,privada,grupo_privado',
            'imagenes' => 'required|array|min:1|max:5',
            'imagenes.*' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
            'alt_text' => 'nullable|string|max:255',
        ]);

        $usuarioId = $request->user()->getKey();

        $imagenesSubidas = [];

        try {
            $producto = DB::transaction(function () use (
                $validated,
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
                    'visibilidad' => $validated['visibilidad'] ?? 'publica',
                ]);

                foreach ($validated['imagenes'] as $index => $file) {
                    $resultado = $this->media->upload(
                        $file,
                        'productos',
                        'Producto/'.$usuarioId,
                    );
                    $imagenesSubidas[] = $resultado['public_id'];

                    $producto->imagenes()->create([
                        'imagen' => $resultado['url'],
                        'public_id' => $resultado['public_id'],
                        'mime_type' => $resultado['mime_type'],
                        'size' => $resultado['size'],
                        'width' => $resultado['width'],
                        'height' => $resultado['height'],
                        'alt_text' => $validated['alt_text'] ?? null,
                        'estado' => 'activo',
                        'orden' => $index,
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
                    $this->media->destroyWithRetry($publicId, 'image', 'producto-store-'.uniqid());
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

    public function update(Request $request, int $producto)
    {
        $product = Producto::query()->findOrFail($producto);

        if (! Gate::forUser($request->user())->allows('update.product', $product)) {
            return response()->json([
                'message' => 'No tienes permiso para editar este producto.',
                'code' => 'FORBIDDEN_RESOURCE',
            ], 403);
        }

        $validated = $request->validate([
            'categoria_id' => 'sometimes|exists:categorias,id',
            'titulo' => 'sometimes|string|max:150',
            'descripcion' => 'sometimes|string',
            'precio' => 'sometimes|numeric|min:0|max:9999999999.99',
            'estado_producto' => 'sometimes|in:nuevo,usado,reacondicionado',
            'ciudad' => 'nullable|string|max:100',
            'estado_publicacion' => 'sometimes|in:activo,vendido,oculto',
            'visibilidad' => 'sometimes|in:publica,privada,grupo_privado',
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Producto actualizado correctamente.',
            'data' => new ProductoResource($product->fresh(['categoria', 'vendedor', 'imagenes'])),
        ]);
    }

    public function destroy(Request $request, int $producto)
    {
        $product = Producto::query()->findOrFail($producto);

        if (! Gate::forUser($request->user())->allows('delete.product', $product)) {
            return response()->json([
                'message' => 'No tienes permiso para eliminar este producto.',
                'code' => 'FORBIDDEN_RESOURCE',
            ], 403);
        }

        $product->delete();
        DB::table('auditoria_accesos')->insert([
            'actor_id' => $request->user()->id,
            'accion' => 'eliminar',
            'recurso_tipo' => 'Producto',
            'recurso_id' => $producto,
            'datos' => json_encode(['propietario_id' => $product->usuario_id]),
            'fecha' => now(),
        ]);

        return response()->json([
            'message' => 'Producto eliminado correctamente.',
            'code' => 'RESOURCE_DELETED',
        ]);
    }
}
