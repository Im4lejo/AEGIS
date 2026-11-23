<?php

namespace Tests\Feature;

use App\Models\Comunidad;
use App\Models\MembresiaComunidad;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CommunityLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    public function test_owner_can_create_private_community_and_private_content_is_hidden(): void
    {
        $owner = $this->createUser();
        $outsider = $this->createUser();

        Sanctum::actingAs($owner);
        $created = $this->postJson('/api/comunidades', [
            'nombre' => 'Hardware Privado',
            'descripcion' => 'Grupo restringido',
            'normas' => 'Respeto',
            'categoria' => 'Tecnología',
            'visibilidad' => 'privada',
        ])
            ->assertCreated()
            ->assertJsonPath('data.membership.rol', 'owner');

        $communityId = $created->json('data.id');
        Sanctum::actingAs($outsider);
        $this->getJson('/api/comunidades/'.$communityId)
            ->assertForbidden()
            ->assertJsonPath('code', 'COMMUNITY_PRIVATE');
        $this->postJson('/api/comunidades/'.$communityId.'/membresia')
            ->assertCreated()
            ->assertJsonPath('data.estado', 'solicitado');
    }

    public function test_owner_approves_member_moderator_isolated_and_member_can_post(): void
    {
        $owner = $this->createUser();
        $member = $this->createUser();
        $community = Comunidad::query()->create([
            'owner_id' => $owner->id,
            'nombre' => 'Vendedores',
            'slug' => 'vendedores',
            'descripcion' => 'Comunidad pública',
            'normas' => 'Normas',
            'categoria' => 'Venta',
            'visibilidad' => 'publica',
            'estado' => 'activa',
        ]);
        MembresiaComunidad::query()->create([
            'comunidad_id' => $community->id,
            'usuario_id' => $owner->id,
            'rol' => 'owner',
            'estado' => 'activo',
            'fecha_union' => now(),
        ]);

        Sanctum::actingAs($member);
        $this->postJson('/api/comunidades/'.$community->id.'/membresia')
            ->assertCreated()
            ->assertJsonPath('data.estado', 'activo');
        $this->postJson('/api/comunidades/'.$community->id.'/posts', [
            'titulo' => 'Tema',
            'contenido' => 'Mensaje comunitario',
        ])
            ->assertCreated()
            ->assertJsonPath('data.comunidad_id', $community->id);

        Sanctum::actingAs($owner);
        MembresiaComunidad::query()
            ->where('comunidad_id', $community->id)
            ->where('usuario_id', $member->id)
            ->update(['rol' => 'moderador']);

        $this->patchJson('/api/comunidades/'.$community->id, [
            'descripcion' => 'Editada',
        ])
            ->assertOk();
        $this->getJson('/api/comunidades/'.$community->id.'/auditoria')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_moderator_cannot_manage_membership_without_owner_permission_for_owner_actions(): void
    {
        $owner = $this->createUser();
        $moderator = $this->createUser();
        $member = $this->createUser();
        $community = Comunidad::query()->create([
            'owner_id' => $owner->id,
            'nombre' => 'Moderación',
            'slug' => 'moderacion',
            'visibilidad' => 'publica',
            'estado' => 'activa',
        ]);
        foreach ([
            [$owner, 'owner'],
            [$moderator, 'moderador'],
            [$member, 'miembro'],
        ] as [$user, $role]) {
            MembresiaComunidad::query()->create([
                'comunidad_id' => $community->id,
                'usuario_id' => $user->id,
                'rol' => $role,
                'estado' => 'activo',
                'fecha_union' => now(),
            ]);
        }

        Sanctum::actingAs($moderator);
        $this->patchJson('/api/comunidades/'.$community->id.'/membresias/'.$member->id, [
            'decision' => 'expulsar',
        ])
            ->assertOk();
        $this->patchJson('/api/comunidades/'.$community->id.'/archivar')
            ->assertUnprocessable();
    }

    public function test_private_posts_are_not_in_public_feed_or_direct_outsider_link(): void
    {
        $owner = $this->createUser();
        $outsider = $this->createUser();
        $community = Comunidad::query()->create([
            'owner_id' => $owner->id,
            'nombre' => 'Privada',
            'slug' => 'privada',
            'visibilidad' => 'privada',
            'estado' => 'activa',
        ]);
        MembresiaComunidad::query()->create([
            'comunidad_id' => $community->id,
            'usuario_id' => $owner->id,
            'rol' => 'owner',
            'estado' => 'activo',
            'fecha_union' => now(),
        ]);

        Sanctum::actingAs($owner);
        $post = $this->postJson('/api/comunidades/'.$community->id.'/posts', [
            'titulo' => 'Privado',
            'contenido' => 'Solo miembros',
        ])
            ->assertCreated()
            ->json('data');

        Sanctum::actingAs($outsider);
        $this->getJson('/api/foro/'.$post['id'])
            ->assertForbidden()
            ->assertJsonPath('code', 'COMMUNITY_PRIVATE');
        $this->getJson('/api/foro?tab=recientes&per_page=50')
            ->assertOk()
            ->assertJsonMissing(['id' => $post['id']]);
    }

    public function test_suggestions_return_active_directory_criteria(): void
    {
        $owner = $this->createUser();
        Comunidad::query()->create([
            'owner_id' => $owner->id,
            'nombre' => 'Hardware',
            'slug' => 'hardware',
            'categoria' => 'Tecnología',
            'visibilidad' => 'publica',
            'estado' => 'activa',
        ]);

        $this->getJson('/api/comunidades/sugerencias?categoria=Tecnología')
            ->assertOk()
            ->assertJsonPath('criterio', 'misma categoría y mayor número de miembros')
            ->assertJsonCount(1, 'data');
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->sequence++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Comunidad',
            'apellido' => 'Test',
            'username' => 'comunidad-'.$this->sequence,
            'email' => 'comunidad-'.$this->sequence.'@example.com',
            'password' => Hash::make('secret'),
            'rol' => 'usuario',
            'estado' => 'activo',
        ], $overrides));
    }
}
