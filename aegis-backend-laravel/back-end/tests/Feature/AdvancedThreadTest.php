<?php

namespace Tests\Feature;

use App\Models\Comunidad;
use App\Models\MembresiaComunidad;
use App\Models\Publicacion;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdvancedThreadTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_question_accepts_one_solution_and_closed_thread_rejects_comments(): void
    {
        $author = $this->createUser();
        $answerer = $this->createUser();
        $post = Publicacion::query()->create([
            'usuario_id' => $author->id,
            'titulo' => 'Pregunta',
            'contenido' => '¿Cuál es la respuesta?',
            'tipo' => 'pregunta',
            'visibilidad' => 'publica',
            'estado' => 'publicado',
            'interaccion_estado' => 'abierto',
        ]);

        Sanctum::actingAs($answerer);
        $answer = $this->postJson('/api/foro/'.$post->id.'/comentarios', [
            'comentario' => 'Respuesta útil',
        ])->assertCreated()->json('data');

        Sanctum::actingAs($author);
        $this->patchJson('/api/foro/'.$post->id.'/solucion', [
            'comentario_id' => $answer['id'],
            'aceptada' => true,
        ])
            ->assertOk()
            ->assertJsonPath('data.es_solucion', true);

        $this->patchJson('/api/foro/'.$post->id.'/hilo', [
            'estado' => 'cerrado',
        ])
            ->assertOk()
            ->assertJsonPath('data.interaccion_estado', 'cerrado');

        Sanctum::actingAs($answerer);
        $this->postJson('/api/foro/'.$post->id.'/comentarios', [
            'comentario' => 'Después del cierre',
        ])
            ->assertForbidden()
            ->assertJsonPath('code', 'THREAD_CLOSED');
    }

    public function test_poll_accepts_only_one_choice_per_user_when_single_choice(): void
    {
        $owner = $this->createUser();
        $post = Publicacion::query()->create([
            'usuario_id' => $owner->id,
            'titulo' => 'Encuesta',
            'contenido' => 'Elige',
            'tipo' => 'encuesta',
            'visibilidad' => 'publica',
            'estado' => 'publicado',
        ]);

        Sanctum::actingAs($owner);
        $poll = $this->putJson('/api/foro/'.$post->id.'/encuesta', [
            'pregunta' => '¿Cuál prefieres?',
            'permite_multiple' => false,
            'opciones' => ['Uno', 'Dos'],
        ])
            ->assertCreated()
            ->json('data');
        $optionOne = $poll['opciones'][0]['id'];
        $optionTwo = $poll['opciones'][1]['id'];

        $this->postJson('/api/foro/'.$post->id.'/encuesta/voto', [
            'opcion_id' => $optionOne,
        ])
            ->assertCreated();
        $this->postJson('/api/foro/'.$post->id.'/encuesta/voto', [
            'opcion_id' => $optionTwo,
        ])
            ->assertCreated();

        $this->assertDatabaseMissing('votos_encuesta', [
            'encuesta_id' => $poll['id'],
            'usuario_id' => $owner->id,
            'opcion_id' => $optionOne,
        ]);
        $this->assertDatabaseHas('votos_encuesta', [
            'encuesta_id' => $poll['id'],
            'usuario_id' => $owner->id,
            'opcion_id' => $optionTwo,
        ]);
    }

    public function test_private_community_thread_is_hidden_and_subscription_is_idempotent(): void
    {
        $owner = $this->createUser();
        $outsider = $this->createUser();
        $community = Comunidad::query()->create([
            'owner_id' => $owner->id,
            'nombre' => 'Hilos privados',
            'slug' => 'hilos-privados',
            'visibilidad' => 'privada',
            'estado' => 'activa',
        ]);
        MembresiaComunidad::query()->create([
            'comunidad_id' => $community->id,
            'usuario_id' => $owner->id,
            'rol' => 'owner',
            'estado' => 'activo',
            'fecha_union' => now(),
        ]);
        $post = Publicacion::query()->create([
            'usuario_id' => $owner->id,
            'comunidad_id' => $community->id,
            'titulo' => 'Privado',
            'contenido' => 'Solo miembros',
            'tipo' => 'discusion',
            'visibilidad' => 'grupo_privado',
            'estado' => 'publicado',
        ]);

        Sanctum::actingAs($outsider);
        $this->getJson('/api/foro/'.$post->id)
            ->assertForbidden()
            ->assertJsonPath('code', 'COMMUNITY_PRIVATE');

        Sanctum::actingAs($owner);
        $this->postJson('/api/foro/'.$post->id.'/suscripcion')
            ->assertOk();
        $this->postJson('/api/foro/'.$post->id.'/suscripcion')
            ->assertOk();
        $this->assertDatabaseCount('suscripciones_hilo', 1);
    }

    public function test_feed_filters_type_and_orders_by_activity(): void
    {
        $owner = $this->createUser();
        Publicacion::query()->create([
            'usuario_id' => $owner->id,
            'titulo' => 'Pregunta reciente',
            'contenido' => 'Contenido',
            'tipo' => 'pregunta',
            'visibilidad' => 'publica',
            'estado' => 'publicado',
            'ultima_actividad' => now()->subMinute(),
        ]);
        Publicacion::query()->create([
            'usuario_id' => $owner->id,
            'titulo' => 'Discusión antigua',
            'contenido' => 'Contenido',
            'tipo' => 'discusion',
            'visibilidad' => 'publica',
            'estado' => 'publicado',
            'ultima_actividad' => now()->subDay(),
        ]);

        $this->getJson('/api/foro?tipo=pregunta&orden=actividad&per_page=10')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.tipo', 'pregunta');
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Hilo',
            'apellido' => 'Test',
            'username' => 'hilo-'.$this->sequence,
            'email' => 'hilo-'.$this->sequence.'@example.com',
            'password' => Hash::make('secret'),
            'rol' => 'usuario',
            'estado' => 'activo',
        ], $overrides));
    }
}
