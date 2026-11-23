<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->isProduction()) {
            throw new RuntimeException('Los datos de demostración no se pueden cargar en producción.');
        }

        $this->call(CategoriaSeeder::class);

        $categories = DB::table('categorias')->pluck('id', 'nombre');
        $users = $this->seedUsers();

        $products = [
            'laptop' => $this->insertIfMissing(
                'productos',
                ['usuario_id' => $users['ana'], 'titulo' => 'DEMO | Portátil gamer AEGIS'],
                [
                    'categoria_id' => $this->categoryId($categories, 'Computadores'),
                    'descripcion' => 'Portátil gamer de prueba, en buen estado y listo para probar en un punto físico.',
                    'precio' => 3500000,
                    'estado_producto' => 'usado',
                    'ciudad' => 'Popayán',
                    'estado_publicacion' => 'activo',
                ]
            ),
            'phone' => $this->insertIfMissing(
                'productos',
                ['usuario_id' => $users['ana'], 'titulo' => 'DEMO | Smartphone AEGIS'],
                [
                    'categoria_id' => $this->categoryId($categories, 'Celulares'),
                    'descripcion' => 'Smartphone de prueba para recorrer el catálogo y solicitar un encuentro.',
                    'precio' => 1800000,
                    'estado_producto' => 'reacondicionado',
                    'ciudad' => 'Popayán',
                    'estado_publicacion' => 'activo',
                ]
            ),
            'console' => $this->insertIfMissing(
                'productos',
                ['usuario_id' => $users['owner'], 'titulo' => 'DEMO | Consola de videojuegos'],
                [
                    'categoria_id' => $this->categoryId($categories, 'Consolas'),
                    'descripcion' => 'Consola de prueba con publicación marcada como vendida.',
                    'precio' => 950000,
                    'estado_producto' => 'usado',
                    'ciudad' => 'Popayán',
                    'estado_publicacion' => 'vendido',
                ]
            ),
        ];

        $this->seedProductImages($products);
        $posts = $this->seedForum($users);
        $this->seedForumImages($posts);
        $pointId = $this->seedPhysicalPoint($users['owner']);
        $this->seedMeetings($users, $products, $pointId);
        $this->seedReportsAndNotifications($users);
    }

    /**
     * @return array<string, int>
     */
    private function seedUsers(): array
    {
        $definitions = [
            'admin' => [
                'nombre' => 'Admin Demo',
                'apellido' => 'AEGIS',
                'username' => 'admin_demo',
                'email' => 'admin.demo@aegis.test',
                'rol' => 'admin',
                'ciudad' => 'Popayán',
                'descripcion' => 'Cuenta de administración para pruebas locales.',
            ],
            'owner' => [
                'nombre' => 'Olivia',
                'apellido' => 'Punto',
                'username' => 'olivia_demo',
                'email' => 'owner.demo@aegis.test',
                'rol' => 'owner',
                'ciudad' => 'Popayán',
                'descripcion' => 'Propietaria del punto físico de demostración.',
            ],
            'ana' => [
                'nombre' => 'Ana',
                'apellido' => 'Vendedora',
                'username' => 'ana_demo',
                'email' => 'ana.demo@aegis.test',
                'rol' => 'usuario',
                'ciudad' => 'Popayán',
                'descripcion' => 'Vendedora de tecnología de demostración.',
            ],
            'carlos' => [
                'nombre' => 'Carlos',
                'apellido' => 'Comprador',
                'username' => 'carlos_demo',
                'email' => 'carlos.demo@aegis.test',
                'rol' => 'usuario',
                'ciudad' => 'Popayán',
                'descripcion' => 'Comprador para probar encuentros y comentarios.',
            ],
        ];

        $userIds = [];

        foreach ($definitions as $key => $user) {
            $email = $user['email'];
            unset($user['email']);

            $userIds[$key] = $this->insertIfMissing(
                'usuarios',
                ['email' => $email],
                $user + [
                    'password' => Hash::make('password'),
                    'estado' => 'activo',
                    'reputacion' => 5,
                    'foto_perfil_url' => 'https://i.pravatar.cc/160?u='.urlencode($email),
                ]
            );
        }

        return $userIds;
    }

    private function seedProductImages(array $products): void
    {
        $images = [
            [$products['laptop'], 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80'],
            [$products['phone'], 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80'],
            [$products['console'], 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=80'],
        ];

        foreach ($images as [$productId, $image]) {
            $this->insertIfMissing(
                'imagenes_producto',
                ['producto_id' => $productId, 'imagen' => $image],
                ['principal' => true]
            );
        }
    }

    /**
     * @return array<string, int>
     */
    private function seedForum(array $users): array
    {
        $posts = [
            'setup' => $this->insertIfMissing(
                'publicaciones_foro',
                ['usuario_id' => $users['ana'], 'titulo' => 'DEMO | ¿Qué revisar al comprar un portátil usado?'],
                ['contenido' => 'Estoy comparando portátiles usados. ¿Qué pruebas recomiendan hacer antes de cerrar la compra?']
            ),
            'meetup' => $this->insertIfMissing(
                'publicaciones_foro',
                ['usuario_id' => $users['carlos'], 'titulo' => 'DEMO | Recomendaciones para un encuentro seguro'],
                ['contenido' => 'Compartan sus recomendaciones para revisar un producto durante un encuentro en un punto físico.']
            ),
        ];

        $comments = [
            [$posts['setup'], $users['carlos'], 'Prueba la batería, los puertos y el estado de la pantalla.'],
            [$posts['setup'], $users['owner'], 'En el punto físico puedes revisar el equipo antes de confirmar la compra.'],
            [$posts['meetup'], $users['ana'], 'Acordar el lugar y probar el producto con tiempo ayuda mucho.'],
        ];

        foreach ($comments as [$postId, $userId, $text]) {
            $this->insertIfMissing(
                'comentarios_foro',
                ['publicacion_id' => $postId, 'usuario_id' => $userId, 'comentario' => $text],
                []
            );
        }

        return $posts;
    }

    private function seedForumImages(array $posts): void
    {
        $this->insertIfMissing(
            'imagenes_publicacion_foro',
            ['publicacion_id' => $posts['setup'], 'public_id' => 'aegis-demo-forum-setup'],
            [
                'imagen' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
                'orden' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    private function seedPhysicalPoint(int $ownerId): int
    {
        return $this->insertIfMissing(
            'puntos_fisicos',
            ['owner_id' => $ownerId, 'nombre' => 'DEMO | Punto AEGIS Popayán'],
            [
                'descripcion' => 'Punto físico de demostración para coordinar encuentros de prueba.',
                'direccion' => 'Calle 5 # 10-20',
                'ciudad' => 'Popayán',
                'telefono' => '3000000000',
                'imagen' => 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
                'reputacion' => 5,
                'estado' => 'activo',
            ]
        );
    }

    private function seedMeetings(array $users, array $products, int $pointId): void
    {
        $upcomingMeetingId = $this->insertIfMissing(
            'encuentros',
            [
                'comprador_id' => $users['carlos'],
                'vendedor_id' => $users['ana'],
                'producto_id' => $products['phone'],
                'punto_fisico_id' => $pointId,
            ],
            [
                'fecha_encuentro' => now()->addDays(3)->toDateString(),
                'hora_encuentro' => '14:00:00',
                'estado' => 'confirmado',
            ]
        );

        $finishedMeetingId = $this->insertIfMissing(
            'encuentros',
            [
                'comprador_id' => $users['carlos'],
                'vendedor_id' => $users['owner'],
                'producto_id' => $products['console'],
                'punto_fisico_id' => $pointId,
            ],
            [
                'fecha_encuentro' => now()->subDay()->toDateString(),
                'hora_encuentro' => '11:00:00',
                'estado' => 'finalizado',
            ]
        );

        foreach ([
            [$upcomingMeetingId, 'activo'],
            [$finishedMeetingId, 'usado'],
        ] as [$meetingId, $status]) {
            $this->insertIfMissing(
                'codigos_qr',
                ['encuentro_id' => $meetingId],
                ['codigo' => 'DEMO-QR-'.$meetingId, 'estado' => $status]
            );
        }

        $this->insertIfMissing(
            'calificaciones',
            ['encuentro_id' => $finishedMeetingId, 'autor_id' => $users['carlos']],
            [
                'receptor_id' => $users['owner'],
                'puntuacion' => 5,
                'comentario' => 'DEMO | Encuentro puntual y producto en buen estado.',
            ]
        );
    }

    private function seedReportsAndNotifications(array $users): void
    {
        $this->insertIfMissing(
            'reportes',
            [
                'usuario_reporta_id' => $users['carlos'],
                'usuario_reportado_id' => $users['ana'],
                'motivo' => 'DEMO | Reporte de prueba',
            ],
            [
                'descripcion' => 'Registro de demostración para probar la gestión de reportes.',
                'estado' => 'pendiente',
            ]
        );

        foreach ([
            [$users['ana'], 'DEMO | Nueva pregunta en el foro', 'Hay una respuesta en tu publicación de demostración.'],
            [$users['carlos'], 'DEMO | Encuentro confirmado', 'Tu encuentro de demostración está confirmado.'],
        ] as [$userId, $title, $message]) {
            $this->insertIfMissing(
                'notificaciones',
                ['usuario_id' => $userId, 'titulo' => $title, 'mensaje' => $message],
                ['leida' => false]
            );
        }
    }

    private function categoryId(Collection $categories, string $name): int
    {
        if (! isset($categories[$name])) {
            throw new RuntimeException("No se encontró la categoría requerida: {$name}");
        }

        return (int) $categories[$name];
    }

    private function insertIfMissing(string $table, array $identity, array $values): int
    {
        $query = DB::table($table);

        foreach ($identity as $column => $value) {
            $query->where($column, $value);
        }

        $existingId = $query->value('id');
        if ($existingId !== null) {
            return (int) $existingId;
        }

        return (int) DB::table($table)->insertGetId($identity + $values);
    }
}
