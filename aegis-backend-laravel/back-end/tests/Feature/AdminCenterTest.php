<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCenterTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_dashboard_requires_permission_and_owner_delegation_is_scoped(): void
    {
        $stranger = $this->createUser();
        $operator = $this->createUser(['rol' => 'owner']);
        $admin = $this->createUser(['rol' => 'admin']);

        Sanctum::actingAs($stranger);
        $this->getJson('/api/admin/dashboard?periodo=7d')
            ->assertForbidden();

        Sanctum::actingAs($operator);
        $this->getJson('/api/admin/dashboard')->assertForbidden();

        DB::table('permisos_operacion')->insert([
            'usuario_id' => $operator->id,
            'capacidad' => 'dashboard',
            'alcance' => 'global',
            'otorgado_por' => $admin->id,
            'otorgado_en' => now(),
        ]);
        $this->getJson('/api/admin/dashboard?periodo=7d')
            ->assertOk()
            ->assertJsonPath('periodo', '7d')
            ->assertJsonStructure(['desde', 'hasta', 'data']);

        Sanctum::actingAs($admin);
        $this->getJson('/api/admin/dashboard?periodo=24h')
            ->assertOk()
            ->assertJsonPath('periodo', '24h');
    }

    public function test_critical_user_change_needs_confirmation_and_is_audited(): void
    {
        $admin = $this->createUser(['rol' => 'admin']);
        $target = $this->createUser();

        Sanctum::actingAs($admin);
        $this->patchJson('/api/admin/users/'.$target->id, [
            'estado' => 'suspendido',
            'confirmacion' => 'NO',
        ])
            ->assertUnprocessable();

        $this->patchJson('/api/admin/users/'.$target->id, [
            'estado' => 'suspendido',
            'confirmacion' => 'CONFIR',
        ])
            ->assertOk()
            ->assertJsonPath('data.estado', 'suspendido');

        $this->assertDatabaseHas('auditoria_moderacion', [
            'actor_id' => $admin->id,
            'accion' => 'administrar_usuario',
            'recurso_tipo' => 'Usuario',
            'recurso_id' => $target->id,
        ]);
    }

    public function test_admin_can_delegate_and_revoke_task_capability(): void
    {
        $admin = $this->createUser(['rol' => 'admin']);
        $support = $this->createUser();

        Sanctum::actingAs($admin);
        $granted = $this->postJson('/api/admin/permisos', [
            'usuario_id' => $support->id,
            'capacidad' => 'auditoria',
            'alcance' => 'global',
        ])
            ->assertCreated();

        $permissionId = DB::table('permisos_operacion')
            ->where('usuario_id', $support->id)
            ->where('capacidad', 'auditoria')
            ->value('id');
        $this->assertNotNull($permissionId);

        Sanctum::actingAs($support);
        $this->getJson('/api/admin/auditoria')->assertOk();
        $this->getJson('/api/admin/dashboard')->assertForbidden();

        Sanctum::actingAs($admin);
        $this->deleteJson('/api/admin/permisos/'.$permissionId)
            ->assertOk();
        Sanctum::actingAs($support);
        $this->getJson('/api/admin/auditoria')->assertForbidden();
    }

    public function test_category_config_notices_and_audit_exports_are_role_scoped(): void
    {
        $admin = $this->createUser(['rol' => 'admin']);
        $stranger = $this->createUser();

        Sanctum::actingAs($stranger);
        $this->postJson('/api/admin/categorias', [
            'nombre' => 'Ciberseguridad',
            'estado' => 'activa',
        ])
            ->assertForbidden();

        Sanctum::actingAs($admin);
        $category = $this->postJson('/api/admin/categorias', [
            'nombre' => 'Ciberseguridad',
            'descripcion' => 'Equipos y servicios',
            'estado' => 'activa',
            'orden' => 1,
        ])
            ->assertCreated()
            ->json('data');

        $this->patchJson('/api/admin/categorias/'.$category['id'], [
            'estado' => 'inactiva',
        ])
            ->assertOk();

        $this->postJson('/api/admin/avisos', [
            'titulo' => 'Mantenimiento',
            'contenido' => 'Habrá mantenimiento planificado durante la noche.',
            'nivel' => 'advertencia',
            'estado' => 'publicado',
        ])
            ->assertCreated();

        $config = $this->putJson('/api/admin/configuracion', [
            'clave' => 'marketplace.limit_products',
            'valor' => '50',
            'tipo' => 'integer',
            'version' => 1,
        ])
            ->assertOk()
            ->json('data');
        $this->putJson('/api/admin/configuracion', [
            'clave' => 'marketplace.limit_products',
            'valor' => '100',
            'tipo' => 'integer',
            'version' => $config['version'],
        ])
            ->assertOk();

        $this->getJson('/api/admin/auditoria')
            ->assertOk();
        $this->get('/api/admin/auditoria/exportar')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;
        return Usuario::query()->create(array_merge([
            'nombre' => 'Centro',
            'apellido' => 'Admin',
            'username' => 'centro-'.$this->sequence,
            'email' => 'centro-'.$this->sequence.'@example.com',
            'password' => Hash::make('secret'),
            'rol' => 'usuario',
            'estado' => 'activo',
        ], $overrides));
    }
}
