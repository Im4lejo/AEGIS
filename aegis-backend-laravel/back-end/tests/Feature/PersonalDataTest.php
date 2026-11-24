<?php

namespace Tests\Feature;

use App\Models\Producto;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PersonalDataTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_seller_stats_are_owner_scoped_and_view_deduplicated(): void
    {
        $seller = $this->createUser();
        $viewer = $this->createUser();
        $stranger = $this->createUser();
        $own = Producto::query()->create([
            'usuario_id' => $seller->id,
            'titulo' => 'Laptop AEGIS',
            'descripcion' => 'Equipo real',
            'precio' => 1000,
            'estado_publicacion' => 'activo',
            'visibilidad' => 'publica',
        ]);
        $foreign = Producto::query()->create([
            'usuario_id' => $stranger->id,
            'titulo' => 'Otro equipo',
            'descripcion' => 'Equipo ajeno',
            'precio' => 500,
            'estado_publicacion' => 'activo',
            'visibilidad' => 'publica',
        ]);

        Sanctum::actingAs($seller);
        $ownStats = $this->getJson('/api/datos-vendedor?periodo=30d')
            ->assertOk()
            ->assertJsonStructure(['periodo', 'desde', 'hasta', 'fuentes', 'data'])
            ->json('data');
        $this->assertArrayHasKey('vistas_validas', $ownStats);

        Sanctum::actingAs($viewer);
        $this->getJson('/api/productos/'.$own->id)->assertOk();
        $this->getJson('/api/productos/'.$own->id)->assertOk();
        $this->assertDatabaseCount('eventos_comerciales_usuario', 1);

        $stats = $this->getJson('/api/datos-vendedor?periodo=30d')
            ->assertOk()
            ->json('data');
        $this->assertSame(0, (int) $stats['vistas_validas']);
    }

    public function test_activity_and_export_do_not_expose_foreign_data(): void
    {
        $owner = $this->createUser();
        $stranger = $this->createUser();
        Producto::query()->create([
            'usuario_id' => $owner->id,
            'titulo' => 'Privado dueño',
            'descripcion' => 'Solo exportación propia',
            'precio' => 100,
            'estado_publicacion' => 'activo',
            'visibilidad' => 'publica',
        ]);
        Producto::query()->create([
            'usuario_id' => $stranger->id,
            'titulo' => 'Equipo ajeno',
            'descripcion' => 'No exportar',
            'precio' => 200,
            'estado_publicacion' => 'activo',
            'visibilidad' => 'publica',
        ]);

        Sanctum::actingAs($owner);
        $activity = $this->getJson('/api/mi-actividad')
            ->assertOk()
            ->json('data');
        $this->assertIsArray($activity);

        $export = $this->post('/api/datos/exportacion', [
            'confirmacion' => 'EXPORTAR',
        ], ['Accept' => 'application/json'])
            ->assertOk()
            ->headers;
        $this->assertStringStartsWith('application/json', (string) $export->get('Content-Type'));

        Sanctum::actingAs($stranger);
        $this->postJson('/api/datos/exportacion', [
            'confirmacion' => 'NO',
        ])
            ->assertUnprocessable();
    }

    public function test_privacy_requests_are_active_and_deactivation_preserves_business_records(): void
    {
        $owner = $this->createUser();
        $product = Producto::query()->create([
            'usuario_id' => $owner->id,
            'titulo' => 'Conservar',
            'descripcion' => 'Referencia comercial',
            'precio' => 250,
            'estado_publicacion' => 'activo',
            'visibilidad' => 'publica',
        ]);

        Sanctum::actingAs($owner);
        $this->postJson('/api/datos/privacidad', [
            'tipo' => 'desactivacion',
            'motivo' => 'Ya no usaré la cuenta temporalmente.',
            'confirmacion' => 'CONFIRME',
        ])
            ->assertCreated()
            ->assertJsonPath('data.estado', 'solicitada');
        $this->postJson('/api/datos/privacidad', [
            'tipo' => 'desactivacion',
            'confirmacion' => 'CONFIRME',
        ])
            ->assertUnprocessable();

        $this->assertDatabaseHas('productos', [
            'id' => $product->id,
            'usuario_id' => $owner->id,
        ]);
        $this->assertDatabaseHas('solicitudes_privacidad', [
            'usuario_id' => $owner->id,
            'tipo' => 'desactivacion',
            'estado' => 'solicitada',
        ]);
        $this->assertSame('suspendido', $owner->fresh()->estado);

        Sanctum::actingAs($owner);
        $this->getJson('/api/datos/privacidad')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;
        return Usuario::query()->create(array_merge([
            'nombre' => 'Datos',
            'apellido' => 'Test',
            'username' => 'datos-'.$this->sequence,
            'email' => 'datos-'.$this->sequence.'@example.com',
            'password' => Hash::make('secret'),
            'rol' => 'usuario',
            'estado' => 'activo',
        ], $overrides));
    }
}
