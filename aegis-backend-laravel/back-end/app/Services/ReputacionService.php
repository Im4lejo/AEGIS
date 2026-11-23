<?php

namespace App\Services;

use App\Models\Calificacion;
use Illuminate\Support\Facades\DB;

class ReputacionService
{
    public function recalcularUsuario(int $usuarioId, string $ambito): array
    {
        $query = Calificacion::query()
            ->where('receptor_id', $usuarioId)
            ->where('ambito', $ambito)
            ->whereIn('estado', ['activa', 'editada']);
        $cantidad = (clone $query)->count();
        $promedio = $cantidad
            ? round((float) (clone $query)->avg('puntuacion'), 2)
            : 0.0;
        $distribution = [];
        for ($score = 1; $score <= 5; $score++) {
            $distribution[(string) $score] = (clone $query)
                ->where('puntuacion', $score)
                ->count();
        }

        DB::table('reputacion_agregados')->updateOrInsert(
            ['usuario_id' => $usuarioId, 'ambito' => $ambito],
            [
                'punto_fisico_id' => null,
                'cantidad' => $cantidad,
                'promedio' => $promedio,
                'distribucion' => json_encode($distribution),
                'actualizado_en' => now(),
            ],
        );

        return [
            'cantidad' => $cantidad,
            'promedio' => $promedio,
            'distribucion' => $distribution,
        ];
    }

    public function recalcularPunto(int $puntoId): array
    {
        $query = Calificacion::query()
            ->where('ambito', 'punto')
            ->where('punto_fisico_id', $puntoId)
            ->whereIn('estado', ['activa', 'editada']);
        $cantidad = (clone $query)->count();
        $promedio = $cantidad
            ? round((float) (clone $query)->avg('puntuacion'), 2)
            : 0.0;
        $distribution = [];
        for ($score = 1; $score <= 5; $score++) {
            $distribution[(string) $score] = (clone $query)
                ->where('puntuacion', $score)
                ->count();
        }

        DB::table('reputacion_agregados')->updateOrInsert(
            ['punto_fisico_id' => $puntoId, 'ambito' => 'punto'],
            [
                'usuario_id' => null,
                'cantidad' => $cantidad,
                'promedio' => $promedio,
                'distribucion' => json_encode($distribution),
                'actualizado_en' => now(),
            ],
        );

        return [
            'cantidad' => $cantidad,
            'promedio' => $promedio,
            'distribucion' => $distribution,
        ];
    }
}
