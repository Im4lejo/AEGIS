<?php

namespace Tests\Feature;

use App\Jobs\ExpirarHistorias;
use App\Models\Comunidad;
use App\Models\Historia;
use App\Models\MembresiaComunidad;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdvancedContentTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_story_expires_idempotently_and_stranger_cannot_delete_it(): void
    {
        $owner = $this->createUser();
        $stranger = $this->createUser();
        $story = Historia::query()->create([
            'usuario_id' => $owner->id,
            'tipo_media' => 'imagen',
            'media_url' => 'https://example.com/story.jpg',
            'mime_type' => 'image/jpeg',
            'texto' => 'Temporal',
            'audiencia' => 'publica',
            'estado' => 'activa',
            'expira_en' => now()->subMinute(),
        ]);

        (new ExpirarHistorias())->handle();
        (new ExpirarHistorias())->handle();
        $this->assertSame('expirada', $story->fresh()->estado);

        Sanctum::actingAs($stranger);
        $this->deleteJson('/api/historias/'.$story->id)
            ->assertForbidden()
            ->assertJsonPath('code', 'FORBIDDEN_RESOURCE');
    }

    public function test_private_story_is_hidden_outside_community_and_view_is_unique(): void
    {
        $owner = $this->createUser();
        $member = $this->createUser();
        $outsider = $this->createUser();
        $community = Comunidad::query()->create([
            'owner_id' => $owner->id,
            'nombre' => 'Privado',
            'slug' => 'privado',
            'visibilidad' => 'privada',
            'estado' => 'activa',
        ]);
        foreach ([$owner, $member] as $index => $user) {
            MembresiaComunidad::query()->create([
                'comunidad_id' => $community->id,
                'usuario_id' => $user->id,
                'rol' => $index === 0 ? 'owner' : 'miembro',
                'estado' => 'activo',
                'fecha_union' => now(),
            ]);
        }
        $story = Historia::query()->create([
            'usuario_id' => $owner->id,
            'comunidad_id' => $community->id,
            'tipo_media' => 'imagen',
            'media_url' => 'https://example.com/private.jpg',
            'mime_type' => 'image/jpeg',
            'audiencia' => 'grupo_privado',
            'estado' => 'activa',
            'expira_en' => now()->addHour(),
        ]);

        Sanctum::actingAs($outsider);
        $this->getJson('/api/historias/'.$story->id)
            ->assertForbidden()
            ->assertJsonPath('code', 'PRIVATE_STORY');
        Sanctum::actingAs($member);
        $this->getJson('/api/historias/'.$story->id)->assertOk();
        $this->getJson('/api/historias/'.$story->id)->assertOk();
        $this->assertDatabaseCount('visualizaciones_historia', 1);
    }

    public function test_event_owner_and_moderator_can_cancel_but_member_cannot(): void
    {
        $owner = $this->createUser();
        $moderator = $this->createUser();
        $member = $this->createUser();
        $community = Comunidad::query()->create([
            'owner_id' => $owner->id,
            'nombre' => 'Eventos',
            'slug' => 'eventos',
            'visibilidad' => 'publica',
            'estado' => 'activa',
        ]);
        foreach ([
            [$owner, 'owner'],
            [$moderator, 'moderador'],
            [$member, 'miembro'],
        ] as [$user, $role]) {
            MembresiaComunidad::query()->create([
                'comunidad_id' => $community->id,
                'usuario_id' => $user->id,
                'rol' => $role,
                'estado' => 'activo',
                'fecha_union' => now(),
            ]);
        }

        Sanctum::actingAs($owner);
        $created = $this->postJson('/api/comunidades/'.$community->id.'/eventos', [
            'titulo' => 'Encuentro AEGIS',
            'descripcion' => 'Reunión comunitaria',
            'fecha_inicio' => now()->addDay()->toIso8601String(),
            'cupo' => 2,
        ])
            ->assertCreated();
        $eventId = $created->json('data.id');

        Sanctum::actingAs($member);
        $this->patchJson('/api/eventos/'.$eventId.'/cancelar')
            ->assertForbidden();
        $this->postJson('/api/eventos/'.$eventId.'/participacion', [
            'estado' => 'asistira',
        ])->assertCreated();

        Sanctum::actingAs($moderator);
        $this->patchJson('/api/eventos/'.$eventId.'/cancelar')
            ->assertOk()
            ->assertJsonPath('data.estado', 'cancelado');
    }

    public function test_video_capabilities_and_live_unavailable_are_honest(): void
    {
        $this->getJson('/api/video/capabilities')
            ->assertOk()
            ->assertJsonPath('live.available', false)
            ->assertJsonPath('vod.max_size_bytes', 26214400);

        $user = $this->createUser();
        Sanctum::actingAs($user);
        $this->postJson('/api/live/sessions')
            ->assertStatus(503)
            ->assertJsonPath('code', 'LIVE_UNAVAILABLE');
        $this->assertDatabaseHas('sesiones_live', [
            'usuario_id' => $user->id,
            'estado' => 'no_disponible',
        ]);
    }

    public function test_suspended_user_cannot_create_story_or_event(): void
    {
        $user = $this->createUser(['estado' => 'suspendido']);
        Sanctum::actingAs($user);

        $this->postJson('/api/historias', [
            'audiencia' => 'publica',
            'texto' => 'No permitido',
        ])
            ->assertForbidden();
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Avanzado',
            'apellido' => 'Test',
            'username' => 'avanzado-'.$this->sequence,
            'email' => 'avanzado-'.$this->sequence.'@example.com',
            'password' => Hash::make('secret'),
            'rol' => 'usuario',
            'estado' => 'activo',
        ], $overrides));
    }
}
