<?php

namespace Tests\Feature;

use App\Models\Notificacion;
use App\Models\Usuario;
use App\Services\NotificationDispatcher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_notification_is_deduplicated_and_privately_owned(): void
    {
        $owner = $this->createUser();
        $stranger = $this->createUser();
        Sanctum::actingAs($owner);

        $first = $this->postJson('/api/notificaciones/probar', [
            'categoria' => 'social',
            'tipo' => 'comentario',
            'titulo' => 'Nuevo comentario',
            'mensaje' => 'Alguien comentó',
            'destino' => '/foro',
        ])
            ->assertCreated()->json('data');
        $second = $this->postJson('/api/notificaciones/probar', [
            'categoria' => 'social',
            'tipo' => 'comentario',
            'titulo' => 'Nuevo comentario',
            'mensaje' => 'Alguien comentó',
            'destino' => '/foro',
        ])
            ->assertCreated()->json('data');
        $this->assertSame($first['id'], $second['id']);

        Sanctum::actingAs($stranger);
        $this->getJson('/api/notificaciones')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_read_archive_and_read_all_are_owner_scoped(): void
    {
        $owner = $this->createUser();
        $stranger = $this->createUser();
        $notification = Notificacion::query()->create([
            'usuario_id' => $owner->id,
            'categoria' => 'marketplace',
            'tipo' => 'oferta',
            'titulo' => 'Oferta recibida',
            'mensaje' => 'Nueva oferta',
            'leida' => false,
        ]);

        Sanctum::actingAs($stranger);
        $this->patchJson('/api/notificaciones/'.$notification->id.'/leer')
            ->assertNotFound();

        Sanctum::actingAs($owner);
        $this->patchJson('/api/notificaciones/'.$notification->id.'/leer')
            ->assertOk();
        $this->patchJson('/api/notificaciones/'.$notification->id.'/archivar')
            ->assertOk();
        $this->assertDatabaseHas('notificaciones', [
            'id' => $notification->id,
            'usuario_id' => $owner->id,
            'leida' => 1,
        ]);
    }

    public function test_security_preference_remains_in_app_and_social_can_be_disabled(): void
    {
        $user = $this->createUser();
        Sanctum::actingAs($user);

        $this->patchJson('/api/notificaciones/preferencias', [
            'categoria' => 'social', 'in_app' => false, 'email' => false, 'push_web' => false,
        ])
            ->assertOk();
        $this->patchJson('/api/notificaciones/preferencias', [
            'categoria' => 'seguridad', 'in_app' => false,
        ])
            ->assertOk()
            ->assertJsonPath('data.in_app', true);

        $dispatcher = app(NotificationDispatcher::class);
        $social = $dispatcher->emit(
            $user->id, 'social', 'comentario', 'Social', 'Comentario',
            null, null, null, null, 'social-disabled-'.$user->id,
        );
        $security = $dispatcher->emit(
            $user->id, 'seguridad', 'inicio_sesion', 'Seguridad', 'Nuevo inicio',
            null, null, null, null, 'security-force-'.$user->id,
        );
        $this->assertNull($social);
        $this->assertNotNull($security);
    }

    public function test_filter_and_unread_badge_are_real(): void
    {
        $user = $this->createUser();
        Notificacion::query()->create([
            'usuario_id' => $user->id, 'categoria' => 'social', 'tipo' => 'seguimiento',
            'titulo' => 'Nuevo seguidor', 'mensaje' => 'Te siguió', 'leida' => false,
        ]);
        Notificacion::query()->create([
            'usuario_id' => $user->id, 'categoria' => 'seguridad', 'tipo' => 'login',
            'titulo' => 'Inicio de sesión', 'mensaje' => 'Nuevo acceso', 'leida' => true,
        ]);
        Sanctum::actingAs($user);

        $this->getJson('/api/notificaciones?categoria=social&estado=no_leidas')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.no_leidas', 1);
        $this->getJson('/api/notificaciones/no-leidas')
            ->assertOk()
            ->assertJsonPath('data.no_leidas', 1);
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Notificacion', 'apellido' => 'Test', 'username' => 'notificacion-'.$this->sequence,
            'email' => 'notificacion-'.$this->sequence.'@example.com', 'password' => Hash::make('secret'),
            'rol' => 'usuario', 'estado' => 'activo',
        ], $overrides));
    }
}
