<?php

namespace Tests\Feature;

use App\Contracts\MediaStorage;
use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Publicacion;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FakeMediaStorage implements MediaStorage
{
    public bool $destroySucceeds = true;

    public function upload(UploadedFile $file, string $folder, array $options = []): array
    {
        return [
            'public_id' => 'fake/'.$folder.'/'.uniqid(),
            'url' => 'https://sandbox.invalid/'.basename($file->getClientOriginalName()),
            'width' => 800,
            'height' => 600,
            'bytes' => $file->getSize(),
            'format' => 'jpg',
        ];
    }

    public function destroy(string $publicId, string $resourceType = 'image'): bool
    {
        return $this->destroySucceeds;
    }

    public function exists(string $publicId, string $resourceType = 'image'): bool
    {
        return true;
    }
}

class MediaManagementTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    protected function setUp(): void
    {
        parent::setUp();
        $this->app->instance(MediaStorage::class, new FakeMediaStorage);
    }

    public function test_owner_can_upload_reorder_and_delete_product_media(): void
    {
        $owner = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Media']);
        $product = Producto::query()->create([
            'usuario_id' => $owner->id,
            'categoria_id' => $category->id,
            'titulo' => 'Producto media',
            'descripcion' => 'Prueba',
            'precio' => 100,
            'estado_producto' => 'usado',
            'estado_publicacion' => 'activo',
            'visibilidad' => 'publica',
        ]);
        Sanctum::actingAs($owner);

        $this->post('/api/productos/'.$product->id.'/imagenes', [
            'imagenes' => [
                UploadedFile::fake()->image('uno.jpg', 800, 600),
                UploadedFile::fake()->image('dos.jpg', 800, 600),
            ],
            'alt_text' => 'Vista del producto',
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonCount(2, 'data');

        $ids = $product->imagenes()->orderBy('orden')->pluck('id')->all();
        $this->patchJson('/api/productos/'.$product->id.'/imagenes/orden', [
            'orden' => array_reverse($ids),
        ])->assertOk();

        $this->assertDatabaseHas('imagenes_producto', [
            'id' => $ids[1],
            'producto_id' => $product->id,
            'orden' => 0,
        ]);

        $this->deleteJson('/api/productos/'.$product->id.'/imagenes/'.$ids[0])
            ->assertOk()
            ->assertJsonPath('code', 'RESOURCE_DELETED');
        $this->assertDatabaseMissing('imagenes_producto', ['id' => $ids[0]]);
    }

    public function test_stranger_cannot_add_or_delete_media(): void
    {
        $owner = $this->createUser();
        $stranger = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Privado']);
        $product = Producto::query()->create([
            'usuario_id' => $owner->id,
            'categoria_id' => $category->id,
            'titulo' => 'Producto ajeno',
            'descripcion' => 'Prueba',
            'precio' => 100,
            'estado_producto' => 'usado',
        ]);

        Sanctum::actingAs($stranger);
        $this->post('/api/productos/'.$product->id.'/imagenes', [
            'imagenes' => [UploadedFile::fake()->image('ajena.jpg')],
        ], ['Accept' => 'application/json'])
            ->assertForbidden()
            ->assertJsonPath('code', 'FORBIDDEN_RESOURCE');
    }

    public function test_forum_media_rejects_invalid_mime_and_accepts_video(): void
    {
        $owner = $this->createUser();
        $post = Publicacion::query()->create([
            'usuario_id' => $owner->id,
            'titulo' => 'Post',
            'contenido' => 'Contenido',
            'visibilidad' => 'publica',
        ]);
        Sanctum::actingAs($owner);

        $this->post('/api/foro/'.$post->id.'/imagenes', [
            'imagenes' => [UploadedFile::fake()->create('manual.pdf', 100, 'application/pdf')],
        ], ['Accept' => 'application/json'])
            ->assertUnprocessable();

        $this->post('/api/foro/'.$post->id.'/imagenes', [
            'videos' => [UploadedFile::fake()->create('demo.mp4', 100, 'video/mp4')],
        ], ['Accept' => 'application/json'])
            ->assertCreated();
        $this->assertDatabaseHas('imagenes_publicacion_foro', [
            'publicacion_id' => $post->id,
            'mime_type' => 'video/mp4',
        ]);
    }

    public function test_failed_remote_delete_is_queued_for_retry(): void
    {
        $owner = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Retry']);
        $product = Producto::query()->create([
            'usuario_id' => $owner->id,
            'categoria_id' => $category->id,
            'titulo' => 'Producto retry',
            'descripcion' => 'Prueba',
            'precio' => 100,
            'estado_producto' => 'usado',
        ]);
        $image = $product->imagenes()->create([
            'imagen' => 'https://sandbox.invalid/test.jpg',
            'public_id' => 'fake/retry',
            'estado' => 'activo',
            'orden' => 0,
        ]);

        $fake = new FakeMediaStorage;
        $fake->destroySucceeds = false;
        $this->app->instance(MediaStorage::class, $fake);
        Sanctum::actingAs($owner);

        $this->deleteJson('/api/productos/'.$product->id.'/imagenes/'.$image->id)
            ->assertOk();
        $this->assertDatabaseHas('operaciones_media', [
            'accion' => 'eliminar',
            'public_id' => 'fake/retry',
            'estado' => 'pendiente',
        ]);
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Media',
            'apellido' => 'Test',
            'username' => 'media-'.$this->sequence,
            'email' => 'media-'.$this->sequence.'@example.com',
            'password' => Hash::make('secret'),
            'rol' => 'usuario',
            'estado' => 'activo',
        ], $overrides));
    }
}
