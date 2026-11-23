<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MarketplaceLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_price_zero_is_included_when_filtering_maximum(): void
    {
        $seller = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Gratis']);
        Producto::query()->create([
            'usuario_id' => $seller->id,
            'categoria_id' => $category->id,
            'titulo' => 'Gratis',
            'descripcion' => 'Producto gratuito',
            'precio' => 0,
            'estado_producto' => 'usado',
            'estado_publicacion' => 'activo',
        ]);

        $this->getJson('/api/productos?precio_max=0')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.precio', '0.00');
    }

    public function test_owner_can_create_draft_publish_pause_reserve_sell_and_archive(): void
    {
        $owner = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Electrónica']);
        $product = Producto::query()->create([
            'usuario_id' => $owner->id,
            'categoria_id' => $category->id,
            'titulo' => 'Anuncio',
            'descripcion' => 'Descripción válida',
            'precio' => 100,
            'estado_producto' => 'nuevo',
            'estado_publicacion' => 'borrador',
        ]);
        $product->imagenes()->create([
            'imagen' => 'https://sandbox.invalid/product.jpg',
            'public_id' => 'sandbox/product',
            'estado' => 'activo',
            'principal' => true,
            'orden' => 0,
        ]);

        Sanctum::actingAs($owner);
        $this->patchJson('/api/productos/'.$product->id.'/estado', [
            'estado' => 'activo',
        ])
            ->assertOk()
            ->assertJsonPath('data.estado_publicacion', 'activo');
        $this->patchJson('/api/productos/'.$product->id.'/estado', [
            'estado' => 'pausado',
        ])->assertOk();
        $this->patchJson('/api/productos/'.$product->id.'/estado', [
            'estado' => 'activo',
        ])->assertOk();
        $this->patchJson('/api/productos/'.$product->id.'/estado', [
            'estado' => 'reservado',
        ])->assertOk();
        $this->patchJson('/api/productos/'.$product->id.'/estado', [
            'estado' => 'vendido',
        ])
            ->assertOk()
            ->assertJsonPath('data.estado_publicacion', 'vendido');
    }

    public function test_stranger_cannot_transition_product_and_publish_requires_content(): void
    {
        $owner = $this->createUser();
        $stranger = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Pruebas']);
        $product = Producto::query()->create([
            'usuario_id' => $owner->id,
            'categoria_id' => $category->id,
            'titulo' => '',
            'descripcion' => '',
            'precio' => 0,
            'estado_producto' => 'usado',
            'estado_publicacion' => 'borrador',
        ]);

        Sanctum::actingAs($stranger);
        $this->patchJson('/api/productos/'.$product->id.'/estado', [
            'estado' => 'activo',
        ])
            ->assertForbidden()
            ->assertJsonPath('code', 'FORBIDDEN_RESOURCE');

        Sanctum::actingAs($owner);
        $this->patchJson('/api/productos/'.$product->id.'/estado', [
            'estado' => 'activo',
        ])
            ->assertUnprocessable();
    }

    public function test_owner_can_list_drafts_and_stats(): void
    {
        $owner = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Mis anuncios']);
        foreach (['borrador', 'activo', 'vendido'] as $estado) {
            Producto::query()->create([
                'usuario_id' => $owner->id,
                'categoria_id' => $category->id,
                'titulo' => 'Anuncio '.$estado,
                'descripcion' => 'Descripción',
                'precio' => 10,
                'estado_producto' => 'usado',
                'estado_publicacion' => $estado,
            ]);
        }

        Sanctum::actingAs($owner);
        $this->getJson('/api/productos/mis?estado=borrador')
            ->assertOk()
            ->assertJsonCount(1, 'data');
        $this->getJson('/api/productos/mis/estadisticas')
            ->assertOk()
            ->assertJsonPath('data.total', 3)
            ->assertJsonPath('data.borradores', 1)
            ->assertJsonPath('data.vendidos', 1);
    }

    public function test_partial_draft_can_be_created_and_legacy_active_creation_still_requires_fields(): void
    {
        $owner = $this->createUser();
        Sanctum::actingAs($owner);

        $this->postJson('/api/productos', [
            'estado_publicacion' => 'borrador',
        ])
            ->assertCreated()
            ->assertJsonPath('data.estado_publicacion', 'borrador');

        $this->postJson('/api/productos', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'categoria_id',
                'titulo',
                'descripcion',
                'precio',
                'estado_producto',
                'imagenes',
            ]);
    }

    public function test_invalid_transition_is_conflict(): void
    {
        $owner = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Transiciones']);
        $product = Producto::query()->create([
            'usuario_id' => $owner->id,
            'categoria_id' => $category->id,
            'titulo' => 'Vendido',
            'descripcion' => 'Descripción',
            'precio' => 100,
            'estado_producto' => 'nuevo',
            'estado_publicacion' => 'vendido',
        ]);

        Sanctum::actingAs($owner);
        $this->patchJson('/api/productos/'.$product->id.'/estado', [
            'estado' => 'pausado',
        ])
            ->assertConflict()
            ->assertJsonPath('code', 'INVALID_PRODUCT_TRANSITION');
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Mercado',
            'apellido' => 'Test',
            'username' => 'mercado-'.$this->sequence,
            'email' => 'mercado-'.$this->sequence.'@example.com',
            'password' => Hash::make('secret'),
            'rol' => 'usuario',
            'estado' => 'activo',
        ], $overrides));
    }
}
