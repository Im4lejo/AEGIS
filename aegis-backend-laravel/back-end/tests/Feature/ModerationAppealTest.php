<?php

namespace Tests\Feature;

use App\Models\Producto;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ModerationAppealTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_stranger_cannot_read_or_manage_moderation_queue(): void
    {
        $user = $this->createUser();
        $admin = $this->createUser(['rol' => 'admin']);
        Sanctum::actingAs($user);
        $this->getJson('/api/moderacion/reportes')->assertForbidden();

        Sanctum::actingAs($admin);
        $this->getJson('/api/moderacion/reportes')->assertOk();
    }

    public function test_report_is_private_deduplicated_and_mine_only(): void
    {
        $reporter = $this->createUser();
        $other = $this->createUser();
        $reported = $this->createUser();

        Sanctum::actingAs($reporter);
        $created = $this->postJson('/api/reportes/contextual', [
            'recurso_tipo' => 'usuario',
            'recurso_id' => $reported->id,
            'motivo' => 'acoso',
            'descripcion' => 'Descripción verificable.',
            'evidencia' => ['https://example.com/evidencia'],
        ])
            ->assertCreated();

        $this->getJson('/api/reportes/mis')
            ->assertOk()
            ->assertJsonCount(1, 'data');
        Sanctum::actingAs($other);
        $this->getJson('/api/reportes/mis')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        Sanctum::actingAs($reporter);
        $this->postJson('/api/reportes/contextual', [
            'recurso_tipo' => 'usuario',
            'recurso_id' => $reported->id,
            'motivo' => 'acoso',
        ])
            ->assertUnprocessable();
        $this->assertDatabaseCount('reportes', 1);
        $this->assertNotNull($created->json('data.id'));
    }

    public function test_moderation_suspension_can_be_appealed_and_rolled_back(): void
    {
        $admin = $this->createUser(['rol' => 'admin']);
        $affected = $this->createUser();
        $reporter = $this->createUser();
        $reportId = DB::table('reportes')->insertGetId([
            'usuario_reporta_id' => $reporter->id,
            'usuario_reportado_id' => $affected->id,
            'motivo' => 'estafa',
            'descripcion' => 'Evidencia',
            'recurso_tipo' => 'usuario',
            'recurso_id' => $affected->id,
            'estado' => 'pendiente',
            'prioridad' => 'alta',
            'fecha_reporte' => now(),
        ]);

        Sanctum::actingAs($admin);
        $this->patchJson('/api/moderacion/reportes/'.$reportId.'/asignar')->assertOk();
        $resolved = $this->patchJson('/api/moderacion/reportes/'.$reportId.'/resolver', [
            'resultado' => 'resuelto',
            'razon' => 'Existe evidencia suficiente y la sanción es proporcional.',
            'sancion' => 'suspension',
            'dias' => 7,
        ])
            ->assertOk();
        $this->assertSame('suspendido', $affected->fresh()->estado);

        Sanctum::actingAs($affected);
        $appeal = $this->postJson('/api/reportes/'.$reportId.'/apelacion', [
            'argumento' => 'La sanción debe revisarse porque existe información nueva y verificable.',
        ])
            ->assertCreated()
            ->json('data.id');

        Sanctum::actingAs($admin);
        $this->getJson('/api/moderacion/apelaciones')
            ->assertOk()
            ->assertJsonFragment(['id' => $appeal]);
        $this->patchJson('/api/moderacion/apelaciones/'.$appeal.'/resolver', [
            'resultado' => 'aceptada',
            'resolucion' => 'La revisión encontró que la sanción debe revocarse.',
        ])
            ->assertOk();

        $this->assertSame('activo', $affected->fresh()->estado);
        $this->assertDatabaseHas('sanciones_moderacion', [
            'reporte_id' => $reportId,
            'estado' => 'revocada',
        ]);
        $this->assertDatabaseHas('reportes', [
            'id' => $reportId,
            'estado' => 'descartado',
        ]);
        $this->assertDatabaseHas('auditoria_moderacion', [
            'recurso_tipo' => 'Apelacion',
            'recurso_id' => $appeal,
        ]);
    }

    public function test_antifraud_is_informative_and_product_unknown_policy_blocks_messages(): void
    {
        $admin = $this->createUser(['rol' => 'admin']);
        $seller = $this->createUser();
        $stranger = $this->createUser();
        $product = Producto::query()->create([
            'usuario_id' => $seller->id,
            'titulo' => 'Duplicado',
            'descripcion' => 'Venta',
            'precio' => 0,
            'estado' => 'nuevo',
            'estado_publicacion' => 'activo',
        ]);
        Producto::query()->create([
            'usuario_id' => $seller->id,
            'titulo' => 'Duplicado',
            'descripcion' => 'Otra entrada',
            'precio' => 1000,
            'estado' => 'nuevo',
            'estado_publicacion' => 'activo',
        ]);

        Sanctum::actingAs($admin);
        $this->postJson('/api/moderacion/productos/'.$product->id.'/antifraude')
            ->assertOk()
            ->assertJsonFragment(['regla' => 'titulo_duplicado']);
        $this->assertDatabaseHas('senales_antifraude', [
            'entidad_tipo' => 'producto',
            'entidad_id' => $product->id,
            'estado' => 'revision',
        ]);

        DB::table('preferencias_usuario')->insert([
            'usuario_id' => $seller->id,
            'version' => 1,
            'preferencias' => json_encode(['mensajeria' => ['mensajes_desconocidos' => 'nadie']]),
            'ultima_sincronizacion' => now(),
        ]);
        Sanctum::actingAs($stranger);
        $this->postJson('/api/mensajes/directo', ['usuario_id' => $seller->id])
            ->assertForbidden()
            ->assertJsonPath('code', 'MESSAGE_REQUEST_REQUIRED');
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Moderacion',
            'apellido' => 'Test',
            'username' => 'moderacion-'.$this->sequence,
            'email' => 'moderacion-'.$this->sequence.'@example.com',
            'password' => Hash::make('secret'),
            'rol' => 'usuario',
            'estado' => 'activo',
        ], $overrides));
    }
}
