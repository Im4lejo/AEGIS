<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MarketplaceDiscoveryTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_combined_filters_include_location_recency_attributes_and_zero_price(): void
    {
        $seller = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Hardware']);
        $matching = Producto::query()->create([
            'usuario_id' => $seller->id,
            'categoria_id' => $category->id,
            'titulo' => 'Portátil Lenovo',
            'descripcion' => 'Computador',
            'precio' => 0,
            'estado_producto' => 'nuevo',
            'estado_publicacion' => 'activo',
            'visibilidad' => 'publica',
            'ciudad_aprox' => 'Popayán',
            'atributos' => ['marca' => 'Lenovo', 'ram' => '16GB'],
            'fecha_publicacion' => now(),
        ]);
        Producto::query()->create([
            'usuario_id' => $seller->id,
            'categoria_id' => $category->id,
            'titulo' => 'Otro equipo',
            'descripcion' => 'Computador',
            'precio' => 500,
            'estado_producto' => 'usado',
            'estado_publicacion' => 'activo',
            'visibilidad' => 'publica',
            'ciudad_aprox' => 'Cali',
            'atributos' => ['marca' => 'HP', 'ram' => '8GB'],
            'fecha_publicacion' => now()->subMonth(),
        ]);

        $this->getJson('/api/productos?precio_max=0&ciudad=Popayán&marca=Lenovo&dias=30&atributos[]=ram=16GB')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $matching->id);
    }

    public function test_comparison_returns_two_to_four_products_and_attribute_matrix(): void
    {
        $seller = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Comparables']);
        $first = $this->createProduct($seller, $category, [
            'titulo' => 'Uno',
            'atributos' => ['marca' => 'A', 'ram' => '8GB'],
        ]);
        $second = $this->createProduct($seller, $category, [
            'titulo' => 'Dos',
            'atributos' => ['marca' => 'B', 'almacenamiento' => '512GB'],
        ]);

        $this->getJson('/api/productos/comparar?ids='.$first->id.','.$second->id)
            ->assertOk()
            ->assertJsonCount(2, 'data.productos')
            ->assertJsonStructure([
                'data' => [
                    'productos',
                    'campos',
                ],
            ]);
    }

    public function test_similar_products_use_existing_category_and_price_range(): void
    {
        $seller = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Similar']);
        $base = $this->createProduct($seller, $category, ['precio' => 1000]);
        $similar = $this->createProduct($seller, $category, ['precio' => 1100]);
        $this->createProduct($seller, $category, ['precio' => 5000]);

        $this->getJson('/api/productos/'.$base->id.'/similares')
            ->assertOk()
            ->assertJsonPath('criterio', 'misma categoría y precio dentro de ±20%')
            ->assertJsonFragment(['id' => $similar->id]);
    }

    public function test_comparison_rejects_more_than_four_and_hidden_products(): void
    {
        $seller = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Límites']);
        $hidden = $this->createProduct($seller, $category, [
            'estado_publicacion' => 'oculto',
        ]);
        $visible = $this->createProduct($seller, $category);

        $this->getJson('/api/productos/comparar?ids='.$hidden->id.','.$visible->id)
            ->assertUnprocessable();
        $this->getJson('/api/productos/comparar?ids=1,2,3,4,5')
            ->assertUnprocessable();
    }

    public function test_controlled_500_record_filter_benchmark_returns_in_budget(): void
    {
        $seller = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Benchmark']);

        for ($index = 0; $index < 500; $index++) {
            $this->createProduct($seller, $category, [
                'titulo' => 'Benchmark '.$index,
                'precio' => 100 + ($index % 100),
                'estado_publicacion' => 'activo',
                'ciudad_aprox' => $index % 2 === 0 ? 'Popayán' : 'Cali',
                'atributos' => ['marca' => $index % 2 === 0 ? 'A' : 'B'],
            ]);
        }

        $started = hrtime(true);
        $response = $this->getJson('/api/productos?categoria_id=1&cat=Benchmark&ciudad=Popayán&marca=A&precio_min=100&precio_max=150&per_page=50')
            ->assertOk();
        $elapsedMs = (hrtime(true) - $started) / 1_000_000;

        $this->assertLessThan(1500, $elapsedMs);
        $this->assertLessThanOrEqual(50, count($response->json('data')));
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Descubrimiento',
            'apellido' => 'Test',
            'username' => 'descubrimiento-'.$this->sequence,
            'email' => 'descubrimiento-'.$this->sequence.'@example.com',
            'password' => Hash::make('secret'),
            'rol' => 'usuario',
            'estado' => 'activo',
        ], $overrides));
    }

    private function createProduct(
        Usuario $seller,
        Categoria $category,
        array $overrides = [],
    ): Producto {
        return Producto::query()->create(array_merge([
            'usuario_id' => $seller->id,
            'categoria_id' => $category->id,
            'titulo' => 'Producto',
            'descripcion' => 'Descripción',
            'precio' => 100,
            'estado_producto' => 'usado',
            'estado_publicacion' => 'activo',
            'visibilidad' => 'publica',
        ], $overrides));
    }
}
