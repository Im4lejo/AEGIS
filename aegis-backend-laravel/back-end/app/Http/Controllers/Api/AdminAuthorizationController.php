<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class AdminAuthorizationController extends Controller
{
    public function usuarios(Request $request)
    {
        if (! Gate::forUser($request->user())->allows('manage.accounts')) {
            return response()->json([
                'message' => 'Solo administradores pueden consultar cuentas.',
                'code' => 'FORBIDDEN_RESOURCE',
            ], 403);
        }

        return response()->json([
            'data' => Usuario::query()
                ->select(['id', 'nombre', 'apellido', 'username', 'email', 'rol', 'estado', 'fecha_registro'])
                ->orderBy('id')
                ->paginate(50),
        ]);
    }

    public function updateUsuario(Request $request, int $usuario)
    {
        $actor = $request->user();
        if (! Gate::forUser($actor)->allows('manage.accounts')) {
            return response()->json([
                'message' => 'Solo administradores pueden administrar cuentas.',
                'code' => 'FORBIDDEN_RESOURCE',
            ], 403);
        }

        $account = Usuario::query()->findOrFail($usuario);
        $validated = $request->validate([
            'rol' => ['sometimes', 'in:usuario,owner,admin'],
            'estado' => ['sometimes', 'in:activo,suspendido,baneado'],
        ]);

        if (array_key_exists('rol', $validated) || array_key_exists('estado', $validated)) {
            $account->update($validated);
            DB::table('auditoria_accesos')->insert([
                'actor_id' => $actor->id,
                'accion' => 'administrar_cuenta',
                'recurso_tipo' => 'Usuario',
                'recurso_id' => $account->id,
                'datos' => json_encode([
                    'rol' => $account->rol,
                    'estado' => $account->estado,
                ]),
                'fecha' => now(),
            ]);
        }

        if ($account->estado !== 'activo') {
            $account->tokens()->delete();
        }

        return response()->json([
            'data' => [
                'id' => $account->id,
                'nombre' => $account->nombre,
                'apellido' => $account->apellido,
                'username' => $account->username,
                'email' => $account->email,
                'rol' => $account->rol,
                'estado' => $account->estado,
            ],
        ]);
    }
}
