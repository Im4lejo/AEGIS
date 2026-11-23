<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $usuario = $request->user();

        if ($usuario && $usuario->estado !== null && $usuario->estado !== 'activo') {
            return response()->json([
                'message' => 'Tu cuenta está suspendida o prohibida. No puedes realizar esta operación.',
                'code' => 'ACCOUNT_NOT_ACTIVE',
                'estado' => $usuario->estado,
            ], 403);
        }

        return $next($request);
    }
}
