<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OfferTransactionTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_buyer_cannot_offer_to_self_and_duplicate_active_offer_is_blocked(): void
    {
        $seller = $this->createUser();
        $buyer = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Negociación']);
        $product = Producto::query()->create([
            'usuario_id' => $seller->id, 'categoria_id' => $category->id, 'titulo' => 'Anuncio',
            'descripcion' => 'Producto', 'precio' => 100, 'estado_producto' => 'nuevo', 'estado_publicacion' => 'activo',
        ]);

        Sanctum::actingAs($seller);
        $this->postJson('/api/ofertas', ['producto_id' => $product->id, 'monto' => 90])
            ->assertUnprocessable();

        Sanctum::actingAs($buyer);
        $this->postJson('/api/ofertas', ['producto_id' => $product->id, 'monto' => 90])
            ->assertCreated();
        $this->postJson('/api/ofertas', ['producto_id' => $product->id, 'monto' => 80])
            ->assertUnprocessable();
    }

    public function test_seller_accepts_offer_reserves_product_and_completes_operation(): void
    {
        $seller = $this->createUser();
        $buyer = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Reserva']);
        $product = Producto::query()->create([
            'usuario_id' => $seller->id, 'categoria_id' => $category->id, 'titulo' => 'Anuncio',
            'descripcion' => 'Producto', 'precio' => 100, 'estado_producto' => 'nuevo', 'estado_publicacion' => 'activo',
        ]);

        Sanctum::actingAs($buyer);
        $offer = $this->postJson('/api/ofertas', ['producto_id' => $product->id, 'monto' => 90])
            ->assertCreated()->json('data');

        Sanctum::actingAs($seller);
        $accepted = $this->patchJson('/api/ofertas/'.$offer['id'].'/decision', ['decision' => 'aceptada'])
            ->assertOk()->json('data');

        $this->assertDatabaseHas('reservas_producto', [
            'producto_id' => $product->id, 'comprador_id' => $buyer->id, 'estado' => 'activa',
        ]);
        $this->assertDatabaseHas('productos', ['id' => $product->id, 'estado_publicacion' => 'reservado']);

        $operation = $accepted['operacion'];
        $this->patchJson('/api/operaciones/'.$operation['id'], ['estado' => 'completada'])
            ->assertOk();
        $this->assertDatabaseHas('operaciones_comerciales', ['id' => $operation['id'], 'estado' => 'completada']);
        $this->assertDatabaseHas('productos', ['id' => $product->id, 'estado_publicacion' => 'vendido']);
    }

    public function test_third_party_cannot_accept_or_complete_operation(): void
    {
        $seller = $this->createUser();
        $buyer = $this->createUser();
        $third = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Permisos']);
        $product = Producto::query()->create([
            'usuario_id' => $seller->id, 'categoria_id' => $category->id, 'titulo' => 'Anuncio',
            'descripcion' => 'Producto', 'precio' => 100, 'estado_producto' => 'nuevo', 'estado_publicacion' => 'activo',
        ]);
        Sanctum::actingAs($buyer);
        $offer = $this->postJson('/api/ofertas', ['producto_id' => $product->id, 'monto' => 90])->json('data');

        Sanctum::actingAs($third);
        $this->patchJson('/api/ofertas/'.$offer['id'].'/decision', ['decision' => 'aceptada'])
            ->assertForbidden();
    }

    public function test_inventory_reservation_prevents_negative_stock(): void
    {
        $seller = $this->createUser();
        $buyer = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Stock']);
        $product = Producto::query()->create([
            'usuario_id' => $seller->id, 'categoria_id' => $category->id, 'titulo' => 'Unidad',
            'descripcion' => 'Producto', 'precio' => 100, 'estado_producto' => 'nuevo', 'estado_publicacion' => 'activo',
        ]);
        $inventory = $product->inventario()->create([
            'tienda_id' => null, 'stock' => 1, 'stock_reservado' => 1, 'seguimiento_stock' => true,
        ]);
        Sanctum::actingAs($buyer);
        $offer = $this->postJson('/api/ofertas', ['producto_id' => $product->id, 'monto' => 90])->json('data');
        Sanctum::actingAs($seller);
        $this->patchJson('/api/ofertas/'.$offer['id'].'/decision', ['decision' => 'aceptada'])
            ->assertUnprocessable();
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Oferta', 'apellido' => 'Test', 'username' => 'oferta-'.$this->sequence,
            'email' => 'oferta-'.$this->sequence.'@example.com', 'password' => Hash::make('secret'),
            'rol' => 'usuario', 'estado' => 'activo',
        ], $overrides));
    }
}
