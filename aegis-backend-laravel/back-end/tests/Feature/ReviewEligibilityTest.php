<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Encuentro;
use App\Models\Producto;
use App\Models\PuntoFisico;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReviewEligibilityTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_only_completed_finalized_meeting_accepts_buyer_review(): void
    {
        $buyer = $this->createUser();
        $seller = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Reseñas']);
        $product = Producto::query()->create([
            'usuario_id' => $seller->id, 'categoria_id' => $category->id, 'titulo' => 'Producto',
            'descripcion' => 'Producto', 'precio' => 100, 'estado_producto' => 'nuevo', 'estado_publicacion' => 'activo',
        ]);
        $point = PuntoFisico::query()->create([
            'owner_id' => $seller->id, 'nombre' => 'Punto', 'direccion' => 'Calle', 'ciudad' => 'Popayán', 'estado' => 'activo',
        ]);
        $meeting = Encuentro::query()->create([
            'comprador_id' => $buyer->id, 'vendedor_id' => $seller->id, 'producto_id' => $product->id,
            'punto_fisico_id' => $point->id, 'fecha_encuentro' => now()->subDay()->format('Y-m-d'),
            'hora_encuentro' => '10:00', 'estado' => 'pendiente',
        ]);

        Sanctum::actingAs($buyer);
        $this->postJson('/api/resenas', [
            'encuentro_id' => $meeting->id, 'ambito' => 'vendedor', 'puntuacion' => 5,
        ])
            ->assertUnprocessable();

        $meeting->update(['estado' => 'finalizado', 'finalizado_en' => now()]);
        $this->postJson('/api/resenas', [
            'encuentro_id' => $meeting->id, 'ambito' => 'vendedor', 'puntuacion' => 5,
            'comentario' => 'Transacción verificada',
        ])
            ->assertCreated();
        $this->postJson('/api/resenas', [
            'encuentro_id' => $meeting->id, 'ambito' => 'vendedor', 'puntuacion' => 4,
        ])
            ->assertUnprocessable();
    }

    public function test_self_review_and_wrong_role_are_forbidden(): void
    {
        $seller = $this->createUser();
        $buyer = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Roles']);
        $product = Producto::query()->create([
            'usuario_id' => $seller->id, 'categoria_id' => $category->id, 'titulo' => 'Producto',
            'descripcion' => 'Producto', 'precio' => 100, 'estado_producto' => 'nuevo', 'estado_publicacion' => 'activo',
        ]);
        $point = PuntoFisico::query()->create([
            'owner_id' => $seller->id, 'nombre' => 'Punto', 'direccion' => 'Calle', 'ciudad' => 'Popayán', 'estado' => 'activo',
        ]);
        $meeting = Encuentro::query()->create([
            'comprador_id' => $buyer->id, 'vendedor_id' => $seller->id, 'producto_id' => $product->id,
            'punto_fisico_id' => $point->id, 'fecha_encuentro' => now()->subDay()->format('Y-m-d'),
            'hora_encuentro' => '10:00', 'estado' => 'finalizado', 'finalizado_en' => now(),
        ]);

        Sanctum::actingAs($buyer);
        $this->postJson('/api/resenas', [
            'encuentro_id' => $meeting->id, 'ambito' => 'comprador', 'puntuacion' => 5,
        ])
            ->assertUnprocessable();

        Sanctum::actingAs($seller);
        $this->postJson('/api/resenas', [
            'encuentro_id' => $meeting->id, 'ambito' => 'vendedor', 'puntuacion' => 5,
        ])
            ->assertUnprocessable();
    }

    public function test_average_and_distribution_recalculate_after_edit_and_anulation(): void
    {
        $seller = $this->createUser();
        $buyer = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Promedio']);
        $product = Producto::query()->create([
            'usuario_id' => $seller->id, 'categoria_id' => $category->id, 'titulo' => 'Producto',
            'descripcion' => 'Producto', 'precio' => 100, 'estado_producto' => 'nuevo', 'estado_publicacion' => 'activo',
        ]);
        $point = PuntoFisico::query()->create([
            'owner_id' => $seller->id, 'nombre' => 'Punto', 'direccion' => 'Calle', 'ciudad' => 'Popayán', 'estado' => 'activo',
        ]);
        $meeting = Encuentro::query()->create([
            'comprador_id' => $buyer->id, 'vendedor_id' => $seller->id, 'producto_id' => $product->id,
            'punto_fisico_id' => $point->id, 'fecha_encuentro' => now()->subDay()->format('Y-m-d'),
            'hora_encuentro' => '10:00', 'estado' => 'finalizado', 'finalizado_en' => now(),
        ]);

        Sanctum::actingAs($buyer);
        $review = $this->postJson('/api/resenas', [
            'encuentro_id' => $meeting->id, 'ambito' => 'vendedor', 'puntuacion' => 5,
        ])->assertCreated()->json('data');

        $this->getJson('/api/resenas/vendedor/'.$seller->id.'/resumen')
            ->assertOk()
            ->assertJsonPath('data.cantidad', 1)
            ->assertJsonPath('data.promedio', 5);

        $this->patchJson('/api/resenas/'.$review['id'].'/editar', [
            'puntuacion' => 3,
        ])
            ->assertOk();
        $this->getJson('/api/resenas/vendedor/'.$seller->id.'/resumen')
            ->assertOk()
            ->assertJsonPath('data.promedio', 3);
    }

    public function test_point_review_only_accepts_participants_and_dispute_is_audited(): void
    {
        $seller = $this->createUser();
        $buyer = $this->createUser();
        $third = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Punto']);
        $product = Producto::query()->create([
            'usuario_id' => $seller->id, 'categoria_id' => $category->id, 'titulo' => 'Producto',
            'descripcion' => 'Producto', 'precio' => 100, 'estado_producto' => 'nuevo', 'estado_publicacion' => 'activo',
        ]);
        $point = PuntoFisico::query()->create([
            'owner_id' => $seller->id, 'nombre' => 'Punto', 'direccion' => 'Calle', 'ciudad' => 'Popayán', 'estado' => 'activo',
        ]);
        $meeting = Encuentro::query()->create([
            'comprador_id' => $buyer->id, 'vendedor_id' => $seller->id, 'producto_id' => $product->id,
            'punto_fisico_id' => $point->id, 'fecha_encuentro' => now()->subDay()->format('Y-m-d'),
            'hora_encuentro' => '10:00', 'estado' => 'finalizado', 'finalizado_en' => now(),
        ]);

        Sanctum::actingAs($third);
        $this->postJson('/api/resenas', [
            'encuentro_id' => $meeting->id, 'ambito' => 'punto', 'puntuacion' => 5,
        ])
            ->assertForbidden();

        Sanctum::actingAs($buyer);
        $review = $this->postJson('/api/resenas', [
            'encuentro_id' => $meeting->id, 'ambito' => 'punto', 'puntuacion' => 4,
        ])->assertCreated()->json('data');

        Sanctum::actingAs($seller);
        $this->postJson('/api/resenas/'.$review['id'].'/disputa', ['motivo' => 'Información incorrecta'])
            ->assertOk();

        Sanctum::actingAs($pointOwner = $seller);
        $this->patchJson('/api/resenas/'.$review['id'].'/respuesta', ['respuesta' => 'Gracias'])
            ->assertOk();
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Resena', 'apellido' => 'Test', 'username' => 'resena-'.$this->sequence,
            'email' => 'resena-'.$this->sequence.'@example.com', 'password' => Hash::make('secret'),
            'rol' => 'usuario', 'estado' => 'activo',
        ], $overrides));
    }
}
