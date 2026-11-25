<?php

namespace Tests\Feature;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DemoDataSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_seeder_is_repeatable_and_keeps_existing_users(): void
    {
        DB::table('usuarios')->insert([
            'nombre' => 'Usuario existente',
            'apellido' => 'AEGIS',
            'email' => 'existing.user@example.test',
            'password' => 'not-used-in-this-test',
        ]);

        $this->seed(DatabaseSeeder::class);
        $firstCounts = $this->demoTableCounts();

        $this->seed(DatabaseSeeder::class);
        $secondCounts = $this->demoTableCounts();

        $this->assertSame($firstCounts, $secondCounts);
        $this->assertDatabaseHas('usuarios', [
            'email' => 'existing.user@example.test',
            'nombre' => 'Usuario existente',
        ]);
        $this->assertDatabaseHas('usuarios', [
            'email' => 'admin.demo@aegis.test',
            'rol' => 'admin',
        ]);
        $this->assertDatabaseHas('publicaciones_foro', [
            'titulo' => 'DEMO | ¿Qué revisar al comprar un portátil usado?',
        ]);
        $this->assertDatabaseHas('puntos_fisicos', [
            'nombre' => 'DEMO | Punto AEGIS Popayán',
        ]);
        $this->assertDatabaseHas('encuentros', [
            'estado' => 'finalizado',
        ]);
        $this->assertDatabaseHas('reportes', [
            'motivo' => 'DEMO | Reporte de prueba',
        ]);
        $this->assertComprehensiveDemoDataExists();
    }

    private function demoTableCounts(): array
    {
        $tables = [
            'categorias',
            'users',
            'usuarios',
            'usuario_password_reset_tokens',
            'productos',
            'imagenes_producto',
            'publicaciones_foro',
            'comentarios_foro',
            'imagenes_publicacion_foro',
            'puntos_fisicos',
            'encuentros',
            'codigos_qr',
            'calificaciones',
            'reportes',
            'notificaciones',
            'enlaces_perfil',
            'seguimientos',
            'bloqueos_usuario',
            'desactivaciones_usuario',
            'permisos_delegados',
            'auditoria_accesos',
            'operaciones_media',
            'reacciones_publicacion',
            'menciones_publicacion',
            'etiquetas_publicacion',
            'etiqueta_publicacion',
            'reposts',
            'colecciones_guardado',
            'guardados',
            'comunidades',
            'membresias_comunidad',
            'acciones_comunidad',
            'encuestas',
            'opciones_encuesta',
            'votos_encuesta',
            'suscripciones_hilo',
            'historial_publicacion',
            'votos_respuesta',
            'historial_producto',
            'busquedas_productos',
            'comparaciones_producto',
            'preguntas_producto',
            'tiendas',
            'miembros_tienda',
            'verificaciones_tienda',
            'inventario_producto',
            'movimientos_inventario',
            'conversaciones',
            'participantes_conversacion',
            'mensajes',
            'lecturas_mensaje',
            'adjuntos_mensaje',
            'reportes_mensaje',
            'ofertas',
            'historial_oferta',
            'reservas_producto',
            'operaciones_comerciales',
            'historial_encuentro',
            'reputacion_agregados',
            'referencias_publicacion',
            'preferencias_notificacion',
            'busquedas_guardadas',
            'preferencias_busqueda',
            'historial_busqueda',
            'preferencias_usuario',
            'historias',
            'visualizaciones_historia',
            'eventos_comunidad',
            'participaciones_evento',
            'sesiones_live',
            'sanciones_moderacion',
            'apelaciones_moderacion',
            'acciones_moderacion',
            'senales_antifraude',
            'auditoria_moderacion',
            'permisos_operacion',
            'configuracion_global',
            'avisos_sistema',
            'eventos_comerciales_usuario',
            'rollups_comerciales_usuario',
            'solicitudes_privacidad',
            'exportaciones_datos',
        ];

        $counts = [];
        foreach ($tables as $table) {
            $counts[$table] = DB::table($table)->count();
        }

        return $counts;
    }

    private function assertComprehensiveDemoDataExists(): void
    {
        foreach ($this->demoTableCounts() as $table => $count) {
            $this->assertGreaterThan(0, $count, "La tabla {$table} no recibió datos de demostración.");
        }
    }
}
