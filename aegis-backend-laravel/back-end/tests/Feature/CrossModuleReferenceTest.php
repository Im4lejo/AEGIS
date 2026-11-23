<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Publicacion;
use App\Models\ReferenciaPublicacion;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CrossModuleReferenceTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_post_can_reference_active_product_and_read_live_values(): void
    {
        $author = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Referencia']);
        $product = Producto::query()->create([
            'usuario_id' => $author->id, 'categoria_id' => $category->id, 'titulo' => 'Anuncio actual',
            'descripcion' => 'Producto', 'precio' => 100, 'estado_producto' => 'nuevo', 'estado_publicacion' => 'activo',
            'visibilidad' => 'publica',
        ]);
        Sanctum::actingAs($author);
        $post = $this->postJson('/api/foro', [
            'contenido' => 'Recomiendo este equipo',
            'producto_id' => $product->id,
        ])->assertCreated()->json('data');

        $reference = ReferenciaPublicacion::query()
            ->where('publicacion_id', $post['id'])
            ->first();
        $this->assertNotNull($reference);
        $this->assertSame($product->id, $reference->producto_id);

        $product->update(['precio' => 125, 'estado_producto' => 'usado']);
        $this->getJson('/api/foro/'.$post['id'])
            ->assertOk()
            ->assertJsonPath('data.referencias_comerciales.0.precio', '125.00')
            ->assertJsonPath('data.referencias_comerciales.0.estado_producto', 'usado');
    }

    public function test_private_or_archived_product_reference_is_unavailable(): void
    {
        $author = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Privado']);
        $product = Producto::query()->create([
            'usuario_id' => $author->id, 'categoria_id' => $category->id, 'titulo' => 'Privado',
            'descripcion' => 'Producto', 'precio' => 100, 'estado_producto' => 'nuevo', 'estado_publicacion' => 'activo',
            'visibilidad' => 'publica',
        ]);
        $post = Publicacion::query()->create([
            'usuario_id' => $author->id, 'titulo' => 'Referencia', 'contenido' => 'Contenido', 'visibilidad' => 'publica',
        ]);
        ReferenciaPublicacion::query()->create([
            'publicacion_id' => $post->id, 'tipo' => 'producto', 'producto_id' => $product->id, 'orden' => 0,
        ]);

        $product->update(['estado_publicacion' => 'archivado']);
        $this->getJson('/api/foro/'.$post->id)
            ->assertOk()
            ->assertJsonPath('data.referencias_comerciales.0.disponible', false);

        $product->update(['estado_publicacion' => 'activo', 'visibilidad' => 'privada']);
        $this->getJson('/api/foro/'.$post->id)
            ->assertOk()
            ->assertJsonPath('data.referencias_comerciales.0.disponible', false);
    }

    public function test_profile_tabs_keep_product_post_and_discussion_audiences_separate(): void
    {
        $profile = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Perfil']);
        $product = Producto::query()->create([
            'usuario_id' => $profile->id, 'categoria_id' => $category->id, 'titulo' => 'Producto',
            'descripcion' => 'Producto', 'precio' => 100, 'estado_producto' => 'nuevo', 'estado_publicacion' => 'activo',
            'visibilidad' => 'publica',
        ]);
        Publicacion::query()->create([
            'usuario_id' => $profile->id, 'titulo' => 'Post', 'contenido' => 'Contenido', 'visibilidad' => 'publica',
        ]);

        $this->getJson('/api/perfil/'.$profile->id.'/tabs/productos')
            ->assertOk()
            ->assertJsonCount(1, 'data');
        $this->getJson('/api/perfil/'.$profile->id.'/tabs/publicaciones')
            ->assertOk()
            ->assertJsonCount(1, 'data');
        $this->getJson('/api/perfil/'.$profile->id.'/tabs/comunidades')
            ->assertOk();
    }

    public function test_stranger_cannot_reference_private_product(): void
    {
        $owner = $this->createUser();
        $stranger = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Referencia privada']);
        $product = Producto::query()->create([
            'usuario_id' => $owner->id, 'categoria_id' => $category->id, 'titulo' => 'Privado',
            'descripcion' => 'Producto', 'precio' => 100, 'estado_producto' => 'nuevo', 'estado_publicacion' => 'activo',
            'visibilidad' => 'privada',
        ]);
        Sanctum::actingAs($stranger);
        $this->postJson('/api/foro', [
            'contenido' => 'Compartir privado',
            'producto_id' => $product->id,
        ])
            ->assertUnprocessable();
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Cross', 'apellido' => 'Test', 'username' => 'cross-'.$this->sequence,
            'email' => 'cross-'.$this->sequence.'@example.com', 'password' => Hash::make('secret'),
            'rol' => 'usuario', 'estado' => 'activo',
        ], $overrides));
    }
}
