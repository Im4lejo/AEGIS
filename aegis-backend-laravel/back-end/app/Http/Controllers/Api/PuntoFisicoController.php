<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PuntoFisico;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class PuntoFisicoController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string', 'max:5000'],
            'direccion' => ['required', 'string', 'max:255'],
            'ciudad' => ['required', 'string', 'max:100'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'servicios' => ['nullable', 'array', 'max:30'],
            'reglas' => ['nullable', 'string', 'max:5000'],
            'latitud' => ['nullable', 'numeric', 'between:-90,90'],
            'longitud' => ['nullable', 'numeric', 'between:-180,180'],
        ]);
        $point = PuntoFisico::query()->create([
            ...$validated,
            'owner_id' => $request->user()->id,
            'estado' => 'pendiente',
            'estado_revision' => 'pendiente',
        ]);

        return response()->json(['data' => $point], 201);
    }

    public function review(Request $request, int $punto)
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Solo administración puede revisar.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }
        $validated = $request->validate([
            'decision' => ['required', 'in:aprobado,rechazado,suspendido'],
        ]);
        $point = PuntoFisico::query()->findOrFail($punto);
        $point->update([
            'estado_revision' => $validated['decision'],
            'estado' => $validated['decision'] === 'aprobado' ? 'activo' : 'pendiente',
        ]);

        return response()->json(['data' => $point]);
    }

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

    public function update(Request $request, int $punto)
    {
        $point = PuntoFisico::query()->findOrFail($punto);
        if (! Gate::forUser($request->user())->allows('manage.points', $point)) {
            return response()->json([
                'message' => 'No tienes permiso para gestionar este punto físico.',
                'code' => 'FORBIDDEN_RESOURCE',
            ], 403);
        }

        $validated = $request->validate([
            'nombre' => ['sometimes', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string'],
            'direccion' => ['sometimes', 'string', 'max:255'],
            'ciudad' => ['sometimes', 'string', 'max:100'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'estado' => ['sometimes', 'in:activo,pendiente,suspendido'],
        ]);
        $point->update($validated);

        DB::table('auditoria_accesos')->insert([
            'actor_id' => $request->user()->id,
            'accion' => 'actualizar',
            'recurso_tipo' => 'PuntoFisico',
            'recurso_id' => $point->id,
            'datos' => json_encode(['estado' => $point->estado]),
            'fecha' => now(),
        ]);

        return response()->json(['data' => $point->fresh()]);
    }
}
