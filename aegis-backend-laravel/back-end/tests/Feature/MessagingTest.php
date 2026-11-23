<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MessagingTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_direct_conversation_is_contextual_and_not_duplicated(): void
    {
        $buyer = $this->createUser();
        $seller = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Mensajes']);
        $product = Producto::query()->create([
            'usuario_id' => $seller->id,
            'categoria_id' => $category->id,
            'titulo' => 'Producto chat',
            'descripcion' => 'Producto',
            'precio' => 100,
            'estado_producto' => 'nuevo',
            'estado_publicacion' => 'activo',
        ]);

        Sanctum::actingAs($buyer);
        $first = $this->postJson('/api/mensajes/directo', [
            'usuario_id' => $seller->id,
            'producto_id' => $product->id,
        ])->assertCreated()->json('data');
        $second = $this->postJson('/api/mensajes/directo', [
            'usuario_id' => $seller->id,
            'producto_id' => $product->id,
        ])->assertCreated()->json('data');

        $this->assertSame($first['id'], $second['id']);
        $this->assertDatabaseCount('conversaciones', 1);
    }

    public function test_users_can_exchange_messages_and_read_pagination(): void
    {
        $buyer = $this->createUser();
        $seller = $this->createUser();
        Sanctum::actingAs($buyer);
        $conversation = $this->postJson('/api/mensajes/directo', [
            'usuario_id' => $seller->id,
        ])
            ->assertCreated()
            ->json('data');

        $this->postJson('/api/mensajes/'.$conversation['id'].'/mensajes', [
            'contenido' => 'Hola vendedor',
        ])->assertCreated();
        $this->patchJson('/api/mensajes/'.$conversation['id'].'/lectura')
            ->assertOk();

        Sanctum::actingAs($seller);
        $this->postJson('/api/mensajes/'.$conversation['id'].'/mensajes', [
            'contenido' => 'Hola comprador',
        ])
            ->assertCreated()
            ->assertJsonPath('data.contenido', 'Hola comprador');

        $this->getJson('/api/mensajes/'.$conversation['id'].'/mensajes?per_page=10')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_blocked_users_cannot_open_or_send_to_direct_chat(): void
    {
        $buyer = $this->createUser();
        $seller = $this->createUser();
        DB::table('bloqueos_usuario')->insert([
            'bloqueador_id' => $buyer->id,
            'bloqueado_id' => $seller->id,
            'tipo' => 'bloqueo',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Sanctum::actingAs($buyer);
        $this->postJson('/api/mensajes/directo', [
            'usuario_id' => $seller->id,
        ])
            ->assertForbidden()
            ->assertJsonPath('code', 'MESSAGE_BLOCKED');
    }

    public function test_group_chat_has_owner_and_other_user_cannot_read_without_participation(): void
    {
        $owner = $this->createUser();
        $member = $this->createUser();
        $outsider = $this->createUser();

        Sanctum::actingAs($owner);
        $group = $this->postJson('/api/mensajes/grupo', [
            'titulo' => 'Coordinación',
            'usuario_ids' => [$member->id],
        ])
            ->assertCreated()
            ->json('data');

        $this->postJson('/api/mensajes/'.$group['id'].'/mensajes', [
            'contenido' => 'Mensaje grupal',
        ])
            ->assertCreated();

        Sanctum::actingAs($outsider);
        $this->getJson('/api/mensajes/'.$group['id'].'/mensajes')
            ->assertForbidden();
    }

    public function test_only_author_can_delete_for_everyone_and_search_is_participant_scoped(): void
    {
        $author = $this->createUser();
        $other = $this->createUser();
        $outsider = $this->createUser();

        Sanctum::actingAs($author);
        $conversation = $this->postJson('/api/mensajes/directo', [
            'usuario_id' => $other->id,
        ])->assertCreated()->json('data');
        $message = $this->postJson('/api/mensajes/'.$conversation['id'].'/mensajes', [
            'contenido' => 'Texto único para buscar',
        ])->assertCreated()->json('data');

        $this->deleteJson('/api/mensajes/'.$conversation['id'].'/mensajes/'.$message['id'])
            ->assertOk();

        Sanctum::actingAs($outsider);
        $this->getJson('/api/mensajes/buscar?busqueda=Texto+único')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Chat',
            'apellido' => 'Test',
            'username' => 'chat-'.$this->sequence,
            'email' => 'chat-'.$this->sequence.'@example.com',
            'password' => Hash::make('secret'),
            'rol' => 'usuario',
            'estado' => 'activo',
        ], $overrides));
    }
}
