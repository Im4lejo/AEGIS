<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class ComprehensiveDemoDataSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->isProduction()) {
            throw new RuntimeException('Los datos de demostración no se pueden cargar en producción.');
        }

        DB::transaction(function (): void {
            $users = $this->seedUsersAndProfiles();
            $marketplace = $this->seedMarketplace($users);
            $social = $this->seedSocial($users, $marketplace);
            $this->seedCommerceLifecycle($users, $marketplace);
            $this->seedMessaging($users, $marketplace);
            $this->seedPreferencesAndDiscovery($users, $marketplace, $social);
            $this->seedModerationAndAdministration($users, $marketplace);
            $this->seedPrivacyAndAnalytics($users, $marketplace);
        });
    }

    /**
     * @return array<string, int>
     */
    private function seedUsersAndProfiles(): array
    {
        $definitions = [
            'admin' => ['nombre' => 'Admin', 'apellido' => 'Demo', 'username' => 'admin_demo', 'email' => 'admin.demo@aegis.test', 'rol' => 'admin'],
            'owner' => ['nombre' => 'Olivia', 'apellido' => 'Punto', 'username' => 'olivia_demo', 'email' => 'owner.demo@aegis.test', 'rol' => 'owner'],
            'ana' => ['nombre' => 'Ana', 'apellido' => 'Vendedora', 'username' => 'ana_demo', 'email' => 'ana.demo@aegis.test', 'rol' => 'usuario'],
            'carlos' => ['nombre' => 'Carlos', 'apellido' => 'Comprador', 'username' => 'carlos_demo', 'email' => 'carlos.demo@aegis.test', 'rol' => 'usuario'],
            'laura' => ['nombre' => 'Laura', 'apellido' => 'Comunidades', 'username' => 'laura_demo', 'email' => 'laura.demo@aegis.test', 'rol' => 'usuario'],
            'mateo' => ['nombre' => 'Mateo', 'apellido' => 'Tecnología', 'username' => 'mateo_demo', 'email' => 'mateo.demo@aegis.test', 'rol' => 'usuario'],
            'sofia' => ['nombre' => 'Sofía', 'apellido' => 'Compradora', 'username' => 'sofia_demo', 'email' => 'sofia.demo@aegis.test', 'rol' => 'usuario'],
            'diego' => ['nombre' => 'Diego', 'apellido' => 'Moderador', 'username' => 'diego_demo', 'email' => 'diego.demo@aegis.test', 'rol' => 'usuario'],
            'inactive' => ['nombre' => 'Cuenta', 'apellido' => 'Suspendida', 'username' => 'inactive_demo', 'email' => 'inactive.demo@aegis.test', 'rol' => 'usuario'],
        ];

        $users = [];
        $userIndex = 0;
        foreach ($definitions as $key => $user) {
            $userIndex++;
            $email = $user['email'];
            unset($user['email']);
            $users[$key] = $this->ensure('usuarios', ['email' => $email], $user + [
                'password' => Hash::make('password'),
                'telefono' => '300'.str_pad((string) (1000000 + $userIndex), 7, '0', STR_PAD_LEFT),
                'ciudad' => 'Popayán',
                'ciudad_aprox' => 'Popayán, Cauca',
                'url_publica' => $user['username'],
                'img_background_url' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
                'foto_perfil_url' => 'https://i.pravatar.cc/240?u='.urlencode($email),
                'descripcion' => 'Perfil de demostración para recorrer AEGIS.',
                'perfil_privado' => false,
                'mostrar_seguidores' => true,
                'mostrar_presencia' => $key !== 'inactive',
                'ultima_actividad' => now()->subMinutes($userIndex * 10),
                'reputacion' => 4.85,
                'estado' => $key === 'inactive' ? 'suspendido' : 'activo',
                'email_verified_at' => now()->subDays(30),
                'fecha_registro' => now()->subDays(45),
            ]);

            $this->ensure('enlaces_perfil', ['usuario_id' => $users[$key], 'tipo' => 'web'], [
                'url' => 'https://example.test/perfiles/'.$user['username'],
                'orden' => 1,
            ]);
        }

        $this->ensure('users', ['email' => 'admin.demo@aegis.test'], [
            'name' => 'Admin Demo',
            'email_verified_at' => now()->subDays(30),
            'password' => Hash::make('password'),
            'remember_token' => null,
        ]);

        foreach ([
            ['laura', 'ana', 'aceptado'],
            ['mateo', 'ana', 'aceptado'],
            ['carlos', 'laura', 'aceptado'],
            ['sofia', 'mateo', 'pendiente'],
        ] as [$follower, $followed, $status]) {
            $this->ensure('seguimientos', [
                'seguidor_id' => $users[$follower],
                'seguido_id' => $users[$followed],
            ], [
                'relacion_key' => $users[$follower].':'.$users[$followed],
                'estado' => $status,
            ]);
        }

        $this->ensure('bloqueos_usuario', [
            'bloqueador_id' => $users['sofia'],
            'bloqueado_id' => $users['inactive'],
            'tipo' => 'silencio',
        ]);
        $this->ensure('desactivaciones_usuario', ['usuario_id' => $users['inactive']], [
            'estado' => 'desactivado',
            'programada_para' => now()->subDays(2),
            'procesada_en' => now()->subDays(1),
        ]);

        $this->ensurePivot('usuario_password_reset_tokens', [
            'email' => 'sofia.demo@aegis.test',
        ], ['token' => hash('sha256', 'demo-reset-token'), 'created_at' => now()->subHour()]);

        return $users;
    }

    /**
     * @param  array<string, int>  $users
     * @return array<string, mixed>
     */
    private function seedMarketplace(array $users): array
    {
        foreach ([
            ['Celulares', 'Smartphones, relojes y accesorios móviles', 10],
            ['Computadores', 'Portátiles, PCs y todo en uno', 20],
            ['Componentes', 'Tarjetas gráficas, memorias y almacenamiento', 30],
            ['Consolas', 'Consolas, controles y accesorios', 40],
            ['Periféricos', 'Teclados, mouse, monitores y audio', 50],
            ['Fotografía', 'Cámaras, lentes e iluminación', 60],
            ['Drones', 'Drones y accesorios para vuelo', 70],
            ['Redes', 'Routers, puntos de acceso y cableado', 80],
        ] as [$name, $description, $order]) {
            $this->ensure('categorias', ['nombre' => $name], [
                'descripcion' => $description,
                'estado' => 'activa',
                'orden' => $order,
            ]);
        }

        $categories = DB::table('categorias')->pluck('id', 'nombre');
        $stores = [];
        foreach ([
            'ana-tech' => [
                'owner' => 'ana', 'name' => 'Ana Tech Store', 'type' => 'tienda',
                'description' => 'Equipos seleccionados, probados y listos para entrega local.',
                'verification' => 'aprobada',
            ],
            'olivia-lab' => [
                'owner' => 'owner', 'name' => 'Olivia Lab', 'type' => 'establecimiento',
                'description' => 'Punto de revisión y tecnología verificada en Popayán.',
                'verification' => 'aprobada',
            ],
            'mateo-parts' => [
                'owner' => 'mateo', 'name' => 'Mateo Parts', 'type' => 'particular',
                'description' => 'Componentes y periféricos para armar tu próximo equipo.',
                'verification' => 'pendiente',
            ],
        ] as $slug => $store) {
            $stores[$slug] = $this->ensure('tiendas', ['slug' => $slug], [
                'owner_id' => $users[$store['owner']],
                'tipo' => $store['type'],
                'nombre' => 'DEMO | '.$store['name'],
                'descripcion' => $store['description'],
                'politicas' => 'Cambios y devoluciones coordinados por mensajería antes de la entrega.',
                'horario' => json_encode(['lunes_viernes' => '09:00-18:00', 'sabado' => '09:00-13:00']),
                'categorias' => json_encode(['Computadores', 'Periféricos', 'Componentes']),
                'enlaces' => json_encode(['web' => 'https://example.test/'.$slug]),
                'contacto_permitido' => 'mensajeria',
                'ciudad_aprox' => 'Popayán, Cauca',
                'logo_url' => 'https://placehold.co/240x240/13293d/ffffff?text=AEGIS',
                'portada_url' => 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80',
                'estado' => 'activa',
                'estado_verificacion' => $store['verification'],
                'verificada_en' => $store['verification'] === 'aprobada' ? now()->subDays(10) : null,
            ]);
            $this->ensure('miembros_tienda', ['tienda_id' => $stores[$slug], 'usuario_id' => $users[$store['owner']]], [
                'rol' => 'owner',
                'estado' => 'activo',
            ]);
            $this->ensure('verificaciones_tienda', [
                'tienda_id' => $stores[$slug],
                'solicitado_por' => $users[$store['owner']],
            ], [
                'revisado_por' => $store['verification'] === 'aprobada' ? $users['admin'] : null,
                'estado' => $store['verification'],
                'documentos' => json_encode(['camara_comercio.pdf', 'identificacion.pdf']),
                'nota' => 'Verificación de datos de demostración.',
                'fecha_solicitud' => now()->subDays(15),
                'fecha_revision' => $store['verification'] === 'aprobada' ? now()->subDays(10) : null,
            ]);
        }
        $this->ensure('miembros_tienda', ['tienda_id' => $stores['ana-tech'], 'usuario_id' => $users['laura']], [
            'rol' => 'gestor',
            'estado' => 'activo',
        ]);

        $definitions = [
            'laptop' => ['owner' => 'ana', 'store' => 'ana-tech', 'title' => 'DEMO | Portátil gamer AEGIS', 'category' => 'Computadores', 'price' => 3500000, 'condition' => 'usado', 'stock' => 1],
            'phone' => ['owner' => 'ana', 'store' => 'ana-tech', 'title' => 'DEMO | Smartphone AEGIS', 'category' => 'Celulares', 'price' => 1800000, 'condition' => 'reacondicionado', 'stock' => 2],
            'console' => ['owner' => 'owner', 'store' => 'olivia-lab', 'title' => 'DEMO | Consola de videojuegos', 'category' => 'Consolas', 'price' => 950000, 'condition' => 'usado', 'stock' => 0, 'status' => 'vendido'],
            'gpu' => ['owner' => 'mateo', 'store' => 'mateo-parts', 'title' => 'DEMO | Tarjeta gráfica RTX 4070', 'category' => 'Componentes', 'price' => 2450000, 'condition' => 'nuevo', 'stock' => 3],
            'keyboard' => ['owner' => 'ana', 'store' => 'ana-tech', 'title' => 'DEMO | Teclado mecánico inalámbrico', 'category' => 'Periféricos', 'price' => 320000, 'condition' => 'nuevo', 'stock' => 5],
            'monitor' => ['owner' => 'mateo', 'store' => 'mateo-parts', 'title' => 'DEMO | Monitor 27 pulgadas 144 Hz', 'category' => 'Periféricos', 'price' => 890000, 'condition' => 'usado', 'stock' => 2],
            'headphones' => ['owner' => 'laura', 'store' => null, 'title' => 'DEMO | Audífonos con cancelación de ruido', 'category' => 'Periféricos', 'price' => 480000, 'condition' => 'reacondicionado', 'stock' => 1],
            'camera' => ['owner' => 'sofia', 'store' => null, 'title' => 'DEMO | Cámara mirrorless con lente', 'category' => 'Fotografía', 'price' => 2100000, 'condition' => 'usado', 'stock' => 1],
            'router' => ['owner' => 'owner', 'store' => 'olivia-lab', 'title' => 'DEMO | Router Wi-Fi 6 empresarial', 'category' => 'Redes', 'price' => 670000, 'condition' => 'nuevo', 'stock' => 4],
            'drone' => ['owner' => 'mateo', 'store' => 'mateo-parts', 'title' => 'DEMO | Drone compacto 4K', 'category' => 'Drones', 'price' => 1600000, 'condition' => 'usado', 'stock' => 2, 'status' => 'oculto'],
        ];

        $products = [];
        foreach ($definitions as $key => $product) {
            $productIndex = array_search($key, array_keys($definitions), true);
            $storeId = $product['store'] ? $stores[$product['store']] : null;
            $products[$key] = $this->ensure('productos', [
                'usuario_id' => $users[$product['owner']],
                'titulo' => $product['title'],
            ], [
                'tienda_id' => $storeId,
                'categoria_id' => $categories[$product['category']],
                'titulo_breve' => str_replace('DEMO | ', '', $product['title']),
                'descripcion' => 'Producto demostrativo en excelente estado visual. Incluye prueba guiada y acompañamiento durante el encuentro.',
                'politicas' => 'Se permite revisión antes de pagar. No se reciben pagos fuera de la negociación registrada.',
                'precio' => $product['price'],
                'estado_producto' => $product['condition'],
                'ciudad' => 'Popayán',
                'atributos' => json_encode(['garantia' => '30 días', 'caja' => true, 'factura' => true]),
                'ciudad_aprox' => 'Popayán, Cauca',
                'entrega_aprox' => 'Disponible en 24 horas',
                'metodo_entrega' => 'Encuentro en punto físico o entrega local',
                'permite_encuentro' => true,
                'fecha_disponibilidad' => now()->addDays(1),
                'estado_publicacion' => $product['status'] ?? 'activo',
                'visibilidad' => 'publica',
                'fecha_estado' => now()->subDays(2),
                'fecha_renovacion' => now()->subDay(),
                'vistas' => 35 + ($productIndex * 97),
            ]);

            $imageUrls = [
                'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80',
            ];
            $imageUrl = $imageUrls[$productIndex % count($imageUrls)];
            $this->ensure('imagenes_producto', ['producto_id' => $products[$key], 'imagen' => $imageUrl], [
                'public_id' => 'aegis-demo-product-'.$key,
                'mime_type' => 'image/jpeg',
                'size' => 285000,
                'width' => 1200,
                'height' => 800,
                'alt_text' => str_replace('DEMO | ', '', $product['title']),
                'estado' => 'activo',
                'principal' => true,
                'orden' => 0,
            ]);
            $this->ensure('historial_producto', ['producto_id' => $products[$key], 'accion' => 'publicado'], [
                'actor_id' => $users[$product['owner']],
                'estado_anterior' => null,
                'estado_nuevo' => $product['status'] ?? 'activo',
                'datos' => json_encode(['origen' => 'seeder']),
            ]);

            $inventoryId = $this->ensure('inventario_producto', ['producto_id' => $products[$key]], [
                'tienda_id' => $storeId,
                'stock' => $product['stock'],
                'stock_reservado' => $key === 'phone' ? 1 : 0,
                'seguimiento_stock' => true,
                'actualizado_en' => now()->subHour(),
            ]);
            $this->ensure('movimientos_inventario', [
                'inventario_id' => $inventoryId,
                'motivo' => 'Carga inicial de demostración',
            ], [
                'actor_id' => $users[$product['owner']],
                'tipo' => 'entrada',
                'cantidad' => max(1, $product['stock']),
                'stock_antes' => 0,
                'stock_despues' => max(1, $product['stock']),
            ]);
        }

        $point = $this->requiredId('puntos_fisicos', ['nombre' => 'DEMO | Punto AEGIS Popayán']);
        $secondPoint = $this->ensure('puntos_fisicos', ['owner_id' => $users['owner'], 'nombre' => 'DEMO | AEGIS Centro Tecnológico'], [
            'descripcion' => 'Espacio con cabinas de prueba, Wi-Fi y acompañamiento.',
            'direccion' => 'Carrera 9 # 7-45',
            'ciudad' => 'Popayán',
            'latitud' => 2.4448143,
            'longitud' => -76.6147395,
            'telefono' => '3001112233',
            'imagen' => 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
            'servicios' => json_encode(['wifi', 'revision', 'vigilancia', 'parqueadero']),
            'reglas' => 'No manipular equipos sin autorización. Presentar el código QR al ingresar.',
            'reputacion' => 4.9,
            'estado' => 'activo',
            'estado_revision' => 'aprobado',
        ]);
        DB::table('puntos_fisicos')->where('id', $point)->update([
            'latitud' => 2.4411,
            'longitud' => -76.6062,
            'servicios' => json_encode(['wifi', 'revision', 'vigilancia']),
            'reglas' => 'Agenda tu encuentro y conserva el comprobante QR.',
            'estado_revision' => 'aprobado',
        ]);

        foreach ([
            [$users['carlos'], $products['laptop'], ['q' => 'portátil gamer', 'precio_max' => 4000000]],
            [$users['sofia'], $products['camera'], ['categoria' => 'Fotografía', 'ciudad' => 'Popayán']],
        ] as [$userId, $productId, $filters]) {
            $this->ensure('busquedas_productos', ['usuario_id' => $userId, 'sesion_key' => 'demo-'.$userId], [
                'filtros' => json_encode($filters),
                'veces' => 3,
                'ultima_busqueda' => now(),
            ]);
            $this->ensure('comparaciones_producto', ['usuario_id' => $userId, 'producto_ids' => $productId.','.$products['phone']], [
                'sesion_key' => 'demo-'.$userId,
            ]);
        }

        $question = $this->ensure('preguntas_producto', [
            'producto_id' => $products['laptop'],
            'usuario_id' => $users['carlos'],
        ], [
            'pregunta' => '¿Incluye cargador original y permite revisar la batería?',
            'respuesta' => 'Sí, incluye cargador y puedes probar los ciclos durante el encuentro.',
            'respondido_por' => $users['ana'],
            'estado' => 'respondida',
            'fecha_pregunta' => now()->subDays(2),
            'fecha_respuesta' => now()->subDay(),
        ]);

        return compact('stores', 'products', 'categories', 'point', 'secondPoint', 'question');
    }

    /**
     * @param  array<string, int>  $users
     * @param  array<string, mixed>  $marketplace
     * @return array<string, mixed>
     */
    private function seedSocial(array $users, array $marketplace): array
    {
        $products = $marketplace['products'];
        $communities = [];
        foreach ([
            'armado-pc-popayan' => ['owner' => 'mateo', 'name' => 'Armado de PC Popayán', 'category' => 'Computadores', 'visibility' => 'publica'],
            'fotografia-colombia' => ['owner' => 'sofia', 'name' => 'Fotografía Colombia', 'category' => 'Fotografía', 'visibility' => 'publica'],
            'gamers-cauca' => ['owner' => 'laura', 'name' => 'Gamers del Cauca', 'category' => 'Consolas', 'visibility' => 'invitacion'],
        ] as $slug => $community) {
            $communities[$slug] = $this->ensure('comunidades', ['slug' => $slug], [
                'owner_id' => $users[$community['owner']],
                'nombre' => 'DEMO | '.$community['name'],
                'descripcion' => 'Comunidad activa para compartir preguntas, experiencias y recomendaciones.',
                'normas' => 'Respeta a las personas, no publiques información sensible y evita contenido comercial engañoso.',
                'categoria' => $community['category'],
                'visibilidad' => $community['visibility'],
                'estado' => 'activa',
                'icono_url' => 'https://placehold.co/160x160/16324f/ffffff?text=AEGIS',
                'portada_url' => 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
                'avisos_activos' => true,
            ]);
            $this->ensure('membresias_comunidad', ['comunidad_id' => $communities[$slug], 'usuario_id' => $users[$community['owner']]], [
                'rol' => 'owner',
                'estado' => 'activo',
                'fecha_union' => now()->subDays(30),
            ]);
            $this->ensure('acciones_comunidad', [
                'comunidad_id' => $communities[$slug],
                'actor_id' => $users[$community['owner']],
                'accion' => 'comunidad_creada',
            ], ['datos' => json_encode(['origen' => 'seeder'])]);
        }
        foreach ([
            ['armado-pc-popayan', 'ana', 'moderador'],
            ['armado-pc-popayan', 'carlos', 'miembro'],
            ['fotografia-colombia', 'laura', 'miembro'],
            ['fotografia-colombia', 'carlos', 'miembro'],
            ['gamers-cauca', 'ana', 'miembro'],
        ] as $membershipIndex => [$community, $user, $role]) {
            $this->ensure('membresias_comunidad', ['comunidad_id' => $communities[$community], 'usuario_id' => $users[$user]], [
                'rol' => $role,
                'estado' => 'activo',
                'fecha_union' => now()->subDays($membershipIndex + 2),
            ]);
        }

        $posts = [];
        $postDefinitions = [
            'setup' => ['user' => 'ana', 'community' => null, 'title' => 'DEMO | ¿Qué revisar al comprar un portátil usado?', 'type' => 'pregunta'],
            'meetup' => ['user' => 'carlos', 'community' => null, 'title' => 'DEMO | Recomendaciones para un encuentro seguro', 'type' => 'discusion'],
            'build' => ['user' => 'mateo', 'community' => 'armado-pc-popayan', 'title' => 'DEMO | Guía para elegir fuente de poder', 'type' => 'tutorial'],
            'poll' => ['user' => 'laura', 'community' => 'gamers-cauca', 'title' => 'DEMO | ¿Qué consola recomiendas?', 'type' => 'encuesta'],
            'photo' => ['user' => 'sofia', 'community' => 'fotografia-colombia', 'title' => 'DEMO | Mi primer recorrido con cámara mirrorless', 'type' => 'discusion'],
            'announcement' => ['user' => 'admin', 'community' => null, 'title' => 'DEMO | Mantenimiento preventivo de este sábado', 'type' => 'anuncio'],
        ];
        foreach ($postDefinitions as $key => $post) {
            $postIndex = array_search($key, array_keys($postDefinitions), true);
            $posts[$key] = $this->ensure('publicaciones_foro', [
                'usuario_id' => $users[$post['user']],
                'titulo' => $post['title'],
            ], [
                'comunidad_id' => $post['community'] ? $communities[$post['community']] : null,
                'contenido' => 'Contenido completo de demostración para evaluar el feed, comentarios, reacciones, referencias y diseño adaptativo de AEGIS.',
                'tipo' => $post['type'],
                'interaccion_estado' => 'abierto',
                'estado' => 'publicado',
                'visibilidad' => 'publica',
                'fecha_publicacion' => now()->subDays(10 - array_search($key, array_keys($postDefinitions), true)),
                'ultima_actividad' => now()->subHours($postIndex + 1),
                'actividad_score' => 10 + ($postIndex * 25),
                'fijada' => $key === 'announcement',
                'rank_base' => $key === 'announcement' ? 100 : 5 + ($postIndex * 7),
                'etiquetas' => json_encode([$post['type'], 'aegis']),
                'menciones' => json_encode([$users['ana']]),
                'enlace_preview_url' => 'https://example.test/demo/'.$key,
                'enlace_preview_titulo' => 'Recurso de demostración AEGIS',
            ]);
        }

        DB::table('usuarios')->where('id', $users['ana'])->update(['publicacion_fijada_id' => $posts['setup']]);
        $comment = $this->ensure('comentarios_foro', [
            'publicacion_id' => $posts['setup'],
            'usuario_id' => $users['owner'],
            'comentario' => 'DEMO | Revisa salud de batería, pantalla, puertos y temperatura bajo carga.',
        ], [
            'estado' => 'activo',
            'votos_utiles' => 8,
            'es_solucion' => true,
        ]);
        $reply = $this->ensure('comentarios_foro', [
            'publicacion_id' => $posts['setup'],
            'usuario_id' => $users['ana'],
            'comentario' => 'DEMO | Gracias. Voy a llevar una prueba de rendimiento al encuentro.',
        ], [
            'comentario_padre_id' => $comment,
            'estado' => 'activo',
        ]);
        DB::table('publicaciones_foro')->where('id', $posts['setup'])->update([
            'respuesta_aceptada_id' => $comment,
            'interaccion_estado' => 'cerrado',
            'cerrado_en' => now(),
        ]);

        foreach ([['setup', 'carlos', 'me_gusta'], ['setup', 'laura', 'util'], ['build', 'ana', 'apoyo'], ['photo', 'carlos', 'me_gusta']] as [$post, $user, $type]) {
            $this->ensure('reacciones_publicacion', [
                'publicacion_id' => $posts[$post],
                'usuario_id' => $users[$user],
                'tipo' => $type,
            ]);
        }
        $this->ensure('votos_respuesta', ['comentario_id' => $comment, 'usuario_id' => $users['carlos']], ['valor' => 1]);
        $this->ensure('votos_respuesta', ['comentario_id' => $reply, 'usuario_id' => $users['owner']], ['valor' => 1]);
        $this->ensure('reposts', ['usuario_id' => $users['carlos'], 'publicacion_id' => $posts['build']], [
            'comentario' => 'Información útil antes de comprar componentes.',
        ]);
        $collection = $this->ensure('colecciones_guardado', ['usuario_id' => $users['carlos'], 'nombre' => 'Próximas compras'], ['privada' => true]);
        $this->ensure('guardados', ['usuario_id' => $users['carlos'], 'recurso_tipo' => 'producto', 'recurso_id' => $products['laptop']], [
            'coleccion_id' => $collection,
        ]);
        $this->ensure('guardados', ['usuario_id' => $users['carlos'], 'recurso_tipo' => 'publicacion', 'recurso_id' => $posts['build']], [
            'coleccion_id' => $collection,
        ]);
        $this->ensure('suscripciones_hilo', ['publicacion_id' => $posts['setup'], 'usuario_id' => $users['carlos']], ['estado' => 'activa']);
        $this->ensure('historial_publicacion', ['publicacion_id' => $posts['build'], 'editor_id' => $users['mateo'], 'titulo' => 'DEMO | Borrador de guía PSU'], [
            'contenido' => 'Versión inicial de la guía.',
            'datos' => json_encode(['cambio' => 'Mejora de contenido']),
        ]);

        $tagIds = [];
        foreach (['hardware' => 'Hardware', 'seguridad' => 'Seguridad', 'popayan' => 'Popayán'] as $slug => $name) {
            $tagIds[$slug] = $this->ensure('etiquetas_publicacion', ['slug' => $slug], ['nombre' => $name]);
        }
        foreach (['hardware', 'seguridad'] as $tag) {
            $this->ensurePivot('etiqueta_publicacion', ['publicacion_id' => $posts['setup'], 'etiqueta_id' => $tagIds[$tag]]);
        }
        $this->ensurePivot('etiqueta_publicacion', ['publicacion_id' => $posts['build'], 'etiqueta_id' => $tagIds['hardware']]);
        $this->ensure('menciones_publicacion', ['publicacion_id' => $posts['build'], 'usuario_id' => $users['ana']]);

        $poll = $this->ensure('encuestas', ['publicacion_id' => $posts['poll']], [
            'pregunta' => '¿Qué priorizas al comprar una consola?',
            'permite_multiple' => false,
            'finaliza_en' => now()->addDays(5),
        ]);
        $options = [
            $this->ensure('opciones_encuesta', ['encuesta_id' => $poll, 'texto' => 'Catálogo de juegos'], ['orden' => 1]),
            $this->ensure('opciones_encuesta', ['encuesta_id' => $poll, 'texto' => 'Rendimiento'], ['orden' => 2]),
            $this->ensure('opciones_encuesta', ['encuesta_id' => $poll, 'texto' => 'Precio'], ['orden' => 3]),
        ];
        foreach ([['ana', 1], ['carlos', 0], ['mateo', 2]] as [$user, $option]) {
            $this->ensure('votos_encuesta', ['encuesta_id' => $poll, 'usuario_id' => $users[$user], 'opcion_id' => $options[$option]]);
        }

        $this->ensure('referencias_publicacion', [
            'publicacion_id' => $posts['setup'],
            'tipo' => 'producto',
            'producto_id' => $products['laptop'],
        ], ['orden' => 1]);
        $this->ensure('referencias_publicacion', [
            'publicacion_id' => $posts['meetup'],
            'tipo' => 'punto',
            'punto_id' => $marketplace['point'],
        ], ['orden' => 1]);

        $imageUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';
        $this->ensure('imagenes_publicacion_foro', ['publicacion_id' => $posts['build'], 'public_id' => 'aegis-demo-forum-build'], [
            'imagen' => $imageUrl,
            'mime_type' => 'image/jpeg',
            'size' => 310000,
            'width' => 1200,
            'height' => 800,
            'alt_text' => 'Mesa de trabajo con componentes',
            'estado' => 'activo',
            'orden' => 0,
            'poster_url' => $imageUrl,
            'procesamiento_estado' => 'listo',
        ]);
        $this->ensure('operaciones_media', ['clave' => 'demo-media-build'], [
            'accion' => 'optimizar',
            'recurso_tipo' => 'publicacion',
            'recurso_id' => $posts['build'],
            'public_id' => 'aegis-demo-forum-build',
            'payload' => json_encode(['ancho' => 1200]),
            'estado' => 'completada',
            'intentos' => 1,
            'completado_en' => now()->subDay(),
        ]);

        $stories = [];
        foreach ([
            'ana' => ['text' => 'Recién publicado: portátil listo para prueba.', 'image' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=80', 'community' => null],
            'mateo' => ['text' => 'Armando una guía para tu próxima PC.', 'image' => 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=700&q=80', 'community' => 'armado-pc-popayan'],
            'sofia' => ['text' => 'Prueba de cámara disponible este fin de semana.', 'image' => 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=700&q=80', 'community' => null],
        ] as $user => $story) {
            $stories[$user] = $this->ensure('historias', ['usuario_id' => $users[$user], 'texto' => $story['text']], [
                'comunidad_id' => $story['community'] ? $communities[$story['community']] : null,
                'tipo_media' => 'imagen',
                'media_url' => $story['image'],
                'media_public_id' => 'aegis-demo-story-'.$user,
                'mime_type' => 'image/jpeg',
                'audiencia' => 'publica',
                'estado' => 'activa',
                'expira_en' => now()->addHours(20),
                'visualizaciones' => 12,
                'poster_url' => $story['image'],
                'procesamiento_estado' => 'listo',
            ]);
        }
        $this->ensure('visualizaciones_historia', ['historia_id' => $stories['ana'], 'usuario_id' => $users['carlos']]);

        $event = $this->ensure('eventos_comunidad', [
            'comunidad_id' => $communities['armado-pc-popayan'],
            'titulo' => 'DEMO | Taller de mantenimiento de PC',
        ], [
            'creador_id' => $users['mateo'],
            'descripcion' => 'Taller práctico para limpiar equipos, revisar temperaturas y organizar cables.',
            'lugar' => 'Punto AEGIS Popayán',
            'fecha_inicio' => now()->addDays(7)->setTime(15, 0),
            'fecha_fin' => now()->addDays(7)->setTime(17, 0),
            'cupo' => 20,
            'estado' => 'activo',
        ]);
        foreach (['carlos' => 'asistira', 'ana' => 'interesado', 'laura' => 'asistira'] as $user => $state) {
            $this->ensure('participaciones_evento', ['evento_id' => $event, 'usuario_id' => $users[$user]], [
                'estado' => $state,
                'recordatorio' => true,
                'recordar_en' => now()->addDays(6),
            ]);
        }
        $this->ensure('sesiones_live', ['usuario_id' => $users['admin'], 'proveedor' => 'demo'], [
            'estado' => 'no_disponible',
            'motivo' => 'Video en vivo deshabilitado en datos locales.',
            'finalizada_en' => now(),
        ]);

        return compact('communities', 'posts', 'comment', 'poll', 'event', 'stories');
    }

    /**
     * @param  array<string, int>  $users
     * @param  array<string, mixed>  $marketplace
     */
    private function seedCommerceLifecycle(array $users, array $marketplace): void
    {
        $products = $marketplace['products'];
        $point = $marketplace['point'];

        $conversation = $this->ensure('conversaciones', ['contexto_clave' => 'producto-'.$products['laptop'].'-comprador-'.$users['carlos']], [
            'tipo' => 'directa',
            'producto_id' => $products['laptop'],
            'estado' => 'activa',
            'ultimo_mensaje_en' => now()->subMinutes(20),
        ]);
        foreach (['carlos', 'ana'] as $participant) {
            $this->ensure('participantes_conversacion', ['conversacion_id' => $conversation, 'usuario_id' => $users[$participant]], [
                'rol' => $participant === 'ana' ? 'owner' : 'miembro',
                'estado' => 'activo',
                'recibos_opt_in' => true,
                'notificar' => true,
            ]);
        }

        $offer = $this->ensure('ofertas', [
            'producto_id' => $products['laptop'],
            'comprador_id' => $users['carlos'],
            'estado' => 'aceptada',
        ], [
            'vendedor_id' => $users['ana'],
            'conversacion_id' => $conversation,
            'monto' => 3250000,
            'expira_en' => now()->addDays(2),
            'mensaje' => 'Ofrezco entrega en punto físico con prueba del equipo.',
        ]);
        $this->ensure('historial_oferta', ['oferta_id' => $offer, 'accion' => 'oferta_aceptada'], [
            'actor_id' => $users['ana'],
            'estado_anterior' => 'pendiente',
            'estado_nuevo' => 'aceptada',
            'monto_anterior' => 3500000,
            'monto_nuevo' => 3250000,
            'nota' => 'Acuerdo de demostración.',
        ]);
        $this->ensure('reservas_producto', ['producto_id' => $products['laptop'], 'comprador_id' => $users['carlos'], 'estado' => 'activa'], [
            'oferta_id' => $offer,
            'expira_en' => now()->addDays(2),
        ]);
        $operation = $this->ensure('operaciones_comerciales', ['producto_id' => $products['laptop'], 'comprador_id' => $users['carlos']], [
            'vendedor_id' => $users['ana'],
            'oferta_id' => $offer,
            'conversacion_id' => $conversation,
            'monto_acordado' => 3250000,
            'estado' => 'acordada',
            'fecha_acuerdo' => now()->subHour(),
        ]);

        $meeting = $this->ensure('encuentros', [
            'comprador_id' => $users['carlos'],
            'vendedor_id' => $users['ana'],
            'producto_id' => $products['laptop'],
            'punto_fisico_id' => $point,
        ], [
            'operacion_id' => $operation,
            'fecha_encuentro' => now()->addDays(2)->toDateString(),
            'hora_encuentro' => '15:30:00',
            'estado' => 'confirmado',
            'expira_en' => now()->addDays(2)->addHours(2),
            'notas' => 'Llevar cargador y documento de identidad.',
            'confirmado_en' => now()->subMinutes(30),
        ]);
        DB::table('operaciones_comerciales')->where('id', $operation)->update(['encuentro_id' => $meeting]);
        $this->ensure('historial_encuentro', ['encuentro_id' => $meeting, 'accion' => 'confirmado'], [
            'actor_id' => $users['ana'],
            'estado_anterior' => 'pendiente',
            'estado_nuevo' => 'confirmado',
            'nota' => 'Encuentro confirmado por el vendedor.',
        ]);
        $this->ensure('codigos_qr', ['encuentro_id' => $meeting], [
            'codigo' => 'DEMO-QR-LAPTOP-'.$meeting,
            'token_hash' => hash('sha256', 'DEMO-QR-LAPTOP-'.$meeting),
            'estado' => 'activo',
            'expira_en' => now()->addDays(3),
            'evidencia' => json_encode(['origen' => 'seeder']),
        ]);
        $this->ensure('calificaciones', ['encuentro_id' => $meeting, 'autor_id' => $users['carlos'], 'ambito' => 'vendedor'], [
            'punto_fisico_id' => $point,
            'receptor_id' => $users['ana'],
            'puntuacion' => 5,
            'estado' => 'activa',
            'comentario' => 'Vendedora puntual y explicación clara.',
        ]);
        $this->ensure('calificaciones', ['encuentro_id' => $meeting, 'autor_id' => $users['ana'], 'ambito' => 'comprador'], [
            'punto_fisico_id' => $point,
            'receptor_id' => $users['carlos'],
            'puntuacion' => 5,
            'estado' => 'activa',
            'comentario' => 'Comprador serio y comunicación oportuna.',
            'respuesta' => 'Gracias por la coordinación.',
            'respondida_en' => now(),
        ]);
        $this->ensure('reputacion_agregados', ['usuario_id' => $users['ana'], 'ambito' => 'vendedor'], [
            'cantidad' => 18,
            'promedio' => 4.89,
            'distribucion' => json_encode(['5' => 16, '4' => 2]),
        ]);
        $this->ensure('reputacion_agregados', ['punto_fisico_id' => $point, 'ambito' => 'punto'], [
            'cantidad' => 42,
            'promedio' => 4.92,
            'distribucion' => json_encode(['5' => 39, '4' => 3]),
        ]);
    }

    /**
     * @param  array<string, int>  $users
     * @param  array<string, mixed>  $marketplace
     */
    private function seedMessaging(array $users, array $marketplace): void
    {
        $productId = $marketplace['products']['camera'];
        $conversation = $this->ensure('conversaciones', ['contexto_clave' => 'demo-camera-sofia-carlos'], [
            'tipo' => 'directa',
            'titulo' => 'Cámara mirrorless',
            'producto_id' => $productId,
            'estado' => 'activa',
            'ultimo_mensaje_en' => now()->subMinutes(5),
        ]);
        foreach (['sofia', 'carlos'] as $user) {
            $this->ensure('participantes_conversacion', ['conversacion_id' => $conversation, 'usuario_id' => $users[$user]], [
                'rol' => $user === 'sofia' ? 'owner' : 'miembro',
                'estado' => 'activo',
                'recibos_opt_in' => true,
                'notificar' => true,
            ]);
        }
        $message = $this->ensure('mensajes', [
            'conversacion_id' => $conversation,
            'autor_id' => $users['sofia'],
            'contenido' => 'DEMO | Hola, puedes revisar la cámara este sábado en AEGIS.',
        ], ['estado' => 'activo', 'fecha_envio' => now()->subMinutes(10)]);
        $reply = $this->ensure('mensajes', [
            'conversacion_id' => $conversation,
            'autor_id' => $users['carlos'],
            'contenido' => 'DEMO | Perfecto, quiero probar el enfoque y revisar el obturador.',
        ], ['respondido_a_id' => $message, 'estado' => 'activo', 'fecha_envio' => now()->subMinutes(5)]);
        $this->ensure('lecturas_mensaje', ['mensaje_id' => $message, 'usuario_id' => $users['carlos']]);
        $this->ensure('lecturas_mensaje', ['mensaje_id' => $reply, 'usuario_id' => $users['sofia']]);
        $this->ensure('adjuntos_mensaje', ['mensaje_id' => $message, 'public_id' => 'demo-camera-attachment'], [
            'url' => 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=900&q=80',
            'nombre_original' => 'camara-demo.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 240000,
        ]);
        $this->ensure('reportes_mensaje', [
            'conversacion_id' => $conversation,
            'reportante_id' => $users['carlos'],
            'motivo' => 'DEMO | Validación del flujo de reporte',
        ], [
            'mensaje_id' => $message,
            'descripcion' => 'Registro creado para probar moderación de mensajería.',
            'estado' => 'revisado',
        ]);

        $group = $this->ensure('conversaciones', ['contexto_clave' => 'demo-comunidad-grupal'], [
            'tipo' => 'grupal',
            'titulo' => 'Organización AEGIS Tech',
            'estado' => 'activa',
            'ultimo_mensaje_en' => now()->subMinutes(15),
        ]);
        foreach (['laura', 'mateo', 'ana'] as $index => $user) {
            $this->ensure('participantes_conversacion', ['conversacion_id' => $group, 'usuario_id' => $users[$user]], [
                'rol' => $index === 0 ? 'owner' : 'miembro',
                'estado' => 'activo',
                'notificar' => true,
            ]);
        }
        $this->ensure('mensajes', [
            'conversacion_id' => $group,
            'autor_id' => $users['laura'],
            'contenido' => 'DEMO | Confirmo el taller del sábado. Nos vemos en el punto físico.',
        ], ['estado' => 'activo']);
    }

    /**
     * @param  array<string, int>  $users
     * @param  array<string, mixed>  $marketplace
     * @param  array<string, mixed>  $social
     */
    private function seedPreferencesAndDiscovery(array $users, array $marketplace, array $social): void
    {
        $categories = ['social', 'marketplace', 'comunidad', 'seguridad', 'sistema'];
        foreach (array_keys($users) as $user) {
            foreach ($categories as $index => $category) {
                $this->ensure('preferencias_notificacion', ['usuario_id' => $users[$user], 'categoria' => $category], [
                    'in_app' => true,
                    'email' => $category === 'seguridad' || $index === 0,
                    'push_web' => $category === 'marketplace',
                ]);
            }
            $this->ensure('preferencias_usuario', ['usuario_id' => $users[$user]], [
                'version' => 1,
                'preferencias' => json_encode([
                    'theme' => $user === 'mateo' ? 'dark' : 'system',
                    'locale' => 'es-CO',
                    'reduceMotion' => false,
                    'privacy' => ['profile' => 'public'],
                ]),
                'ultima_sincronizacion' => now(),
            ]);
        }

        foreach ([
            ['carlos', 'Portátiles para comprar', 'portátil', 'productos', ['ciudad' => 'Popayán']],
            ['sofia', 'Cámaras mirrorless', 'mirrorless', 'productos', ['categoria' => 'Fotografía']],
        ] as [$user, $name, $term, $entity, $filters]) {
            $this->ensure('busquedas_guardadas', ['usuario_id' => $users[$user], 'nombre' => $name], [
                'termino' => $term,
                'entidad' => $entity,
                'filtros' => json_encode($filters),
                'alerta_activa' => true,
                'frecuencia' => 'semanal',
                'ultima_revision' => now()->subDay(),
            ]);
            $this->ensure('preferencias_busqueda', ['usuario_id' => $users[$user], 'tipo' => 'categoria', 'valor' => $entity], [
                'accion' => 'interes',
            ]);
            $this->ensure('historial_busqueda', ['usuario_id' => $users[$user], 'termino' => $term], [
                'sesion_key' => 'demo-search-'.$users[$user],
                'entidad' => $entity,
            ]);
        }

        foreach ([
            ['ana', 'marketplace', 'oferta_aceptada', 'Tu oferta fue aceptada', 'Revisa el encuentro programado.'],
            ['carlos', 'marketplace', 'encuentro_confirmado', 'Encuentro confirmado', 'Tienes un encuentro disponible en tu agenda.'],
            ['laura', 'comunidad', 'nuevo_evento', 'Nuevo evento de la comunidad', 'Hay un taller disponible para participar.'],
            ['mateo', 'social', 'nueva_reaccion', 'Tu publicación recibió reacciones', 'La guía está destacando en la comunidad.'],
            ['sofia', 'seguridad', 'verificacion_completada', 'Cuenta verificada', 'Tu correo fue verificado correctamente.'],
        ] as $index => [$user, $category, $type, $title, $message]) {
            $this->ensure('notificaciones', [
                'usuario_id' => $users[$user],
                'dedupe_key' => 'demo-notification-'.$index,
            ], [
                'categoria' => $category,
                'tipo' => $type,
                'actor_id' => $users['admin'],
                'objeto_tipo' => $category,
                'objeto_id' => $marketplace['products']['laptop'],
                'destino' => '/productos/detalle?id='.$marketplace['products']['laptop'],
                'titulo' => 'DEMO | '.$title,
                'mensaje' => $message,
                'leida' => $index % 2 === 0,
                'leida_en' => $index % 2 === 0 ? now()->subHour() : null,
            ]);
        }
        $socialNotice = $social['event'];
        $this->ensure('notificaciones', ['usuario_id' => $users['carlos'], 'dedupe_key' => 'demo-evento-'.$socialNotice], [
            'categoria' => 'comunidad',
            'tipo' => 'recordatorio_evento',
            'objeto_tipo' => 'evento',
            'objeto_id' => $socialNotice,
            'destino' => '/comunidades',
            'titulo' => 'DEMO | Recordatorio de taller',
            'mensaje' => 'El taller de mantenimiento inicia pronto.',
            'leida' => false,
        ]);
    }

    /**
     * @param  array<string, int>  $users
     * @param  array<string, mixed>  $marketplace
     */
    private function seedModerationAndAdministration(array $users, array $marketplace): void
    {
        $report = $this->requiredId('reportes', ['motivo' => 'DEMO | Reporte de prueba']);
        DB::table('reportes')->where('id', $report)->update([
            'recurso_tipo' => 'producto',
            'recurso_id' => $marketplace['products']['gpu'],
            'prioridad' => 'alta',
            'asignado_id' => $users['diego'],
            'evidencia' => json_encode(['capturas' => 2]),
            'asignado_en' => now()->subHours(3),
            'revision_en' => now()->subHour(),
            'fingerprint' => hash('sha256', 'demo-report-'.$report),
        ]);
        $sanction = $this->ensure('sanciones_moderacion', [
            'usuario_id' => $users['inactive'],
            'moderador_id' => $users['admin'],
            'tipo' => 'suspension_temporal',
        ], [
            'reporte_id' => $report,
            'motivo' => 'Actividad de demostración suspendida para probar los controles.',
            'inicia_en' => now()->subDays(3),
            'finaliza_en' => now()->addDays(4),
            'estado' => 'activa',
        ]);
        $this->ensure('apelaciones_moderacion', ['reporte_id' => $report, 'usuario_id' => $users['inactive']], [
            'sancion_id' => $sanction,
            'argumento' => 'Solicito revisión manual del contenido de demostración.',
            'estado' => 'pendiente',
        ]);
        $this->ensure('acciones_moderacion', ['moderador_id' => $users['admin'], 'reporte_id' => $report, 'accion' => 'asignar_revision'], [
            'usuario_afectado_id' => $users['inactive'],
            'detalle' => json_encode(['asignado_a' => $users['diego']]),
        ]);
        $this->ensure('senales_antifraude', [
            'entidad_tipo' => 'producto',
            'entidad_id' => $marketplace['products']['gpu'],
            'regla' => 'precio_desviacion',
        ], [
            'usuario_id' => $users['mateo'],
            'puntaje' => 62,
            'evidencia' => json_encode(['desviacion_porcentual' => 18]),
            'estado' => 'revision',
        ]);
        $this->ensure('auditoria_moderacion', ['hash' => hash('sha256', 'demo-moderation-audit')], [
            'actor_id' => $users['admin'],
            'accion' => 'reporte_asignado',
            'recurso_tipo' => 'reporte',
            'recurso_id' => $report,
            'detalle' => json_encode(['moderador' => $users['diego']]),
        ]);

        $this->ensure('permisos_delegados', [
            'usuario_id' => $users['diego'],
            'recurso_tipo' => 'moderacion',
            'recurso_id' => 0,
            'capacidad' => 'revisar_reportes',
        ], ['otorgado_por' => $users['admin']]);
        $this->ensure('permisos_operacion', ['usuario_id' => $users['diego'], 'capacidad' => 'moderation.manage'], [
            'alcance' => 'global',
            'otorgado_por' => $users['admin'],
        ]);
        $this->ensure('permisos_operacion', ['usuario_id' => $users['owner'], 'capacidad' => 'points.manage'], [
            'alcance' => 'ciudad:Popayán',
            'otorgado_por' => $users['admin'],
        ]);
        $this->ensure('auditoria_accesos', [
            'actor_id' => $users['admin'],
            'accion' => 'configuracion_actualizada',
            'recurso_tipo' => 'configuracion_global',
            'recurso_id' => 0,
        ], ['datos' => json_encode(['seeder' => true])]);

        foreach ([
            ['marketplace.featured_limit', '8', 'integer'],
            ['security.review_price_deviation', 'true', 'boolean'],
            ['ui.maintenance_notice', 'false', 'boolean'],
        ] as [$key, $value, $type]) {
            $this->ensure('configuracion_global', ['clave' => $key], [
                'valor' => $value,
                'tipo' => $type,
                'version' => 1,
                'actualizado_por' => $users['admin'],
            ]);
        }
        $this->ensure('avisos_sistema', ['titulo' => 'DEMO | Bienvenido al entorno de prueba'], [
            'contenido' => 'Este entorno contiene datos ficticios para evaluar todas las pantallas del aplicativo.',
            'nivel' => 'info',
            'estado' => 'publicado',
            'vigente_desde' => now()->subDay(),
            'vigente_hasta' => now()->addMonth(),
            'creado_por' => $users['admin'],
        ]);
    }

    /**
     * @param  array<string, int>  $users
     * @param  array<string, mixed>  $marketplace
     */
    private function seedPrivacyAndAnalytics(array $users, array $marketplace): void
    {
        $this->ensure('eventos_comerciales_usuario', ['fingerprint' => 'demo-view-laptop-carlos', 'tipo' => 'vista_producto'], [
            'usuario_id' => $users['carlos'],
            'producto_id' => $marketplace['products']['laptop'],
        ]);
        $this->ensure('eventos_comerciales_usuario', ['fingerprint' => 'demo-offer-laptop-carlos', 'tipo' => 'oferta'], [
            'usuario_id' => $users['carlos'],
            'producto_id' => $marketplace['products']['laptop'],
        ]);
        $this->ensure('rollups_comerciales_usuario', [
            'usuario_id' => $users['carlos'],
            'producto_id' => $marketplace['products']['laptop'],
            'fecha' => now()->toDateString(),
            'tipo' => 'vista_producto',
        ], ['cantidad' => 12]);
        $privacy = $this->ensure('solicitudes_privacidad', [
            'usuario_id' => $users['sofia'],
            'tipo' => 'exportacion',
            'motivo' => 'Solicitud de prueba para validar privacidad.',
        ], [
            'estado' => 'en_revision',
            'fecha_revision' => now()->subHour(),
            'revisada_por' => $users['admin'],
            'nota_interna' => 'Revisión de datos demostrativos.',
        ]);
        $this->ensure('exportaciones_datos', ['usuario_id' => $users['sofia'], 'hash_archivo' => hash('sha256', 'demo-export-'.$privacy)], [
            'formato' => 'json',
            'estado' => 'lista',
            'fecha_generacion' => now()->subMinutes(20),
            'expira_en' => now()->addDays(7),
            'ruta' => 'demo/sofia-export.json',
        ]);
    }

    private function requiredId(string $table, array $identity): int
    {
        $id = $this->query($table, $identity)->value('id');
        if ($id === null) {
            throw new RuntimeException("No se encontró el registro requerido en {$table}.");
        }

        return (int) $id;
    }

    private function ensure(string $table, array $identity, array $values = []): int
    {
        DB::table($table)->updateOrInsert($identity, $identity + $values);

        return $this->requiredId($table, $identity);
    }

    private function ensurePivot(string $table, array $identity, array $values = []): void
    {
        DB::table($table)->updateOrInsert($identity, $identity + $values);
    }

    private function query(string $table, array $identity)
    {
        $query = DB::table($table);
        foreach ($identity as $column => $value) {
            $value === null ? $query->whereNull($column) : $query->where($column, $value);
        }

        return $query;
    }
}
