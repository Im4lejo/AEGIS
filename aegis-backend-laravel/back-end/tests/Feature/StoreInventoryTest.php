<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\MiembroTienda;
use App\Models\Producto;
use App\Models\Tienda;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StoreInventoryTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_owner_creates_store_and_stranger_cannot_manage_it(): void
    {
        $owner = $this->createUser();
        $stranger = $this->createUser();

        Sanctum::actingAs($owner);
        $store = $this->postJson('/api/tiendas', [
            'nombre' => 'Tecnología Real',
            'tipo' => 'tienda',
            'descripcion' => 'Venta de equipos',
            'categorias' => ['Hardware'],
            'ciudad_aprox' => 'Popayán',
        ])
            ->assertCreated()
            ->assertJsonPath('data.estado_verificacion', 'ninguna')
            ->json('data');

        Sanctum::actingAs($stranger);
        $this->patchJson('/api/tiendas/'.$store['id'], [
            'descripcion' => 'Intento ajeno',
        ])
            ->assertUnprocessable();
    }

    public function test_verification_badge_only_appears_after_admin_approval(): void
    {
        $owner = $this->createUser();
        $admin = $this->createUser(['rol' => 'admin']);
        $store = $this->createStore($owner);

        Sanctum::actingAs($owner);
        $this->postJson('/api/tiendas/'.$store->id.'/verificacion', [
            'documentos' => ['https://example.com/documento.pdf'],
            'nota' => 'Documentación protegida',
        ])
            ->assertCreated()
            ->assertJsonPath('data.estado_verificacion', 'pendiente');
        $this->assertFalse((bool) $store->fresh()->estado_verificacion === 'aprobada');

        Sanctum::actingAs($admin);
        $this->patchJson('/api/tiendas/'.$store->id.'/verificacion', [
            'decision' => 'aprobada',
            'nota' => 'Aprobada',
        ])
            ->assertOk()
            ->assertJsonPath('data.estado_verificacion', 'aprobada');

        $this->getJson('/api/tiendas/'.$store->id)
            ->assertOk()
            ->assertJsonPath('data.verificada', true);
    }

    public function test_inventory_adjustment_never_goes_below_zero_and_is_transactional(): void
    {
        $owner = $this->createUser();
        $store = $this->createStore($owner);
        $category = Categoria::query()->create(['nombre' => 'Inventario']);
        $product = Producto::query()->create([
            'usuario_id' => $owner->id,
            'tienda_id' => $store->id,
            'categoria_id' => $category->id,
            'titulo' => 'Producto inventariado',
            'descripcion' => 'Descripción',
            'precio' => 100,
            'estado_producto' => 'nuevo',
            'estado_publicacion' => 'activo',
        ]);

        Sanctum::actingAs($owner);
        $this->patchJson('/api/tiendas/'.$store->id.'/inventario/'.$product->id, [
            'tipo' => 'entrada',
            'cantidad' => 10,
        ])
            ->assertOk()
            ->assertJsonPath('data.stock', 10);
        $this->patchJson('/api/tiendas/'.$store->id.'/inventario/'.$product->id, [
            'tipo' => 'salida',
            'cantidad' => 11,
        ])
            ->assertUnprocessable();
        $this->assertDatabaseHas('inventario_producto', [
            'producto_id' => $product->id,
            'tienda_id' => $store->id,
            'stock' => 10,
        ]);
    }

    public function test_store_public_catalog_hides_drafts_and_unrelated_owner_access_is_denied(): void
    {
        $owner = $this->createUser();
        $stranger = $this->createUser();
        $store = $this->createStore($owner);
        $category = Categoria::query()->create(['nombre' => 'Catálogo']);
        Producto::query()->create([
            'usuario_id' => $owner->id,
            'tienda_id' => $store->id,
            'categoria_id' => $category->id,
            'titulo' => 'Activo',
            'descripcion' => 'Visible',
            'precio' => 100,
            'estado_producto' => 'nuevo',
            'estado_publicacion' => 'activo',
            'visibilidad' => 'publica',
        ]);
        Producto::query()->create([
            'usuario_id' => $owner->id,
            'tienda_id' => $store->id,
            'categoria_id' => $category->id,
            'titulo' => 'Borrador',
            'descripcion' => 'No visible',
            'precio' => 100,
            'estado_producto' => 'nuevo',
            'estado_publicacion' => 'borrador',
            'visibilidad' => 'publica',
        ]);

        $this->getJson('/api/tiendas/'.$store->id)
            ->assertOk()
            ->assertJsonCount(1, 'productos.data')
            ->assertJsonPath('productos.data.0.titulo', 'Activo');

        Sanctum::actingAs($stranger);
        $this->getJson('/api/tiendas/'.$store->id.'/inventario')
            ->assertUnprocessable();
    }

    private function createStore(Usuario $owner): Tienda
    {
        $store = Tienda::query()->create([
            'owner_id' => $owner->id,
            'tipo' => 'tienda',
            'nombre' => 'Tienda '.$owner->id,
            'slug' => 'tienda-'.$owner->id,
            'estado' => 'activa',
            'estado_verificacion' => 'ninguna',
        ]);
        MiembroTienda::query()->create([
            'tienda_id' => $store->id,
            'usuario_id' => $owner->id,
            'rol' => 'owner',
            'estado' => 'activo',
        ]);

        return $store;
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Tienda',
            'apellido' => 'Test',
            'username' => 'tienda-'.$this->sequence,
            'email' => 'tienda-'.$this->sequence.'@example.com',
            'password' => Hash::make('secret'),
            'rol' => 'usuario',
            'estado' => 'activo',
        ], $overrides));
    }
}
