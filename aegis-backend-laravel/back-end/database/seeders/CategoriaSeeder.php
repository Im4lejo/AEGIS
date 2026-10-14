<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['Celulares', 'Smartphones y accesorios'],
            ['Computadores', 'Portátiles y PCs'],
            ['Componentes', 'Tarjetas gráficas, RAM, etc'],
            ['Consolas', 'PlayStation, Xbox, Nintendo'],
            ['Periféricos', 'Mouse, teclados, audífonos'],
        ] as [$nombre, $descripcion]) {
            DB::table('categorias')->updateOrInsert(
                ['nombre' => $nombre],
                ['descripcion' => $descripcion]
            );
        }
    }
}
