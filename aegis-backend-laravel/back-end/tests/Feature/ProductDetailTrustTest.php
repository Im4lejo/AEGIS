<?php

namespace Tests\Feature;

use App\Models\Calificacion;
use App\Models\Categoria;
use App\Models\Encuentro;
use App\Models\Producto;
use App\Models\PuntoFisico;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductDetailTrustTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_public_detail_contains_real_context_without_sensitive_fields(): void
    {
        $seller = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Detalle']);
        $product = Producto::query()->create([
            'usuario_id' => $seller->id,
            'categoria_id' => $category->id,
            'titulo' => 'Portátil',
            'descripcion' => 'Equipo probado',
            'precio' => 100,
            'estado_producto' => 'usado',
            'estado_publicacion' => 'activo',
            'ciudad_aprox' => 'Popayán',
            'politicas' => 'No devoluciones',
            'permite_encuentro' => true,
        ]);

        $this->getJson('/api/productos/'.$product->id)
            ->assertOk()
            ->assertJsonPath('data.titulo', 'Portátil')
            ->assertJsonPath('data.ciudad_aprox', 'Popayán')
            ->assertJsonPath('data.seo.robots', 'index,follow')
            ->assertJsonMissingPath('data.vendedor.email')
            ->assertJsonMissingPath('data.vendedor.telefono');
    }

    public function test_owner_can_see_draft_but_stranger_cannot(): void
    {
        $owner = $this->createUser();
        $stranger = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Borradores']);
        $draft = Producto::query()->create([
            'usuario_id' => $owner->id,
            'categoria_id' => $category->id,
            'titulo' => 'Borrador',
            'descripcion' => 'Sin publicar',
            'precio' => 100,
            'estado_producto' => 'nuevo',
            'estado_publicacion' => 'borrador',
        ]);

        $this->getJson('/api/productos/'.$draft->id)
            ->assertNotFound();

        Sanctum::actingAs($stranger);
        $this->getJson('/api/productos/'.$draft->id)
            ->assertNotFound();

        Sanctum::actingAs($owner);
        $this->getJson('/api/productos/'.$draft->id)
            ->assertOk()
            ->assertJsonPath('data.estado_publicacion', 'borrador')
            ->assertJsonPath('data.seo.robots', 'noindex,nofollow');
    }

    public function test_visitor_asks_seller_answers_and_only_answered_questions_are_public(): void
    {
        $seller = $this->createUser();
        $buyer = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Preguntas']);
        $product = Producto::query()->create([
            'usuario_id' => $seller->id,
            'categoria_id' => $category->id,
            'titulo' => 'Pregunta pública',
            'descripcion' => 'Descripción',
            'precio' => 100,
            'estado_producto' => 'usado',
            'estado_publicacion' => 'activo',
        ]);

        Sanctum::actingAs($buyer);
        $question = $this->postJson('/api/productos/'.$product->id.'/preguntas', [
            'pregunta' => '¿Incluye cargador?',
        ])
            ->assertCreated()
            ->json('data');

        $this->getJson('/api/productos/'.$product->id.'/preguntas')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        Sanctum::actingAs($seller);
        $this->patchJson('/api/productos/'.$product->id.'/preguntas/'.$question['id'].'/respuesta', [
            'respuesta' => 'Sí, incluye cargador.',
        ])
            ->assertOk();

        $this->getJson('/api/productos/'.$product->id.'/preguntas')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.respuesta', 'Sí, incluye cargador.');
    }

    public function test_stranger_cannot_answer_or_moderate_question_and_sold_product_is_not_public(): void
    {
        $seller = $this->createUser();
        $stranger = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Moderación']);
        $product = Producto::query()->create([
            'usuario_id' => $seller->id,
            'categoria_id' => $category->id,
            'titulo' => 'Vendido',
            'descripcion' => 'Descripción',
            'precio' => 100,
            'estado_producto' => 'usado',
            'estado_publicacion' => 'vendido',
        ]);

        Sanctum::actingAs($stranger);
        $this->patchJson('/api/productos/'.$product->id.'/preguntas/999/respuesta', [
            'respuesta' => 'Ajeno',
        ])
            ->assertForbidden();

        $this->getJson('/api/productos/'.$product->id)
            ->assertNotFound();
    }

    public function test_only_real_califications_are_returned_for_seller(): void
    {
        $seller = $this->createUser();
        $buyer = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Reseñas']);
        $product = Producto::query()->create([
            'usuario_id' => $seller->id,
            'categoria_id' => $category->id,
            'titulo' => 'Con reseña',
            'descripcion' => 'Descripción',
            'precio' => 100,
            'estado_producto' => 'nuevo',
            'estado_publicacion' => 'activo',
        ]);

        $point = PuntoFisico::query()->create([
            'owner_id' => $seller->id,
            'nombre' => 'Punto real',
            'direccion' => 'Calle 1',
            'ciudad' => 'Popayán',
            'estado' => 'activo',
        ]);
        // The encounter relation is required; no fabricated rating is created.
        $encounter = Encuentro::query()->create([
            'producto_id' => $product->id,
            'comprador_id' => $buyer->id,
            'vendedor_id' => $seller->id,
            'punto_fisico_id' => $point->id,
            'fecha_encuentro' => now(),
            'hora_encuentro' => '12:00',
            'estado' => 'finalizado',
        ]);
        Calificacion::query()->create([
            'encuentro_id' => $encounter->id,
            'autor_id' => $buyer->id,
            'receptor_id' => $seller->id,
            'puntuacion' => 5,
            'comentario' => 'Transacción completa',
        ]);

        $this->getJson('/api/productos/'.$product->id)
            ->assertOk()
            ->assertJsonCount(1, 'data.resenas')
            ->assertJsonPath('data.confianza.resenas_verificadas', 1)
            ->assertJsonPath('data.confianza.vendedor_verificado', false);
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Detalle',
            'apellido' => 'Test',
            'username' => 'detalle-'.$this->sequence,
            'email' => 'detalle-'.$this->sequence.'@example.com',
            'password' => Hash::make('secret'),
            'rol' => 'usuario',
            'estado' => 'activo',
        ], $overrides));
    }
}
