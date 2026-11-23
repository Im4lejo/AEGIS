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
    }

    private function demoTableCounts(): array
    {
        $tables = [
            'categorias',
            'usuarios',
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
        ];

        $counts = [];
        foreach ($tables as $table) {
            $counts[$table] = DB::table($table)->count();
        }

        return $counts;
    }
}
