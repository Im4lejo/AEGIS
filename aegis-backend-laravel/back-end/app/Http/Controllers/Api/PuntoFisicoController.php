<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PuntoFisico;
use Illuminate\Http\Request;

class PuntoFisicoController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $points = PuntoFisico::query()
            ->where('estado', 'activo')
            ->with('owner:id,nombre,apellido')
            ->orderBy('nombre')
            ->paginate($filters['per_page'] ?? 24);

        return response()->json([
            'data' => $points->items(),
            'meta' => [
                'current_page' => $points->currentPage(),
                'per_page' => $points->perPage(),
                'total' => $points->total(),
                'last_page' => $points->lastPage(),
            ],
        ]);
    }
}
