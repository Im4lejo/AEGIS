<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Publicacion;
use App\Models\Usuario;
use App\Services\MediaManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileSocialTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_user_can_edit_profile_without_exposing_private_fields(): void
    {
        $user = $this->createUser([
            'telefono' => '3000000000',
            'ciudad' => 'Dirección exacta privada',
        ]);
        Sanctum::actingAs($user);

        $this->patchJson('/api/perfil/me', [
            'nombre' => 'Nombre público',
            'username' => 'nombre.publico',
            'url_publica' => 'nombre-publico',
            'ciudad_aprox' => 'Popayán',
            'descripcion' => 'Descripción social',
            'perfil_privado' => true,
            'mostrar_seguidores' => true,
            'mostrar_presencia' => true,
            'enlaces' => [
                ['tipo' => 'web', 'url' => 'https://example.com/perfil'],
            ],
        ])
            ->assertOk()
            ->assertJsonPath('data.perfil.username', 'nombre.publico')
            ->assertJsonMissingPath('data.perfil.email')
            ->assertJsonMissingPath('data.perfil.telefono')
            ->assertJsonMissingPath('data.perfil.ciudad');

        $this->assertDatabaseHas('enlaces_perfil', [
            'usuario_id' => $user->id,
            'url' => 'https://example.com/perfil',
        ]);
    }

    public function test_private_profile_is_hidden_and_follow_accepts_it(): void
    {
        $owner = $this->createUser(['perfil_privado' => true]);
        $viewer = $this->createUser();

        $this->getJson('/api/perfil/'.$owner->id)
            ->assertForbidden()
            ->assertJsonPath('code', 'PROFILE_PRIVATE');

        Sanctum::actingAs($viewer);
        $this->postJson('/api/perfil/'.$owner->id.'/seguir')
            ->assertCreated()
            ->assertJsonPath('data.estado', 'pendiente');

        $this->getJson('/api/perfil/'.$owner->id)
            ->assertForbidden();

        $this->app['db']->table('seguimientos')
            ->where('seguidor_id', $viewer->id)
            ->where('seguido_id', $owner->id)
            ->update(['estado' => 'aceptado']);

        $this->getJson('/api/perfil/'.$owner->id)
            ->assertOk();
    }

    public function test_public_tabs_paginate_and_information_hides_email_and_phone(): void
    {
        $owner = $this->createUser([
            'telefono' => '3001112233',
            'ciudad' => 'Calle privada 123',
            'ciudad_aprox' => 'Popayán',
        ]);
        $category = Categoria::query()->create(['nombre' => 'Perfil']);
        $product = Producto::query()->create([
            'usuario_id' => $owner->id,
            'categoria_id' => $category->id,
            'titulo' => 'Producto paginado',
            'descripcion' => 'Descripción',
            'precio' => 100,
            'estado_producto' => 'usado',
            'estado_publicacion' => 'activo',
            'visibilidad' => 'publica',
        ]);
        Publicacion::query()->create([
            'usuario_id' => $owner->id,
            'titulo' => 'Publicación',
            'contenido' => 'Contenido',
            'visibilidad' => 'publica',
        ]);

        $this->getJson('/api/perfil/'.$owner->id.'/tabs/publicaciones?per_page=1')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);
        $this->getJson('/api/perfil/'.$owner->id)
            ->assertOk()
            ->assertJsonPath('data.publicaciones.0.reacciones_count', 0);
        $this->getJson('/api/perfil/'.$owner->id.'/tabs/productos?per_page=1')
            ->assertOk()
            ->assertJsonPath('data.0.id', $product->id);
        $this->getJson('/api/perfil/'.$owner->id.'/tabs/informacion')
            ->assertOk()
            ->assertJsonMissingPath('data.email')
            ->assertJsonMissingPath('data.telefono')
            ->assertJsonMissingPath('data.ciudad')
            ->assertJsonPath('data.ciudad_aprox', 'Popayán');
    }

    public function test_block_and_mute_matrix_is_enforced(): void
    {
        $owner = $this->createUser();
        $viewer = $this->createUser();
        Sanctum::actingAs($viewer);

        $this->postJson('/api/perfil/'.$owner->id.'/restriccion', ['tipo' => 'bloqueo'])
            ->assertOk();
        $this->getJson('/api/perfil/'.$owner->id)
            ->assertForbidden()
            ->assertJsonPath('code', 'PROFILE_RESTRICTED');

        $this->postJson('/api/perfil/'.$owner->id.'/restriccion', ['tipo' => 'silencio'])
            ->assertOk();
        $this->deleteJson('/api/perfil/'.$owner->id.'/restriccion')
            ->assertOk();
    }

    public function test_deactivation_starts_retention_and_revokes_tokens(): void
    {
        $user = $this->createUser();
        Sanctum::actingAs($user);
        $this->postJson('/api/perfil/me/desactivar')
            ->assertOk()
            ->assertJsonPath('code', 'DEACTIVATION_PENDING');

        $this->assertDatabaseHas('desactivaciones_usuario', [
            'usuario_id' => $user->id,
            'estado' => 'pendiente_retencion',
        ]);
    }

    public function test_profile_images_use_their_cloudinary_folders(): void
    {
        $user = $this->createUser();
        Sanctum::actingAs($user);

        $media = \Mockery::mock(MediaManager::class);
        $media->shouldReceive('upload')
            ->once()
            ->with(\Mockery::type(UploadedFile::class), 'profile_images', 'Usuario/'.$user->id)
            ->andReturn(['url' => 'https://example.com/avatar.jpg', 'public_id' => 'profile-avatar']);
        $media->shouldReceive('upload')
            ->once()
            ->with(
                \Mockery::type(UploadedFile::class),
                'background_images',
                'Usuario/'.$user->id,
                false,
                [
                    'transformation' => [
                        'quality' => 'auto',
                        'fetch_format' => 'jpg',
                        'width' => 1280,
                        'height' => 1600,
                        'crop' => 'limit',
                    ],
                ],
            )
            ->andReturn(['url' => 'https://example.com/cover.jpg', 'public_id' => 'profile-cover']);
        $this->app->instance(MediaManager::class, $media);

        $this->withHeaders(['Accept' => 'application/json'])
            ->post('/api/perfil/media/avatar', [
                'imagen' => UploadedFile::fake()->create('avatar.jpg', 10, 'image/jpeg'),
            ])
            ->assertOk()
            ->assertJsonPath('data.url', 'https://example.com/avatar.jpg');
        $this->withHeaders(['Accept' => 'application/json'])
            ->post('/api/perfil/media/portada', [
                'imagen' => UploadedFile::fake()->create('cover.jpg', 10, 'image/jpeg'),
            ])
            ->assertOk()
            ->assertJsonPath('data.url', 'https://example.com/cover.jpg');
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Perfil',
            'apellido' => 'Test',
            'username' => 'perfil-'.$this->sequence,
            'email' => 'perfil-'.$this->sequence.'@example.com',
            'password' => Hash::make('secret'),
            'rol' => 'usuario',
            'estado' => 'activo',
            'perfil_privado' => false,
            'mostrar_seguidores' => true,
            'mostrar_presencia' => false,
        ], $overrides));
    }
}
