<?php

namespace Tests\Feature;

use App\Models\Publicacion;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SocialFeedTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_legacy_forum_adapter_and_feed_cursor_return_public_posts(): void
    {
        $author = $this->createUser();
        for ($index = 0; $index < 3; $index++) {
            Publicacion::query()->create([
                'usuario_id' => $author->id,
                'titulo' => 'Post '.$index,
                'contenido' => 'Contenido '.$index,
                'visibilidad' => 'publica',
                'estado' => 'publicado',
                'fecha_publicacion' => now()->subMinutes($index),
            ]);
        }

        $legacy = $this->getJson('/api/foro?per_page=2')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);
        $this->assertCount(2, $legacy->json('data'));

        $feed = $this->getJson('/api/foro?tab=recientes&per_page=2')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['ranking', 'next_cursor', 'has_more']]);
        $this->assertNotNull($feed->json('meta.next_cursor'));
    }

    public function test_owner_can_edit_archive_and_schedule_post(): void
    {
        $owner = $this->createUser();
        $stranger = $this->createUser();
        $post = Publicacion::query()->create([
            'usuario_id' => $owner->id,
            'titulo' => 'Original',
            'contenido' => 'Contenido',
            'visibilidad' => 'publica',
            'estado' => 'publicado',
        ]);

        Sanctum::actingAs($stranger);
        $this->patchJson('/api/foro/'.$post->id, ['contenido' => 'Ajeno'])
            ->assertForbidden();

        Sanctum::actingAs($owner);
        $this->patchJson('/api/foro/'.$post->id, [
            'titulo' => 'Editado',
            'contenido' => 'Contenido editado',
            'estado' => 'programado',
            'programada_para' => now()->addHour()->toIso8601String(),
            'etiquetas' => ['hardware', 'venta'],
            'enlace_preview_url' => 'https://example.com/producto',
        ])
            ->assertOk()
            ->assertJsonPath('data.titulo', 'Editado')
            ->assertJsonPath('data.estado', 'programado');

        $this->patchJson('/api/foro/'.$post->id.'/archivar')
            ->assertOk()
            ->assertJsonPath('data.estado', 'archivado');
    }

    public function test_private_post_is_hidden_but_owner_and_reactions_work(): void
    {
        $owner = $this->createUser();
        $viewer = $this->createUser();
        $post = Publicacion::query()->create([
            'usuario_id' => $owner->id,
            'titulo' => 'Privado',
            'contenido' => 'Solo autorizado',
            'visibilidad' => 'privada',
            'estado' => 'publicado',
        ]);

        $this->getJson('/api/foro/'.$post->id)
            ->assertForbidden()
            ->assertJsonPath('code', 'PRIVATE_RESOURCE');

        Sanctum::actingAs($viewer);
        $this->postJson('/api/foro/'.$post->id.'/reacciones', ['tipo' => 'me_gusta'])
            ->assertForbidden();

        Sanctum::actingAs($owner);
        $this->patchJson('/api/foro/'.$post->id, ['visibilidad' => 'publica'])
            ->assertOk();
        $this->postJson('/api/foro/'.$post->id.'/reacciones', ['tipo' => 'util'])
            ->assertCreated()
            ->assertJsonPath('data.count', 1);
    }

    public function test_following_feed_excludes_blocked_users_and_uses_followed_authors(): void
    {
        $author = $this->createUser();
        $blocked = $this->createUser();
        $viewer = $this->createUser();

        DB::table('seguimientos')->insert([
            'seguidor_id' => $viewer->id,
            'seguido_id' => $author->id,
            'estado' => 'aceptado',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('bloqueos_usuario')->insert([
            'bloqueador_id' => $viewer->id,
            'bloqueado_id' => $blocked->id,
            'tipo' => 'bloqueo',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Publicacion::query()->create([
            'usuario_id' => $author->id,
            'titulo' => 'Seguido',
            'contenido' => 'Visible',
            'visibilidad' => 'publica',
            'estado' => 'publicado',
        ]);
        Publicacion::query()->create([
            'usuario_id' => $blocked->id,
            'titulo' => 'Bloqueado',
            'contenido' => 'Oculto',
            'visibilidad' => 'publica',
            'estado' => 'publicado',
        ]);

        Sanctum::actingAs($viewer);
        $feed = $this->getJson('/api/foro?tab=siguiendo&per_page=20')
            ->assertOk();

        $this->assertSame(['Seguido'], collect($feed->json('data'))->pluck('titulo')->all());
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Feed',
            'apellido' => 'Test',
            'username' => 'feed-'.$this->sequence,
            'email' => 'feed-'.$this->sequence.'@example.com',
            'password' => Hash::make('secret'),
            'rol' => 'usuario',
            'estado' => 'activo',
            'perfil_privado' => false,
        ], $overrides));
    }
}
