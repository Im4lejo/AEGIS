<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\CodigoQr;
use App\Models\Encuentro;
use App\Models\Producto;
use App\Models\PuntoFisico;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MeetingQrTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_owner_cannot_modify_foreign_point_but_admin_can_review(): void
    {
        $owner = $this->createUser(['rol' => 'owner']);
        $stranger = $this->createUser(['rol' => 'owner']);
        $admin = $this->createUser(['rol' => 'admin']);
        $point = PuntoFisico::query()->create([
            'owner_id' => $owner->id, 'nombre' => 'Punto', 'direccion' => 'Calle 1', 'ciudad' => 'Popayán',
            'estado' => 'activo', 'estado_revision' => 'aprobado',
        ]);

        Sanctum::actingAs($stranger);
        $this->patchJson('/api/puntos-fisicos/'.$point->id, ['nombre' => 'Ajeno'])
            ->assertForbidden();

        Sanctum::actingAs($admin);
        $this->patchJson('/api/puntos-fisicos/'.$point->id.'/revision', [
            'decision' => 'suspendido',
        ]);
    }

    public function test_buyer_proposes_seller_confirms_and_meeting_is_audited(): void
    {
        $buyer = $this->createUser();
        $seller = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Encuentro']);
        $product = Producto::query()->create([
            'usuario_id' => $seller->id, 'categoria_id' => $category->id, 'titulo' => 'Producto',
            'descripcion' => 'Producto', 'precio' => 100, 'estado_producto' => 'nuevo', 'estado_publicacion' => 'activo',
        ]);
        $point = PuntoFisico::query()->create([
            'owner_id' => $seller->id, 'nombre' => 'Punto seguro', 'direccion' => 'Calle 1', 'ciudad' => 'Popayán',
            'estado' => 'activo', 'estado_revision' => 'aprobado',
        ]);

        Sanctum::actingAs($buyer);
        $meeting = $this->postJson('/api/encuentros', [
            'producto_id' => $product->id, 'punto_fisico_id' => $point->id,
            'fecha_encuentro' => now()->addDay()->format('Y-m-d'), 'hora_encuentro' => '10:00', 'notas' => 'Revisar',
        ])
            ->assertCreated()->json('data');

        Sanctum::actingAs($seller);
        $this->patchJson('/api/encuentros/'.$meeting['id'], [
            'decision' => 'confirmado',
        ])
            ->assertOk()
            ->assertJsonPath('data.estado', 'confirmado');
        $this->assertDatabaseHas('historial_encuentro', [
            'encuentro_id' => $meeting['id'], 'estado_nuevo' => 'confirmado',
        ]);
    }

    public function test_qr_is_one_use_expiring_and_cannot_be_replayed(): void
    {
        $buyer = $this->createUser();
        $seller = $this->createUser();
        $point = PuntoFisico::query()->create([
            'owner_id' => $seller->id, 'nombre' => 'Punto', 'direccion' => 'Calle', 'ciudad' => 'Popayán',
            'estado' => 'activo', 'estado_revision' => 'aprobado',
        ]);
        $category = Categoria::query()->create(['nombre' => 'QR']);
        $product = Producto::query()->create([
            'usuario_id' => $seller->id, 'categoria_id' => $category->id, 'titulo' => 'Producto',
            'descripcion' => 'Producto', 'precio' => 100, 'estado_producto' => 'nuevo', 'estado_publicacion' => 'activo',
        ]);
        $meeting = Encuentro::query()->create([
            'comprador_id' => $buyer->id, 'vendedor_id' => $seller->id, 'producto_id' => $product->id,
            'punto_fisico_id' => $point->id, 'fecha_encuentro' => now()->addDay()->format('Y-m-d'),
            'hora_encuentro' => '10:00', 'estado' => 'confirmado',
        ]);

        Sanctum::actingAs($buyer);
        $qr = $this->postJson('/api/encuentros/'.$meeting->id.'/qr')
            ->assertOk()->json('data');

        Sanctum::actingAs($seller);
        $this->postJson('/api/encuentros/qr/validar', ['token' => $qr['token'], 'evidencia' => ['tipo' => 'documento_inspeccionado']])
            ->assertOk();
        $this->postJson('/api/encuentros/qr/validar', ['token' => $qr['token']])
            ->assertUnprocessable();
    }

    public function test_point_directory_and_expired_qr_are_blocked(): void
    {
        PuntoFisico::query()->create([
            'owner_id' => $this->createUser()->id, 'nombre' => 'Público', 'direccion' => 'Calle', 'ciudad' => 'Popayán',
            'estado' => 'activo', 'estado_revision' => 'aprobado',
        ]);
        $this->getJson('/api/puntos-fisicos/directorio?ciudad=Popayán')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $owner = $this->createUser();
        $buyer = $this->createUser();
        $seller = $this->createUser();
        $point = PuntoFisico::query()->create([
            'owner_id' => $owner->id, 'nombre' => 'Punto', 'direccion' => 'Calle', 'ciudad' => 'Popayán',
            'estado' => 'activo', 'estado_revision' => 'aprobado',
        ]);
        $category = Categoria::query()->create(['nombre' => 'Expirado']);
        $product = Producto::query()->create([
            'usuario_id' => $seller->id, 'categoria_id' => $category->id, 'titulo' => 'Producto',
            'descripcion' => 'Producto', 'precio' => 100, 'estado_producto' => 'nuevo', 'estado_publicacion' => 'activo',
        ]);
        $meeting = Encuentro::query()->create([
            'comprador_id' => $buyer->id, 'vendedor_id' => $seller->id, 'producto_id' => $product->id,
            'punto_fisico_id' => $point->id, 'fecha_encuentro' => now()->addDay()->format('Y-m-d'),
            'hora_encuentro' => '10:00', 'estado' => 'confirmado',
        ]);
        Sanctum::actingAs($buyer);
        $qr = $this->postJson('/api/encuentros/'.$meeting->id.'/qr')->json('data');
        CodigoQr::query()
            ->where('encuentro_id', $meeting->id)
            ->update(['expira_en' => now()->subMinute()]);
        Sanctum::actingAs($owner);
        $this->postJson('/api/encuentros/qr/validar', ['token' => $qr['token']])
            ->assertUnprocessable();
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Punto', 'apellido' => 'Test', 'username' => 'punto-'.$this->sequence,
            'email' => 'punto-'.$this->sequence.'@example.com', 'password' => Hash::make('secret'),
            'rol' => 'usuario', 'estado' => 'activo',
        ], $overrides));
    }
}
