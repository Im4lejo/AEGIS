<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UsuarioAuthResource;
use App\Models\Notificacion;
use App\Models\Usuario;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class WebAuthController extends Controller
{
    private const LOGIN_NOTICE_TITLE = 'Inicio de sesión web';

    private const REGISTRATION_MESSAGE = 'Si el correo está disponible, recibirás instrucciones para verificar tu cuenta.';

    public function register(Request $request)
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:100'],
            'apellido' => ['required', 'string', 'max:100'],
            'username' => ['nullable', 'string', 'max:50', 'unique:usuarios,username'],
            'email' => ['required', 'email', 'max:150'],
            'password' => [
                'required',
                'confirmed',
                PasswordRule::min(12)->mixedCase()->numbers(),
            ],
        ]);

        $email = Str::lower($datos['email']);
        if (Usuario::query()->where('email', $email)->exists()) {
            return response()->json([
                'message' => self::REGISTRATION_MESSAGE,
            ], 202);
        }

        $usuario = Usuario::query()->create([
            'nombre' => trim($datos['nombre']),
            'apellido' => trim($datos['apellido']),
            'username' => $datos['username'] ?? null,
            'email' => $email,
            'password' => Hash::make($datos['password']),
            'rol' => 'usuario',
            'estado' => 'activo',
        ]);

        $usuario->sendEmailVerificationNotification();

        return response()->json([
            'message' => self::REGISTRATION_MESSAGE,
        ], 202);
    }

    public function login(Request $request)
    {
        $datos = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $usuario = Usuario::query()
            ->where('email', Str::lower($datos['email']))
            ->first();

        if (
            !$usuario
            || $usuario->estado !== 'activo'
            || !Hash::check($datos['password'], $usuario->password)
            || !$usuario->hasVerifiedEmail()
        ) {
            return response()->json([
                'message' => 'No fue posible iniciar sesión. Revisa tus credenciales y el acceso a tu cuenta.',
            ], 401);
        }

        $expiresAt = now()->addHours(8);
        $token = DB::transaction(function () use ($usuario, $expiresAt): string {
            $issuedToken = $usuario->createToken('aegis-web', ['*'], $expiresAt);

            Notificacion::query()->create([
                'usuario_id' => $usuario->id,
                'titulo' => self::LOGIN_NOTICE_TITLE,
                'mensaje' => 'Se inició sesión en AEGIS Web. Revoca cualquier sesión que no reconozcas desde Seguridad de cuenta.',
            ]);

            Notificacion::query()
                ->where('usuario_id', $usuario->id)
                ->where('titulo', self::LOGIN_NOTICE_TITLE)
                ->whereNotIn('id', function ($query) use ($usuario): void {
                    $query->select('id')
                        ->from('notificaciones')
                        ->where('usuario_id', $usuario->id)
                        ->where('titulo', self::LOGIN_NOTICE_TITLE)
                        ->orderByDesc('id')
                        ->limit(20);
                })
                ->delete();

            return $issuedToken->plainTextToken;
        });

        return response()->json([
            'message' => 'Inicio de sesión correcto.',
            'usuario' => new UsuarioAuthResource($usuario),
            'token' => $token,
            'expires_at' => $expiresAt->toISOString(),
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'usuario' => new UsuarioAuthResource($request->user()),
        ]);
    }

    public function logout(Request $request)
    {
        $token = $request->user()->currentAccessToken();
        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }

    public function resendVerification(Request $request)
    {
        $datos = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $usuario = Usuario::query()
            ->where('email', Str::lower($datos['email']))
            ->first();

        if ($usuario && !$usuario->hasVerifiedEmail()) {
            $usuario->sendEmailVerificationNotification();
        }

        return response()->json([
            'message' => 'Si la cuenta necesita verificación, recibirás un correo con instrucciones.',
        ], 202);
    }

    public function resendAuthenticatedVerification(Request $request)
    {
        $usuario = $request->user();
        if (!$usuario->hasVerifiedEmail()) {
            $usuario->sendEmailVerificationNotification();
        }

        return response()->json([
            'message' => 'Si la cuenta necesita verificación, recibirás un correo con instrucciones.',
        ], 202);
    }

    public function verifyEmail(Request $request, int $id, string $hash): RedirectResponse
    {
        $usuario = Usuario::query()->findOrFail($id);
        abort_unless(hash_equals(sha1($usuario->getEmailForVerification()), $hash), 403);

        if ($usuario->markEmailAsVerified()) {
            event(new Verified($usuario));
        }

        return redirect()->away(
            rtrim(config('app.frontend_url'), '/').'/#/email-verified?status=verified',
        );
    }

    public function forgotPassword(Request $request)
    {
        $datos = $request->validate([
            'email' => ['required', 'email'],
        ]);

        Password::broker('usuarios')->sendResetLink([
            'email' => Str::lower($datos['email']),
        ]);

        return response()->json([
            'message' => 'Si existe una cuenta con ese correo, recibirás instrucciones para restablecer la contraseña.',
        ], 202);
    }

    public function resetPassword(Request $request)
    {
        $datos = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => [
                'required',
                'confirmed',
                PasswordRule::min(12)->mixedCase()->numbers(),
            ],
        ]);

        $status = Password::broker('usuarios')->reset(
            [
                'email' => Str::lower($datos['email']),
                'token' => $datos['token'],
                'password' => $datos['password'],
                'password_confirmation' => $datos['password'],
            ],
            function (Usuario $usuario, string $password): void {
                $usuario->forceFill([
                    'password' => Hash::make($password),
                ])->save();
                $usuario->tokens()->delete();
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => ['El enlace no es válido o ha caducado. Solicita uno nuevo.'],
            ]);
        }

        return response()->json([
            'message' => 'Contraseña restablecida. Inicia sesión con tu nueva contraseña.',
        ]);
    }

    public function changePassword(Request $request)
    {
        $datos = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => [
                'required',
                'confirmed',
                PasswordRule::min(12)->mixedCase()->numbers(),
            ],
        ]);

        $usuario = $request->user();
        if (!Hash::check($datos['current_password'], $usuario->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['La contraseña actual no es correcta.'],
            ]);
        }

        $usuario->forceFill([
            'password' => Hash::make($datos['password']),
        ])->save();
        $usuario->tokens()->delete();

        return response()->json([
            'message' => 'Contraseña cambiada. Inicia sesión de nuevo en tus dispositivos.',
        ]);
    }

    public function sessions(Request $request)
    {
        $currentTokenId = $request->user()->currentAccessToken()?->getKey();
        $sessions = $request->user()->tokens()
            ->where(function ($query): void {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->orderByDesc('created_at')
            ->limit(50)
            ->get(['id', 'name', 'created_at', 'last_used_at', 'expires_at'])
            ->map(fn (PersonalAccessToken $token): array => [
                'id' => $token->id,
                'name' => $token->name,
                'created_at' => $token->created_at?->toISOString(),
                'last_used_at' => $token->last_used_at?->toISOString(),
                'expires_at' => $token->expires_at?->toISOString(),
                'current' => $token->id === $currentTokenId,
            ]);

        return response()->json(['data' => $sessions]);
    }

    public function revokeSession(Request $request, int $token)
    {
        $request->user()->tokens()->findOrFail($token)->delete();

        return response()->noContent();
    }

    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Todas las sesiones fueron cerradas.',
        ]);
    }

    public function securityNotices(Request $request)
    {
        $notices = Notificacion::query()
            ->where('usuario_id', $request->user()->id)
            ->where('titulo', self::LOGIN_NOTICE_TITLE)
            ->orderByDesc('fecha_creacion')
            ->limit(20)
            ->get(['id', 'titulo', 'mensaje', 'fecha_creacion'])
            ->map(fn (Notificacion $notificacion): array => [
                'id' => $notificacion->id,
                'title' => $notificacion->titulo,
                'message' => $notificacion->mensaje,
                'created_at' => $notificacion->fecha_creacion?->toISOString(),
            ]);

        return response()->json(['data' => $notices]);
    }
}
