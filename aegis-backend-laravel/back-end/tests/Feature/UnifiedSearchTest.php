<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Comunidad;
use App\Models\Producto;
use App\Models\Publicacion;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UnifiedSearchTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_global_search_returns_authorized_entity_tabs(): void
    {
        $user = $this->createUser(['username' => 'buscador']);
        $category = Categoria::query()->create(['nombre' => 'Búsqueda']);
        Producto::query()->create([
            'usuario_id' => $user->id, 'categoria_id' => $category->id, 'titulo' => 'Teclado mecánico',
            'descripcion' => 'RGB', 'precio' => 100, 'estado_producto' => 'nuevo', 'estado_publicacion' => 'activo',
            'visibilidad' => 'publica',
        ]);
        Publicacion::query()->create([
            'usuario_id' => $user->id, 'titulo' => 'Guía teclado', 'contenido' => 'Consejos', 'visibilidad' => 'publica',
        ]);
        Comunidad::query()->create([
            'owner_id' => $user->id, 'nombre' => 'Club Teclados', 'slug' => 'club-teclados',
            'descripcion' => 'Comunidad', 'visibilidad' => 'publica', 'estado' => 'activa',
        ]);

        $this->getJson('/api/busqueda?q=teclado&entidad=todos')
            ->assertOk()
            ->assertJsonStructure(['data' => ['productos', 'publicaciones', 'personas', 'comunidades'], 'meta']);
        $this->getJson('/api/busqueda?q=teclado&entidad=productos')
            ->assertOk()
            ->assertJsonCount(1, 'data.productos');
    }

    public function test_private_profiles_and_private_posts_are_not_searchable(): void
    {
        $private = $this->createUser(['username' => 'privado', 'perfil_privado' => true]);
        $category = Categoria::query()->create(['nombre' => 'Privado']);
        Producto::query()->create([
            'usuario_id' => $private->id, 'categoria_id' => $category->id, 'titulo' => 'Oculto público',
            'descripcion' => 'No privado', 'precio' => 100, 'estado_producto' => 'nuevo', 'estado_publicacion' => 'activo',
            'visibilidad' => 'privada',
        ]);
        Publicacion::query()->create([
            'usuario_id' => $private->id, 'titulo' => 'Post privado', 'contenido' => 'Secreto',
            'visibilidad' => 'privada',
        ]);

        $this->getJson('/api/busqueda?q=privado&entidad=todos')
            ->assertOk()
            ->assertJsonCount(0, 'data.personas');
        $this->getJson('/api/busqueda?q=Secreto&entidad=publicaciones')
            ->assertOk()
            ->assertJsonCount(0, 'data.publicaciones');
    }

    public function test_saved_search_alert_and_preference_are_owner_scoped(): void
    {
        $owner = $this->createUser();
        $stranger = $this->createUser();
        Sanctum::actingAs($owner);
        $saved = $this->postJson('/api/busqueda/guardadas', [
            'nombre' => 'Teclados baratos', 'termino' => 'teclado', 'entidad' => 'productos',
            'filtros' => ['precio_max' => 100], 'alerta_activa' => true, 'frecuencia' => 'diaria',
        ])
            ->assertCreated()
            ->json('data');

        $this->postJson('/api/busqueda/preferencia', [
            'tipo' => 'categoria', 'valor' => 'Gaming', 'accion' => 'silenciar',
        ])
            ->assertOk();

        Sanctum::actingAs($stranger);
        $this->getJson('/api/busqueda/guardadas')
            ->assertOk()
            ->assertJsonCount(0, 'data');
        $this->deleteJson('/api/busqueda/guardadas/'.$saved['id'])
            ->assertOk();
    }

    public function test_suggestions_trends_and_explanations_are_aggregated(): void
    {
        $user = $this->createUser();
        $category = Categoria::query()->create(['nombre' => 'Gaming']);
        Producto::query()->create([
            'usuario_id' => $user->id, 'categoria_id' => $category->id, 'titulo' => 'Mouse gaming',
            'descripcion' => 'Gaming', 'precio' => 100, 'estado_producto' => 'nuevo', 'estado_publicacion' => 'activo',
            'visibilidad' => 'publica',
        ]);
        DB::table('historial_busqueda')->insert([
            'usuario_id' => $user->id, 'sesion_key' => null, 'termino' => 'mouse', 'entidad' => 'todos', 'fecha' => now(),
        ]);

        $this->getJson('/api/busqueda/sugerencias?q=mouse')
            ->assertOk()
            ->assertJsonStructure(['data']);
        $this->getJson('/api/busqueda/tendencias?dias=7')
            ->assertOk()
            ->assertJsonStructure(['data', 'ventana_dias', 'nota']);
        Sanctum::actingAs($user);
        $this->getJson('/api/busqueda/recomendaciones')
            ->assertOk()
            ->assertJsonStructure(['data', 'criterio']);
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Busqueda', 'apellido' => 'Test', 'username' => 'busqueda-'.$this->sequence,
            'email' => 'busqueda-'.$this->sequence.'@example.com', 'password' => Hash::make('secret'),
            'rol' => 'usuario', 'estado' => 'activo', 'perfil_privado' => false,
        ], $overrides));
    }
}
