<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventarioProducto;
use App\Models\MiembroTienda;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Models\Tienda;
use App\Models\Usuario;
use App\Models\VerificacionTienda;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TiendaController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'busqueda' => ['nullable', 'string', 'max:100'],
            'tipo' => ['nullable', 'in:particular,tienda,establecimiento'],
            'ciudad' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = Tienda::query()
            ->where('estado', 'activa')
            ->withCount([
                'productos as productos_activos_count' => fn ($q) => $q->where('estado_publicacion', 'activo'),
            ]);
        if (! empty($validated['busqueda'])) {
            $term = '%'.$validated['busqueda'].'%';
            $query->where(fn ($q) => $q
                ->where('nombre', 'like', $term)
                ->orWhere('descripcion', 'like', $term));
        }
        if (! empty($validated['tipo'])) {
            $query->where('tipo', $validated['tipo']);
        }
        if (! empty($validated['ciudad'])) {
            $query->where('ciudad_aprox', 'like', '%'.$validated['ciudad'].'%');
        }

        $stores = $query->latest('fecha_creacion')
            ->paginate($validated['per_page'] ?? 20);

        return response()->json([
            'data' => $stores->items(),
            'meta' => [
                'current_page' => $stores->currentPage(),
                'per_page' => $stores->perPage(),
                'total' => $stores->total(),
                'last_page' => $stores->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:150'],
            'tipo' => ['required', 'in:particular,tienda,establecimiento'],
            'descripcion' => ['nullable', 'string', 'max:5000'],
            'politicas' => ['nullable', 'string', 'max:10000'],
            'horario' => ['nullable', 'array'],
            'categorias' => ['nullable', 'array', 'max:20'],
            'categorias.*' => ['string', 'max:100'],
            'enlaces' => ['nullable', 'array', 'max:10'],
            'enlaces.*' => ['url', 'max:2048'],
            'contacto_permitido' => ['nullable', 'string', 'max:255'],
            'ciudad_aprox' => ['nullable', 'string', 'max:100'],
        ]);

        $baseSlug = Str::slug($validated['nombre']);
        $slug = $baseSlug;
        $suffix = 2;
        while (Tienda::query()->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$suffix++;
        }

        $store = Tienda::query()->create([
            ...$validated,
            'owner_id' => $request->user()->id,
            'slug' => $slug,
        ]);
        MiembroTienda::query()->create([
            'tienda_id' => $store->id,
            'usuario_id' => $request->user()->id,
            'rol' => 'owner',
            'estado' => 'activo',
        ]);

        return response()->json([
            'message' => 'Tienda creada.',
            'data' => $this->publicStorePayload($store),
        ], 201);
    }

    public function show(Request $request, int $tienda)
    {
        $store = Tienda::query()->findOrFail($tienda);
        if ($store->estado !== 'activa' && ! $this->canManage($store, $request->user())) {
            return response()->json(['message' => 'Tienda no disponible.', 'code' => 'STORE_UNAVAILABLE'], 404);
        }

        $products = $store->productos()
            ->activo()
            ->where('visibilidad', 'publica')
            ->with(['imagenes:id,producto_id,imagen,principal', 'inventario'])
            ->latest('fecha_publicacion')
            ->paginate((int) $request->integer('per_page', 24));

        return response()->json([
            'data' => $this->publicStorePayload($store),
            'productos' => [
                'data' => $products->items(),
                'meta' => [
                    'current_page' => $products->currentPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                    'last_page' => $products->lastPage(),
                ],
            ],
        ]);
    }

    public function update(Request $request, int $tienda)
    {
        $store = Tienda::query()->findOrFail($tienda);
        $this->authorizeStoreManager($store, $request->user());
        $validated = $request->validate([
            'nombre' => ['sometimes', 'string', 'max:150'],
            'tipo' => ['sometimes', 'in:particular,tienda,establecimiento'],
            'descripcion' => ['nullable', 'string', 'max:5000'],
            'politicas' => ['nullable', 'string', 'max:10000'],
            'horario' => ['nullable', 'array'],
            'categorias' => ['nullable', 'array', 'max:20'],
            'categorias.*' => ['string', 'max:100'],
            'enlaces' => ['nullable', 'array', 'max:10'],
            'enlaces.*' => ['url', 'max:2048'],
            'contacto_permitido' => ['nullable', 'string', 'max:255'],
            'ciudad_aprox' => ['nullable', 'string', 'max:100'],
        ]);
        if (isset($validated['nombre'])) {
            $validated['slug'] = Str::slug($validated['nombre']);
        }
        $store->update($validated);

        return response()->json([
            'message' => 'Tienda actualizada.',
            'data' => $this->publicStorePayload($store),
        ]);
    }

    public function requestVerification(Request $request, int $tienda)
    {
        $store = Tienda::query()->findOrFail($tienda);
        $this->authorizeStoreOwner($store, $request->user());
        $validated = $request->validate([
            'documentos' => ['required', 'array', 'min:1', 'max:10'],
            'documentos.*' => ['url', 'max:2048'],
            'nota' => ['nullable', 'string', 'max:5000'],
        ]);

        if (in_array($store->estado_verificacion, ['pendiente', 'aprobada'], true)) {
            throw ValidationException::withMessages([
                'tienda' => ['Ya existe una solicitud pendiente o aprobada.'],
            ]);
        }

        VerificacionTienda::query()->create([
            'tienda_id' => $store->id,
            'solicitado_por' => $request->user()->id,
            'estado' => 'pendiente',
            'documentos' => $validated['documentos'],
            'nota' => $validated['nota'] ?? null,
            'fecha_solicitud' => now(),
        ]);
        $store->update(['estado_verificacion' => 'pendiente']);

        return response()->json([
            'message' => 'Solicitud de verificación enviada.',
            'data' => ['estado_verificacion' => 'pendiente'],
        ], 201);
    }

    public function reviewVerification(Request $request, int $tienda)
    {
        $store = Tienda::query()->findOrFail($tienda);
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Solo administración puede revisar.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }
        $validated = $request->validate([
            'decision' => ['required', 'in:aprobada,rechazada,revocada'],
            'nota' => ['nullable', 'string', 'max:5000'],
        ]);

        $verification = VerificacionTienda::query()
            ->where('tienda_id', $store->id)
            ->latest('fecha_solicitud')
            ->first();
        if (! $verification) {
            throw ValidationException::withMessages([
                'tienda' => ['No existe solicitud de verificación.'],
            ]);
        }

        $verification->update([
            'revisado_por' => $request->user()->id,
            'estado' => $validated['decision'],
            'nota' => $validated['nota'] ?? null,
            'fecha_revision' => now(),
        ]);
        $store->update([
            'estado_verificacion' => $validated['decision'],
            'verificada_en' => $validated['decision'] === 'aprobada' ? now() : null,
        ]);

        return response()->json([
            'message' => 'Verificación revisada.',
            'data' => ['estado_verificacion' => $validated['decision']],
        ]);
    }

    public function inventory(Request $request, int $tienda)
    {
        $store = Tienda::query()->findOrFail($tienda);
        $this->authorizeStoreManager($store, $request->user());

        $inventory = InventarioProducto::query()
            ->where('tienda_id', $store->id)
            ->with('producto:id,titulo,estado_publicacion,precio')
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json([
            'data' => $inventory->items(),
            'meta' => [
                'current_page' => $inventory->currentPage(),
                'per_page' => $inventory->perPage(),
                'total' => $inventory->total(),
                'last_page' => $inventory->lastPage(),
            ],
        ]);
    }

    public function adjustInventory(Request $request, int $tienda, int $producto)
    {
        $store = Tienda::query()->findOrFail($tienda);
        $this->authorizeStoreManager($store, $request->user());
        $validated = $request->validate([
            'tipo' => ['required', 'in:entrada,salida,reserva,liberacion,ajuste'],
            'cantidad' => ['required', 'integer', 'min:1'],
            'motivo' => ['nullable', 'string', 'max:1000'],
        ]);

        $result = DB::transaction(function () use (
            $store,
            $producto,
            $request,
            $validated,
        ): array {
            $inventory = InventarioProducto::query()
                ->where('producto_id', $producto)
                ->where('tienda_id', $store->id)
                ->lockForUpdate()
                ->first();
            if (! $inventory) {
                $owned = Producto::query()
                    ->whereKey($producto)
                    ->where('tienda_id', $store->id)
                    ->exists();
                if (! $owned) {
                    throw ValidationException::withMessages([
                        'producto' => ['El producto no pertenece a esta tienda.'],
                    ]);
                }
                $inventory = InventarioProducto::query()->create([
                    'producto_id' => $producto,
                    'tienda_id' => $store->id,
                    'stock' => 0,
                    'stock_reservado' => 0,
                    'seguimiento_stock' => true,
                ]);
                $inventory = InventarioProducto::query()
                    ->whereKey($inventory->id)
                    ->lockForUpdate()
                    ->firstOrFail();
            }

            $before = (int) $inventory->stock;
            $reserved = (int) $inventory->stock_reservado;
            $quantity = (int) $validated['cantidad'];
            $after = $before;

            match ($validated['tipo']) {
                'entrada', 'ajuste' => $after = $validated['tipo'] === 'entrada'
                    ? $before + $quantity
                    : $quantity,
                'salida' => $after = $before - $quantity,
                'reserva' => $after = $before - $quantity,
                'liberacion' => $after = $before + $quantity,
                default => $after,
            };

            if ($after < 0) {
                throw ValidationException::withMessages([
                    'cantidad' => ['El inventario no puede quedar por debajo de cero.'],
                ]);
            }

            $newReserved = match ($validated['tipo']) {
                'reserva' => $reserved + $quantity,
                'liberacion', 'salida' => max(0, $reserved - $quantity),
                default => $reserved,
            };
            if ($validated['tipo'] === 'reserva' && $quantity > $before) {
                throw ValidationException::withMessages([
                    'cantidad' => ['No hay stock disponible para reservar.'],
                ]);
            }

            $inventory->update([
                'stock' => $after,
                'stock_reservado' => $newReserved,
                'actualizado_en' => now(),
            ]);
            MovimientoInventario::query()->create([
                'inventario_id' => $inventory->id,
                'actor_id' => $request->user()->id,
                'tipo' => $validated['tipo'],
                'cantidad' => $quantity,
                'stock_antes' => $before,
                'stock_despues' => $after,
                'motivo' => $validated['motivo'] ?? null,
            ]);

            return [
                'stock' => $after,
                'stock_reservado' => $newReserved,
            ];
        });

        return response()->json(['data' => $result]);
    }

    public function dashboard(Request $request, int $tienda)
    {
        $store = Tienda::query()->findOrFail($tienda);
        $this->authorizeStoreManager($store, $request->user());

        $base = Producto::query()->where('tienda_id', $store->id);
        $inventory = InventarioProducto::query()->where('tienda_id', $store->id);

        return response()->json([
            'data' => [
                'productos_activos' => (clone $base)->where('estado_publicacion', 'activo')->count(),
                'borradores' => (clone $base)->where('estado_publicacion', 'borrador')->count(),
                'reservados' => (clone $base)->where('estado_publicacion', 'reservado')->count(),
                'vendidos' => (clone $base)->where('estado_publicacion', 'vendido')->count(),
                'stock_unidades' => (clone $inventory)->sum('stock'),
                'stock_reservado' => (clone $inventory)->sum('stock_reservado'),
            ],
            'nota' => 'Indicadores calculados desde registros reales de anuncios e inventario.',
        ]);
    }

    private function publicStorePayload(Tienda $store): array
    {
        return [
            'id' => $store->id,
            'nombre' => $store->nombre,
            'slug' => $store->slug,
            'tipo' => $store->tipo,
            'descripcion' => $store->descripcion,
            'politicas' => $store->politicas,
            'horario' => $store->horario,
            'categorias' => $store->categorias,
            'enlaces' => $store->enlaces,
            'contacto_permitido' => $store->contacto_permitido,
            'ciudad_aprox' => $store->ciudad_aprox,
            'logo_url' => $store->logo_url,
            'portada_url' => $store->portada_url,
            'estado' => $store->estado,
            'estado_verificacion' => $store->estado_verificacion ?? 'ninguna',
            'verificada' => $store->estado_verificacion === 'aprobada',
            'verificada_en' => $store->verificada_en,
        ];
    }

    private function getMembership(Tienda $store, ?Usuario $user): ?MiembroTienda
    {
        return $user
            ? MiembroTienda::query()
                ->where('tienda_id', $store->id)
                ->where('usuario_id', $user->id)
                ->where('estado', 'activo')
                ->first()
            : null;
    }

    private function canManage(Tienda $store, ?Usuario $user): bool
    {
        if (! $user) {
            return false;
        }
        if ($user->rol === 'admin') {
            return true;
        }
        $membership = $this->getMembership($store, $user);

        return $membership
            && in_array($membership->rol, ['owner', 'gestor'], true);
    }

    private function authorizeStoreManager(Tienda $store, Usuario $user): void
    {
        if (! $this->canManage($store, $user)) {
            throw ValidationException::withMessages([
                'tienda' => ['Solo owner, gestor o administrador pueden gestionar la tienda.'],
            ]);
        }
    }

    private function authorizeStoreOwner(Tienda $store, Usuario $user): void
    {
        if ($user->rol !== 'admin') {
            $membership = $this->getMembership($store, $user);
            if (! $membership || $membership->rol !== 'owner') {
                throw ValidationException::withMessages([
                    'tienda' => ['Solo el propietario puede solicitar verificación.'],
                ]);
            }
        }
    }
}
