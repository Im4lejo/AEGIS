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
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Laravel\Sanctum\PersonalAccessToken;
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

    public function test_product_creation_requires_at_least_one_image(): void
    {
        $seller = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Accesorios']);
        Sanctum::actingAs($seller);

        $this->postJson('/api/productos', [
            'categoria_id' => $category->id,
            'titulo' => 'Teclado mecánico',
            'descripcion' => 'Teclado usado en buen estado.',
            'precio' => 150000,
            'estado_producto' => 'usado',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['imagenes']);
    }

    public function test_product_creation_requires_authentication(): void
    {
        $this->postJson('/api/productos')
            ->assertUnauthorized();
    }

    public function test_database_credentials_create_a_revocable_sanctum_session(): void
    {
        $user = $this->createUser([
            'username' => 'sesion-web',
            'email' => 'session@example.com',
        ]);

        $login = $this->postJson('/api/login', [
            'email' => 'session@example.com',
            'password' => 'secret',
        ])
            ->assertOk()
            ->assertJsonPath('usuario.id', $user->id)
            ->assertJsonStructure(['token', 'usuario' => ['nombre', 'apellido', 'email']]);

        $token = $login->json('token');

        $this->withToken($token)
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('usuario.id', $user->id)
            ->assertJsonMissingPath('usuario.password');

        $tokenId = PersonalAccessToken::findToken($token)->id;
        $this->withToken($token)->postJson('/api/logout')->assertOk();
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $tokenId]);
        Auth::forgetGuards();
        $this->withToken($token)->getJson('/api/me')->assertUnauthorized();
    }

    public function test_registration_matches_the_usuario_database_fields(): void
    {
        $response = $this->postJson('/api/register', [
            'nombre' => 'Ana',
            'apellido' => 'Pérez',
            'username' => 'ana-perez',
            'email' => 'ana@example.com',
            'password' => 'password-seguro',
            'password_confirmation' => 'password-seguro',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('usuario.nombre', 'Ana')
            ->assertJsonPath('usuario.apellido', 'Pérez')
            ->assertJsonStructure(['token']);

        $this->assertDatabaseHas('usuarios', [
            'username' => 'ana-perez',
            'email' => 'ana@example.com',
        ]);
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

    public function test_authenticated_users_can_publish_forum_posts(): void
    {
        $author = $this->createUser(['username' => 'publicador']);
        Sanctum::actingAs($author);
        $content = '¿Qué tarjeta gráfica recomiendan para jugar?';

        $this->postJson('/api/foro', ['contenido' => $content])
            ->assertCreated()
            ->assertJsonPath('data.titulo', $content)
            ->assertJsonPath('data.contenido', $content)
            ->assertJsonPath('data.usuario.username', 'publicador');

        $this->assertDatabaseHas('publicaciones_foro', [
            'usuario_id' => $author->id,
            'titulo' => $content,
            'contenido' => $content,
        ]);
    }

    public function test_authenticated_users_can_comment_on_forum_posts(): void
    {
        $author = $this->createUser(['username' => 'autor']);
        $commenter = $this->createUser(['username' => 'comentarista']);
        $post = Publicacion::query()->create([
            'usuario_id' => $author->id,
            'titulo' => 'Consulta de hardware',
            'contenido' => '¿Qué tarjeta gráfica recomiendan?',
        ]);
        Sanctum::actingAs($commenter);

        $this->postJson('/api/foro/'.$post->id.'/comentarios', [
            'comentario' => 'Una GPU de gama media.',
        ])
            ->assertCreated()
            ->assertJsonPath('data.comentario', 'Una GPU de gama media.')
            ->assertJsonPath('data.usuario.username', 'comentarista');

        $this->assertDatabaseHas('comentarios_foro', [
            'publicacion_id' => $post->id,
            'usuario_id' => $commenter->id,
            'comentario' => 'Una GPU de gama media.',
        ]);
    }

    public function test_forum_posts_reject_non_image_attachments(): void
    {
        Sanctum::actingAs($this->createUser());

        $this->withHeader('Accept', 'application/json')
            ->post('/api/foro', [
                'contenido' => 'Publicación de prueba',
                'imagenes' => [
                    UploadedFile::fake()->create(
                        'manual.pdf',
                        20,
                        'application/pdf'
                    ),
                ],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['imagenes.0']);
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
        $post = Publicacion::query()->create([
            'usuario_id' => $owner->id,
            'titulo' => 'Mi publicación del foro',
            'contenido' => 'Consulta desde mi perfil.',
        ]);
        $post->comentarios()->create([
            'usuario_id' => $owner->id,
            'comentario' => 'Comentario visible desde el perfil.',
        ]);

        $this->getJson('/api/perfil/'.$owner->id)
            ->assertOk()
            ->assertJsonPath('data.perfil.username', 'owner')
            ->assertJsonMissingPath('data.perfil.email')
            ->assertJsonMissingPath('data.perfil.password')
            ->assertJsonCount(1, 'data.productos')
            ->assertJsonCount(1, 'data.publicaciones')
            ->assertJsonPath('data.publicaciones.0.id', $post->id)
            ->assertJsonPath('data.publicaciones.0.comentarios_count', 1)
            ->assertJsonPath(
                'data.publicaciones.0.comentarios.0.comentario',
                'Comentario visible desde el perfil.'
            )
            ->assertJsonPath(
                'data.publicaciones.0.comentarios.0.usuario.username',
                'owner'
            );

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
        $this->options('/api/productos', [], [
            'Origin' => 'http://localhost:5173',
            'Access-Control-Request-Method' => 'GET',
        ])
            ->assertNoContent()
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
