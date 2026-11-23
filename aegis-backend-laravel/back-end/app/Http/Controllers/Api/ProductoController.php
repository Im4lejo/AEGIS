<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductoResource;
use App\Models\Calificacion;
use App\Models\Categoria;
use App\Models\Producto;
use App\Services\MediaManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProductoController extends Controller
{
    public function __construct(private MediaManager $media) {}

    public function categorias()
    {
        return response()->json([
            'data' => Categoria::query()->orderBy('nombre')->get(['id', 'nombre', 'descripcion']),
        ]);
    }

    public function compare(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'string', 'regex:/^\d+(,\d+){1,3}$/'],
        ]);
        $ids = array_values(array_unique(array_map(
            'intval',
            explode(',', $validated['ids']),
        )));
        if (count($ids) < 2 || count($ids) > 4) {
            throw ValidationException::withMessages([
                'ids' => ['Selecciona entre 2 y 4 productos.'],
            ]);
        }

        $products = Producto::query()
            ->activo()
            ->where('visibilidad', 'publica')
            ->whereIn('id', $ids)
            ->with([
                'categoria:id,nombre,descripcion',
                'imagenes:id,producto_id,imagen,principal',
            ])
            ->get();
        if ($products->count() !== count($ids)) {
            throw ValidationException::withMessages([
                'ids' => ['Todos los productos deben estar activos y ser públicos.'],
            ]);
        }

        $categoryIds = $products->pluck('categoria_id')->unique();
        if ($categoryIds->count() > 1) {
            $warning = 'Los productos pertenecen a categorías diferentes; campos no comparables se muestran como N/D.';
        } else {
            $warning = null;
        }

        $attributes = [];
        foreach ($products as $product) {
            foreach (($product->atributos ?? []) as $key => $value) {
                $attributes[(string) $key] = true;
            }
        }

        $comparison = $products->map(fn (Producto $product) => [
            'id' => $product->id,
            'titulo' => $product->titulo,
            'precio' => $product->precio,
            'estado_producto' => $product->estado_producto,
            'ciudad_aprox' => $product->ciudad_aprox,
            'categoria' => $product->categoria?->nombre,
            'imagen' => $product->imagenes->first()?->imagen,
            'atributos' => collect($attributes)->mapWithKeys(
                fn ($unused, $key) => [
                    $key => $product->atributos[$key] ?? null,
                ],
            )->all(),
        ]);

        DB::table('comparaciones_producto')->insert([
            'usuario_id' => $request->user()?->id,
            'sesion_key' => $request->header('X-AEGIS-Session'),
            'producto_ids' => implode(',', $ids),
            'fecha' => now(),
        ]);

        return response()->json([
            'data' => [
                'productos' => $comparison,
                'campos' => array_keys($attributes),
                'advertencia' => $warning,
            ],
        ]);
    }

    public function similar(Request $request, int $producto)
    {
        $base = Producto::query()
            ->activo()
            ->where('visibilidad', 'publica')
            ->with(['categoria:id,nombre,descripcion', 'imagenes:id,producto_id,imagen,principal'])
            ->findOrFail($producto);

        $price = (float) $base->precio;
        $range = max(1000, $price * 0.20);
        $query = Producto::query()
            ->activo()
            ->where('visibilidad', 'publica')
            ->whereKeyNot($base->id)
            ->where('categoria_id', $base->categoria_id)
            ->whereBetween('precio', [max(0, $price - $range), $price + $range])
            ->with(['categoria:id,nombre,descripcion', 'imagenes:id,producto_id,imagen,principal'])
            ->latest('fecha_publicacion')
            ->limit(8);

        $similar = $query->get();

        return response()->json([
            'data' => ProductoResource::collection($similar)->resolve($request),
            'criterio' => 'misma categoría y precio dentro de ±20%',
        ]);
    }

    public function index(Request $request)
    {
        $filters = $request->validate([
            'busqueda' => ['nullable', 'string', 'max:100'],
            'precio_min' => ['nullable', 'numeric', 'min:0'],
            'precio_max' => ['nullable', 'numeric', 'min:0'],
            'estado' => ['nullable', 'in:todo,nuevo,usado,reacondicionado'],
            'cat' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'in:reciente,relevancia,precio-asc,precio-desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
            'marca' => ['nullable', 'string', 'max:100'],
            'ciudad' => ['nullable', 'string', 'max:100'],
            'ciudad_aprox' => ['nullable', 'string', 'max:100'],
            'dias' => ['nullable', 'integer', 'min:1', 'max:3650'],
            'atributos' => ['nullable', 'array', 'max:30'],
            'atributos.*' => ['nullable', 'string', 'max:200'],
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

        if (array_key_exists('precio_min', $filters) && $filters['precio_min'] !== null) {
            $query->where('precio', '>=', $filters['precio_min']);
        }

        if (array_key_exists('precio_max', $filters) && $filters['precio_max'] !== null) {
            $query->where('precio', '<=', $filters['precio_max']);
        }

        if (! empty($filters['estado']) && $filters['estado'] !== 'todo') {
            $query->where('estado_producto', $filters['estado']);
        }

        if (! empty($filters['cat'])) {
            $query->whereHas('categoria', fn ($builder) => $builder
                ->where('nombre', 'like', '%'.$filters['cat'].'%'));
        }

        $location = $filters['ciudad_aprox'] ?? $filters['ciudad'] ?? null;
        if ($location) {
            $query->where(fn ($builder) => $builder
                ->where('ciudad_aprox', 'like', '%'.$location.'%')
                ->orWhere('ciudad', 'like', '%'.$location.'%'));
        }
        if (! empty($filters['dias'])) {
            $query->where('fecha_publicacion', '>=', now()->subDays((int) $filters['dias']));
        }
        if (! empty($filters['marca'])) {
            $query->whereJsonContains('atributos', ['marca' => $filters['marca']]);
        }
        if (! empty($filters['atributos'])) {
            foreach ($filters['atributos'] as $attribute) {
                $parts = explode('=', $attribute, 2);
                if (count($parts) === 2) {
                    $key = Str::slug(trim($parts[0]), '_');
                    $value = trim($parts[1]);
                    $query->whereJsonContains('atributos', [$key => $value]);
                }
            }
        }

        match ($filters['sort'] ?? 'reciente') {
            'precio-asc' => $query->orderBy('precio'),
            'precio-desc' => $query->orderByDesc('precio'),
            'relevancia' => $query
                ->when(! empty($filters['busqueda']), fn ($builder) => $builder
                    ->orderByDesc(DB::raw(
                        'CASE WHEN titulo LIKE '.DB::getPdo()->quote('%'.$filters['busqueda'].'%').' THEN 1 ELSE 0 END',
                    ))
                )
                ->latest('fecha_publicacion'),
            default => $query->latest('fecha_publicacion'),
        };

        $products = $query->paginate($filters['per_page'] ?? 24);

        DB::table('busquedas_productos')->insert([
            'usuario_id' => $request->user()?->id,
            'sesion_key' => $request->header('X-AEGIS-Session'),
            'filtros' => json_encode($filters),
            'veces' => 1,
            'ultima_busqueda' => now(),
        ]);

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

        $questions = $product->preguntas()
            ->where('estado', 'respondida')
            ->with([
                'usuario:id,nombre,username',
                'respondidoPor:id,nombre,username',
            ])
            ->latest('fecha_pregunta')
            ->limit(20)
            ->get([
                'id',
                'pregunta',
                'respuesta',
                'usuario_id',
                'respondido_por',
                'estado',
                'fecha_pregunta',
                'fecha_respuesta',
            ]);

        $reviews = Calificacion::query()
            ->where('receptor_id', $product->usuario_id)
            ->whereNotNull('encuentro_id')
            ->with('autor:id,nombre,apellido,username')
            ->latest('fecha_calificacion')
            ->limit(10)
            ->get([
                'id',
                'autor_id',
                'puntuacion',
                'comentario',
                'fecha_calificacion',
            ]);

        $resource = (new ProductoResource($product))->resolve($request);
        $resource['preguntas'] = $questions;
        $resource['resenas'] = $reviews;
        $resource['confianza'] = [
            'reputacion_comercial' => $product->vendedor?->reputacion,
            'resenas_verificadas' => $reviews->count(),
            'vendedor_verificado' => false,
            'nota' => 'Solo se muestran comprobaciones reales; ninguna insignia se infiere de likes o seguidores.',
        ];
        $resource['seguridad'] = [
            'ciudad_aprox' => $product->ciudad_aprox,
            'permite_encuentro' => (bool) $product->permite_encuentro,
            'no_compartir_datos_personales' => true,
            'recomendacion' => 'Conversa y acuerda encuentros en espacios públicos.',
        ];
        $resource['seo'] = [
            'title' => $product->titulo.' | AEGIS',
            'description' => Str::limit(strip_tags((string) $product->descripcion), 160),
            'canonical' => rtrim(config('app.frontend_url'), '/').'#/productos/detalle?id='.$product->id,
            'robots' => $product->estado_publicacion === 'activo' && $product->visibilidad === 'publica'
                ? 'index,follow'
                : 'noindex,nofollow',
        ];

        return response()->json(['data' => $resource]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'categoria_id' => 'nullable|exists:categorias,id',
            'titulo' => 'nullable|string|max:150',
            'descripcion' => 'nullable|string',
            'precio' => 'nullable|numeric|min:0|max:9999999999.99',
            'estado_producto' => 'nullable|in:nuevo,usado,reacondicionado',
            'ciudad' => 'nullable|string|max:100',
            'ciudad_aprox' => 'nullable|string|max:100',
            'atributos' => 'nullable|array|max:30',
            'visibilidad' => 'nullable|in:publica,privada,grupo_privado',
            'imagenes' => 'nullable|array|max:5',
            'imagenes.*' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
            'alt_text' => 'nullable|string|max:255',
            'estado_publicacion' => 'nullable|in:borrador,activo',
            'atributos' => 'nullable|array|max:30',
            'ciudad_aprox' => 'nullable|string|max:100',
        ]);

        $estadoInicial = $validated['estado_publicacion'] ?? 'activo';
        if ($estadoInicial === 'activo') {
            $publishErrors = [];
            foreach ([
                'categoria_id' => 'La categoría es obligatoria.',
                'titulo' => 'El título es obligatorio.',
                'descripcion' => 'La descripción es obligatoria.',
                'precio' => 'El precio es obligatorio.',
                'estado_producto' => 'La condición es obligatoria.',
            ] as $field => $message) {
                if (! array_key_exists($field, $validated)
                    || $validated[$field] === null
                    || $validated[$field] === ''
                ) {
                    $publishErrors[$field] = [$message];
                }
            }
            if (empty($validated['imagenes'])) {
                $publishErrors['imagenes'] = ['Debe incluir al menos una imagen.'];
            }
            if ($publishErrors !== []) {
                throw ValidationException::withMessages($publishErrors);
            }
        }

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
                    'categoria_id' => $validated['categoria_id'] ?? null,
                    'titulo' => $validated['titulo'] ?? null,
                    'descripcion' => $validated['descripcion'] ?? null,
                    'precio' => $validated['precio'] ?? null,
                    'estado_producto' => $validated['estado_producto'] ?? null,
                    'ciudad' => $validated['ciudad'] ?? null,
                    'visibilidad' => $validated['visibilidad'] ?? 'publica',
                    'estado_publicacion' => $validated['estado_publicacion'] ?? 'activo',
                    'atributos' => $validated['atributos'] ?? null,
                    'ciudad_aprox' => $validated['ciudad_aprox'] ?? null,
                    'fecha_estado' => now(),
                ]);

                foreach ($validated['imagenes'] ?? [] as $index => $file) {
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
            'estado_publicacion' => 'sometimes|in:borrador,activo,pausado,reservado,vendido,archivado,oculto',
            'visibilidad' => 'sometimes|in:publica,privada,grupo_privado',
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Producto actualizado correctamente.',
            'data' => new ProductoResource($product->fresh(['categoria', 'vendedor', 'imagenes'])),
        ]);
    }

    public function mine(Request $request)
    {
        $filters = $request->validate([
            'estado' => ['nullable', 'in:borrador,activo,pausado,reservado,vendido,archivado,oculto,todos'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);
        $estado = $filters['estado'] ?? 'todos';

        $query = Producto::query()
            ->where('usuario_id', $request->user()->id)
            ->with([
                'categoria:id,nombre,descripcion',
                'imagenes:id,producto_id,imagen,principal',
            ])
            ->latest('fecha_publicacion');

        if ($estado !== 'todos') {
            $query->where('estado_publicacion', $estado);
        }

        $products = $query->paginate($filters['per_page'] ?? 24);

        return response()->json([
            'data' => ProductoResource::collection($products->items())->resolve($request),
            'meta' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'last_page' => $products->lastPage(),
            ],
            'estadisticas' => [
                'total' => (clone $query)->count(),
            ],
        ]);
    }

    public function transition(Request $request, int $producto)
    {
        $product = Producto::query()->findOrFail($producto);
        if (! Gate::forUser($request->user())->allows('update.product', $product)) {
            return response()->json([
                'message' => 'No tienes permiso para modificar este anuncio.',
                'code' => 'FORBIDDEN_RESOURCE',
            ], 403);
        }

        $validated = $request->validate([
            'estado' => ['required', 'in:borrador,activo,pausado,reservado,vendido,archivado,oculto'],
            'motivo' => ['nullable', 'string', 'max:255'],
        ]);
        $target = $validated['estado'];
        $current = $product->estado_publicacion;

        $allowed = match ($current) {
            'borrador' => ['activo', 'archivado'],
            'activo' => ['pausado', 'reservado', 'vendido', 'archivado', 'activo'],
            'pausado' => ['activo', 'reservado', 'vendido', 'archivado'],
            'reservado' => ['activo', 'vendido', 'archivado'],
            'vendido' => ['archivado', 'activo'],
            'archivado' => ['activo'],
            'oculto' => ['activo', 'archivado'],
            default => ['activo', 'archivado'],
        };

        if (! in_array($target, $allowed, true)) {
            return response()->json([
                'message' => 'La transición solicitada no está permitida.',
                'code' => 'INVALID_PRODUCT_TRANSITION',
                'estado_actual' => $current,
                'estado_nuevo' => $target,
            ], 409);
        }

        if ($target === 'activo') {
            $this->validatePublishableProduct($product);
        }

        $previous = $product->estado_publicacion;
        $product->update([
            'estado_publicacion' => $target,
            'fecha_estado' => now(),
            'fecha_renovacion' => $target === 'activo' && $previous !== 'activo'
                ? now()
                : $product->fecha_renovacion,
            'motivo_archivo' => in_array($target, ['archivado', 'vendido'], true)
                ? ($validated['motivo'] ?? null)
                : null,
        ]);

        DB::table('historial_producto')->insert([
            'producto_id' => $product->id,
            'actor_id' => $request->user()->id,
            'accion' => $target === 'activo' ? 'publicar_renovar' : 'cambiar_estado',
            'estado_anterior' => $previous,
            'estado_nuevo' => $target,
            'datos' => json_encode(['motivo' => $validated['motivo'] ?? null]),
            'fecha' => now(),
        ]);

        return response()->json([
            'message' => 'Estado actualizado.',
            'data' => new ProductoResource($product->fresh(['categoria', 'vendedor', 'imagenes'])),
        ]);
    }

    public function renew(Request $request, int $producto)
    {
        return $this->transition(
            $request->merge(['estado' => 'activo']),
            $producto,
        );
    }

    public function stats(Request $request)
    {
        $base = Producto::query()->where('usuario_id', $request->user()->id);

        return response()->json([
            'data' => [
                'total' => (clone $base)->count(),
                'activos' => (clone $base)->where('estado_publicacion', 'activo')->count(),
                'borradores' => (clone $base)->where('estado_publicacion', 'borrador')->count(),
                'reservados' => (clone $base)->where('estado_publicacion', 'reservado')->count(),
                'vendidos' => (clone $base)->where('estado_publicacion', 'vendido')->count(),
                'archivados' => (clone $base)->where('estado_publicacion', 'archivado')->count(),
            ],
            'nota' => 'Solo incluye registros almacenados; no representa métricas externas.',
        ]);
    }

    public function questions(Request $request, int $producto)
    {
        $product = Producto::query()->findOrFail($producto);
        $questions = $product->preguntas()
            ->where('estado', 'respondida')
            ->with([
                'usuario:id,nombre,username',
                'respondidoPor:id,nombre,username',
            ])
            ->latest('fecha_pregunta')
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json([
            'data' => $questions->items(),
            'meta' => [
                'current_page' => $questions->currentPage(),
                'per_page' => $questions->perPage(),
                'total' => $questions->total(),
                'last_page' => $questions->lastPage(),
            ],
        ]);
    }

    public function ask(Request $request, int $producto)
    {
        $product = Producto::query()->findOrFail($producto);
        if (! in_array($product->estado_publicacion, ['activo', 'reservado'], true)
            || $product->visibilidad !== 'publica'
        ) {
            return response()->json([
                'message' => 'Este anuncio no acepta preguntas públicas.',
                'code' => 'PRODUCT_NOT_ACCEPTING_QUESTIONS',
            ], 403);
        }

        $validated = $request->validate([
            'pregunta' => ['required', 'string', 'max:2000'],
        ]);
        $question = $product->preguntas()->create([
            'usuario_id' => $request->user()->id,
            'pregunta' => trim($validated['pregunta']),
            'estado' => 'pendiente',
            'fecha_pregunta' => now(),
        ]);

        return response()->json([
            'message' => 'Pregunta publicada para moderación del vendedor.',
            'data' => $question->load('usuario:id,nombre,username'),
        ], 201);
    }

    public function answerQuestion(Request $request, int $producto, int $pregunta)
    {
        $product = Producto::query()->findOrFail($producto);
        if (! Gate::forUser($request->user())->allows('update.product', $product)
            && $request->user()->rol !== 'admin'
        ) {
            return response()->json([
                'message' => 'Solo el vendedor o un administrador puede responder.',
                'code' => 'FORBIDDEN_RESOURCE',
            ], 403);
        }

        $question = $product->preguntas()->whereKey($pregunta)->firstOrFail();
        $validated = $request->validate([
            'respuesta' => ['required', 'string', 'max:5000'],
        ]);
        $question->update([
            'respuesta' => trim($validated['respuesta']),
            'respondido_por' => $request->user()->id,
            'estado' => 'respondida',
            'fecha_respuesta' => now(),
        ]);

        return response()->json([
            'data' => $question->fresh(['usuario:id,nombre,username', 'respondidoPor:id,nombre,username']),
        ]);
    }

    public function moderateQuestion(Request $request, int $producto, int $pregunta)
    {
        $product = Producto::query()->findOrFail($producto);
        if (! Gate::forUser($request->user())->allows('update.product', $product)
            && $request->user()->rol !== 'admin'
        ) {
            return response()->json(['message' => 'Sin permiso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }

        $validated = $request->validate([
            'estado' => ['required', 'in:pendiente,oculta,eliminada'],
        ]);
        $question = $product->preguntas()->whereKey($pregunta)->firstOrFail();
        $question->update([
            'estado' => $validated['estado'],
            'editada_en' => now(),
        ]);

        return response()->json([
            'data' => $question->fresh(),
        ]);
    }

    private function validatePublishableProduct(Producto $product): void
    {
        $errors = [];
        if (trim((string) $product->titulo) === '') {
            $errors['titulo'] = ['El título es obligatorio.'];
        }
        if (trim((string) $product->descripcion) === '') {
            $errors['descripcion'] = ['La descripción es obligatoria.'];
        }
        if ((float) $product->precio < 0) {
            $errors['precio'] = ['El precio no puede ser negativo.'];
        }
        if (! $product->categoria_id) {
            $errors['categoria_id'] = ['La categoría es obligatoria.'];
        }
        if (! $product->imagenes()->where('estado', 'activo')->exists()) {
            $errors['imagenes'] = ['Debe existir al menos una imagen activa.'];
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
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
