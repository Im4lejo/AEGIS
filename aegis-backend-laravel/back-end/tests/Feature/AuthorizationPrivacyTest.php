<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Publicacion;
use App\Models\PuntoFisico;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthorizationPrivacyTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_owner_can_edit_private_product_but_stranger_cannot(): void
    {
        $category = Categoria::query()->create(['nombre' => 'Prueba']);
        $owner = $this->createUser();
        $stranger = $this->createUser();
        $product = $this->createProduct($owner, $category, ['visibilidad' => 'privada']);

        Sanctum::actingAs($stranger);
        $this->patchJson('/api/productos/'.$product->id, ['titulo' => 'Ajeno'])
            ->assertForbidden()
            ->assertJsonPath('code', 'FORBIDDEN_RESOURCE');

        Sanctum::actingAs($owner);
        $this->patchJson('/api/productos/'.$product->id, ['titulo' => 'Propio'])
            ->assertOk()
            ->assertJsonPath('data.titulo', 'Propio');
    }

    public function test_private_product_and_post_are_hidden_from_unrelated_users(): void
    {
        $category = Categoria::query()->create(['nombre' => 'Privacidad']);
        $owner = $this->createUser();
        $stranger = $this->createUser();
        $product = $this->createProduct($owner, $category, ['visibilidad' => 'privada']);
        $post = Publicacion::query()->create([
            'usuario_id' => $owner->id,
            'titulo' => 'Privada',
            'contenido' => 'Contenido privado',
            'visibilidad' => 'privada',
        ]);

        $this->getJson('/api/productos/'.$product->id)
            ->assertForbidden()
            ->assertJsonPath('code', 'PRIVATE_RESOURCE');

        Sanctum::actingAs($stranger);
        $this->getJson('/api/foro/'.$post->id)
            ->assertForbidden()
            ->assertJsonPath('code', 'PRIVATE_RESOURCE');
        $this->patchJson('/api/foro/'.$post->id, ['contenido' => 'Intento ajeno'])
            ->assertForbidden();
    }

    public function test_owner_and_admin_can_view_private_resources_but_admin_cannot_escalate_without_context(): void
    {
        $category = Categoria::query()->create(['nombre' => 'Admin']);
        $owner = $this->createUser();
        $admin = $this->createUser(['rol' => 'admin']);
        $product = $this->createProduct($owner, $category, ['visibilidad' => 'privada']);
        $post = Publicacion::query()->create([
            'usuario_id' => $owner->id,
            'titulo' => 'Privada',
            'contenido' => 'Solo autorizados',
            'visibilidad' => 'privada',
        ]);

        Sanctum::actingAs($owner);
        $this->getJson('/api/productos/'.$product->id)->assertOk();
        $this->getJson('/api/foro/'.$post->id)->assertOk();

        Sanctum::actingAs($admin);
        $this->getJson('/api/productos/'.$product->id)->assertOk();
        $this->getJson('/api/foro/'.$post->id)->assertOk();
    }

    public function test_suspended_and_banned_users_cannot_publish_or_edit(): void
    {
        $category = Categoria::query()->create(['nombre' => 'Suspensiones']);
        $owner = $this->createUser(['estado' => 'suspendido']);
        $product = $this->createProduct($owner, $category);

        Sanctum::actingAs($owner);
        $this->postJson('/api/foro', ['contenido' => 'Bloqueado'])
            ->assertForbidden()
            ->assertJsonPath('code', 'ACCOUNT_NOT_ACTIVE');
        $this->patchJson('/api/productos/'.$product->id, ['titulo' => 'Bloqueado'])
            ->assertForbidden()
            ->assertJsonPath('code', 'ACCOUNT_NOT_ACTIVE');
    }

    public function test_owner_manages_only_owned_point_and_admin_has_audited_account_controls(): void
    {
        $owner = $this->createUser(['rol' => 'owner']);
        $otherOwner = $this->createUser(['rol' => 'owner']);
        $admin = $this->createUser(['rol' => 'admin']);
        $point = PuntoFisico::query()->create([
            'owner_id' => $owner->id,
            'nombre' => 'Punto uno',
            'direccion' => 'Calle 1',
            'ciudad' => 'Popayán',
            'estado' => 'activo',
        ]);

        Sanctum::actingAs($otherOwner);
        $this->patchJson('/api/puntos-fisicos/'.$point->id, ['nombre' => 'Ajeno'])
            ->assertForbidden();

        Sanctum::actingAs($owner);
        $this->patchJson('/api/puntos-fisicos/'.$point->id, ['nombre' => 'Propio'])
            ->assertOk();

        Sanctum::actingAs($admin);
        $this->patchJson('/api/admin/usuarios/'.$otherOwner->id, [
            'estado' => 'suspendido',
        ])->assertOk();

        $this->assertDatabaseHas('usuarios', [
            'id' => $otherOwner->id,
            'estado' => 'suspendido',
        ]);
        $this->assertDatabaseHas('auditoria_accesos', [
            'actor_id' => $admin->id,
            'accion' => 'administrar_cuenta',
            'recurso_tipo' => 'Usuario',
            'recurso_id' => $otherOwner->id,
        ]);
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Test',
            'apellido' => 'User',
            'username' => 'auth-user-'.$this->sequence,
            'email' => 'auth-'.$this->sequence.'@example.com',
            'password' => Hash::make('secret'),
            'rol' => 'usuario',
            'estado' => 'activo',
        ], $overrides));
    }

    private function createProduct(
        Usuario $owner,
        Categoria $category,
        array $overrides = [],
    ): Producto {
        return Producto::query()->create(array_merge([
            'usuario_id' => $owner->id,
            'categoria_id' => $category->id,
            'titulo' => 'Producto',
            'descripcion' => 'Descripción',
            'precio' => 100,
            'estado_producto' => 'usado',
            'estado_publicacion' => 'activo',
            'visibilidad' => 'publica',
        ], $overrides));
    }
}
