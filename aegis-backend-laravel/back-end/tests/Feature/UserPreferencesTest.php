<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserPreferencesTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_preferences_persist_by_user_and_reset_to_defaults(): void
    {
        $owner = $this->createUser();
        $stranger = $this->createUser();
        Sanctum::actingAs($owner);
        $updated = $this->putJson('/api/preferencias', [
            'version' => 1,
            'preferencias' => [
                'apariencia' => ['tema' => 'dark', 'acento' => 'green', 'densidad' => 'compacta', 'contraste' => 'alto'],
                'feed' => ['inicio' => 'recientes', 'categorias_favoritas' => ['Gaming']],
                'marketplace' => ['ciudad_aprox' => 'Popayán', 'moneda' => 'COP', 'formato_regional' => 'es-CO'],
            ],
        ])->assertOk();

        $this->assertSame('dark', $updated->json('data.apariencia.tema'));
        Sanctum::actingAs($stranger);
        $this->getJson('/api/preferencias')
            ->assertOk()
            ->assertJsonPath('data.apariencia.tema', 'system');

        Sanctum::actingAs($owner);
        $this->postJson('/api/preferencias/restablecer')
            ->assertOk()
            ->assertJsonPath('data.apariencia.tema', 'system');
    }

    public function test_invalid_preference_values_are_rejected(): void
    {
        $user = $this->createUser();
        Sanctum::actingAs($user);
        $this->putJson('/api/preferencias', [
            'version' => 1,
            'preferencias' => [
                'apariencia' => ['tema' => 'neon'],
                'marketplace' => ['moneda' => 'USD'],
            ],
        ])
            ->assertUnprocessable();
    }

    public function test_privacy_and_messaging_preferences_are_normalized(): void
    {
        $user = $this->createUser();
        Sanctum::actingAs($user);
        $response = $this->putJson('/api/preferencias', [
            'preferencias' => [
                'mensajeria' => [
                    'mensajes_desconocidos' => 'nadie',
                    'confirmaciones_lectura' => true,
                ],
                'privacidad' => [
                    'perfil_publico' => false,
                    'mostrar_presencia' => true,
                ],
            ],
        ])
            ->assertOk();
        $this->assertFalse($response->json('data.privacidad.perfil_publico') === true);
        $this->assertTrue($response->json('data.mensajeria.confirmaciones_lectura'));
    }

    public function test_version_defaults_and_owner_sync_are_available(): void
    {
        $user = $this->createUser();
        $this->getJson('/api/preferencias/defaults')
            ->assertOk()
            ->assertJsonPath('version', 1)
            ->assertJsonPath('data.apariencia.tema', 'system');
        Sanctum::actingAs($user);
        $this->getJson('/api/preferencias')
            ->assertOk()
            ->assertJsonPath('data.accesibilidad.reducir_movimiento', 'system');
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Preferencia', 'apellido' => 'Test', 'username' => 'pref-'.$this->sequence,
            'email' => 'pref-'.$this->sequence.'@example.com', 'password' => Hash::make('secret'),
            'rol' => 'usuario', 'estado' => 'activo',
        ], $overrides));
    }
}
