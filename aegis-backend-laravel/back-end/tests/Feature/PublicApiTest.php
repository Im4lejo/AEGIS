<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Comentario;
use App\Models\ImagenProducto;
use App\Models\Producto;
use App\Models\Publicacion;
use App\Models\PuntoFisico;
use App\Models\Usuario;
use Database\Seeders\CategoriaSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PublicApiTest extends TestCase
{
    use RefreshDatabase;

    private int $userNumber = 0;

    public function test_product_listing_filters_active_products_and_hides_private_seller_fields(): void
    {
        $seller = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Componentes']);
        $product = $this->createProduct($seller, $category, [
            'titulo' => 'Tarjeta gráfica',
            'precio' => 120000,
        ]);
        ImagenProducto::query()->create([
            'producto_id' => $product->id,
            'imagen' => 'gpu.jpg',
            'principal' => true,
        ]);
        $this->createProduct($seller, $category, [
            'titulo' => 'Producto oculto',
            'estado_publicacion' => 'oculto',
        ]);

        $response = $this->getJson('/api/productos?busqueda=gráfica&per_page=1');

        $response
            ->assertOk()
            ->assertJsonPath('data.0.titulo', 'Tarjeta gráfica')
            ->assertJsonPath('data.0.imagen_principal', 'gpu.jpg')
            ->assertJsonPath('meta.total', 1)
            ->assertJsonMissingPath('data.0.vendedor.email')
            ->assertJsonMissingPath('data.0.vendedor.password');
    }

    public function test_product_details_only_return_active_products(): void
    {
        $seller = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Consolas']);
        $active = $this->createProduct($seller, $category);
        $hidden = $this->createProduct($seller, $category, [
            'estado_publicacion' => 'oculto',
        ]);

        $this->getJson('/api/productos/'.$active->id)->assertOk();
        $this->getJson('/api/productos/'.$hidden->id)->assertNotFound();
    }

    public function test_forum_feed_contains_authors_and_comments_without_private_fields(): void
    {
        $author = $this->createUser(['username' => 'autor']);
        $commenter = $this->createUser(['username' => 'comentarista']);
        $post = Publicacion::query()->create([
            'usuario_id' => $author->id,
            'titulo' => 'Consulta de hardware',
            'contenido' => '¿Qué fuente recomiendan?',
        ]);
        Comentario::query()->create([
            'publicacion_id' => $post->id,
            'usuario_id' => $commenter->id,
            'comentario' => 'Una fuente certificada.',
        ]);

        $this->getJson('/api/foro')
            ->assertOk()
            ->assertJsonPath('data.0.usuario.username', 'autor')
            ->assertJsonPath('data.0.comentarios.0.usuario.username', 'comentarista')
            ->assertJsonMissingPath('data.0.usuario.email')
            ->assertJsonMissingPath('data.0.comentarios.0.usuario.password');
    }

    public function test_profile_and_physical_point_endpoints_only_expose_public_records(): void
    {
        $owner = $this->createUser(['username' => 'owner']);
        $category = Categoria::query()->create(['nombre' => 'Computadores']);
        $point = PuntoFisico::query()->create([
            'owner_id' => $owner->id,
            'nombre' => 'Punto activo',
            'direccion' => 'Calle 1',
            'ciudad' => 'Popayán',
            'estado' => 'activo',
        ]);
        PuntoFisico::query()->create([
            'owner_id' => $owner->id,
            'nombre' => 'Punto pendiente',
            'direccion' => 'Calle 2',
            'ciudad' => 'Popayán',
            'estado' => 'pendiente',
        ]);
        $this->createProduct($owner, $category);

        $this->getJson('/api/perfiles/'.$owner->id)
            ->assertOk()
            ->assertJsonPath('data.perfil.username', 'owner')
            ->assertJsonMissingPath('data.perfil.email')
            ->assertJsonMissingPath('data.perfil.password')
            ->assertJsonCount(1, 'data.productos');

        $this->getJson('/api/puntos-fisicos')
            ->assertOk()
            ->assertJsonPath('data.0.id', $point->id)
            ->assertJsonMissingPath('data.0.owner.email')
            ->assertJsonCount(1, 'data');
    }

    public function test_home_and_category_endpoints_return_seeded_public_data(): void
    {
        $this->seed(CategoriaSeeder::class);
        $seller = $this->createUser();
        $category = Categoria::query()->where('nombre', 'Celulares')->firstOrFail();
        $this->createProduct($seller, $category);

        $this->getJson('/api/inicio')
            ->assertOk()
            ->assertJsonPath('data.0.titulo', 'Producto de prueba');

        $this->getJson('/api/categorias')
            ->assertOk()
            ->assertJsonPath('data.0.nombre', 'Celulares')
            ->assertJsonCount(5, 'data');
    }

    public function test_api_allows_cross_origin_requests_from_the_configured_frontend(): void
    {
        $this->options('/api/productos', [
            'Origin' => 'http://localhost:5173',
            'Access-Control-Request-Method' => 'GET',
        ])
            ->assertOk()
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->userNumber++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Test',
            'apellido' => 'User',
            'username' => 'test-user-'.$this->userNumber,
            'email' => 'test-'.$this->userNumber.'@example.com',
            'password' => Hash::make('secret'),
        ], $overrides));
    }

    private function createProduct(Usuario $seller, Categoria $category, array $overrides = []): Producto
    {
        return Producto::query()->create(array_merge([
            'usuario_id' => $seller->id,
            'categoria_id' => $category->id,
            'titulo' => 'Producto de prueba',
            'descripcion' => 'Descripción de prueba',
            'precio' => 100000,
            'estado_producto' => 'usado',
            'estado_publicacion' => 'activo',
        ], $overrides));
    }
}
