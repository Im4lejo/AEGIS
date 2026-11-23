<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureWebEmailIsVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $usuario = $request->user();
        $token = $usuario?->currentAccessToken();

        if (
            $token
            && str_starts_with($token->name, 'aegis-web')
            && !$usuario->hasVerifiedEmail()
        ) {
            return response()->json([
                'message' => 'Verifica tu correo para realizar esta acción.',
                'code' => 'EMAIL_VERIFICATION_REQUIRED',
            ], 403);
        }

        return $next($request);
    }
}
