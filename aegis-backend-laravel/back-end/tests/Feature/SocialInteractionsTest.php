<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Publicacion;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SocialInteractionsTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_comment_thread_is_paginated_and_reply_depth_is_limited(): void
    {
        $owner = $this->createUser();
        $viewer = $this->createUser();
        $post = Publicacion::query()->create([
            'usuario_id' => $owner->id,
            'titulo' => 'Hilo',
            'contenido' => 'Contenido',
            'visibilidad' => 'publica',
            'estado' => 'publicado',
        ]);

        Sanctum::actingAs($viewer);
        $root = $this->postJson('/api/foro/'.$post->id.'/comentarios', [
            'comentario' => 'Comentario principal',
        ])->assertCreated()->json('data');

        $replyResponse = $this->postJson('/api/foro/'.$post->id.'/comentarios', [
            'comentario' => 'Respuesta',
            'comentario_padre_id' => $root['id'],
        ])
            ->assertCreated()
            ->assertJsonPath('data.comentario', 'Respuesta');
        $reply = $replyResponse->json('data');

        $this->postJson('/api/foro/'.$post->id.'/comentarios', [
            'comentario' => 'Respuesta inválida',
            'comentario_padre_id' => $reply['id'],
        ])
            ->assertUnprocessable();

        $this->getJson('/api/foro/'.$post->id.'/comentarios?per_page=10')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_owner_can_edit_delete_comment_and_repost_is_idempotent(): void
    {
        $owner = $this->createUser();
        $post = Publicacion::query()->create([
            'usuario_id' => $owner->id,
            'titulo' => 'Repost',
            'contenido' => 'Contenido',
            'visibilidad' => 'publica',
            'estado' => 'publicado',
        ]);
        Sanctum::actingAs($owner);

        $comment = $this->postJson('/api/foro/'.$post->id.'/comentarios', [
            'comentario' => 'Original',
        ])->assertCreated()->json('data');
        $this->patchJson('/api/foro/'.$post->id.'/comentarios/'.$comment['id'], [
            'comentario' => 'Editado',
        ])
            ->assertOk()
            ->assertJsonPath('data.comentario', 'Editado');

        $first = $this->postJson('/api/foro/'.$post->id.'/reposts')
            ->assertCreated();
        $second = $this->postJson('/api/foro/'.$post->id.'/reposts')
            ->assertCreated();
        $this->assertSame($first->json('data.id'), $second->json('data.id'));

        $this->deleteJson('/api/foro/'.$post->id.'/comentarios/'.$comment['id'])
            ->assertOk()
            ->assertJsonPath('code', 'RESOURCE_DELETED');
    }

    public function test_saved_resources_are_idempotent_and_collections_are_owned(): void
    {
        $owner = $this->createUser();
        $stranger = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Guardados']);
        $product = Producto::query()->create([
            'usuario_id' => $owner->id,
            'categoria_id' => $category->id,
            'titulo' => 'Producto',
            'descripcion' => 'Producto',
            'precio' => 100,
            'estado_producto' => 'usado',
        ]);

        Sanctum::actingAs($owner);
        $collection = $this->postJson('/api/guardados/colecciones', [
            'nombre' => 'Favoritos',
        ])->assertCreated()->json('data');
        $this->postJson('/api/guardados', [
            'recurso_tipo' => 'producto',
            'recurso_id' => $product->id,
            'coleccion_id' => $collection['id'],
        ])->assertCreated();
        $this->postJson('/api/guardados', [
            'recurso_tipo' => 'producto',
            'recurso_id' => $product->id,
            'coleccion_id' => $collection['id'],
        ])->assertCreated();
        $this->assertDatabaseCount('guardados', 1);

        $this->getJson('/api/guardados?recurso_tipo=producto')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        Sanctum::actingAs($stranger);
        $this->postJson('/api/guardados', [
            'recurso_tipo' => 'producto',
            'recurso_id' => $product->id,
            'coleccion_id' => $collection['id'],
        ])
            ->assertUnprocessable();
    }

    public function test_blocked_user_cannot_comment_and_context_report_is_created(): void
    {
        $owner = $this->createUser();
        $viewer = $this->createUser();
        $post = Publicacion::query()->create([
            'usuario_id' => $owner->id,
            'titulo' => 'Reporte',
            'contenido' => 'Contenido',
            'visibilidad' => 'publica',
            'estado' => 'publicado',
        ]);
        $this->app['db']->table('bloqueos_usuario')->insert([
            'bloqueador_id' => $owner->id,
            'bloqueado_id' => $viewer->id,
            'tipo' => 'bloqueo',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Sanctum::actingAs($viewer);
        $this->postJson('/api/foro/'.$post->id.'/comentarios', [
            'comentario' => 'Bloqueado',
        ])
            ->assertForbidden()
            ->assertJsonPath('code', 'PROFILE_RESTRICTED');

        $this->postJson('/api/reportes/contextual', [
            'recurso_tipo' => 'post',
            'recurso_id' => $post->id,
            'motivo' => 'Contenido inapropiado',
        ])
            ->assertCreated();
        $this->assertDatabaseHas('reportes', [
            'usuario_reporta_id' => $viewer->id,
            'usuario_reportado_id' => $owner->id,
            'recurso_tipo' => 'post',
            'recurso_id' => $post->id,
        ]);
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Social',
            'apellido' => 'Test',
            'username' => 'social-'.$this->sequence,
            'email' => 'social-'.$this->sequence.'@example.com',
            'password' => Hash::make('secret'),
            'rol' => 'usuario',
            'estado' => 'activo',
            'perfil_privado' => false,
        ], $overrides));
    }
}
