<?php

namespace App\Providers;

use App\Contracts\MediaStorage;
use App\Models\Producto;
use App\Models\Publicacion;
use App\Models\PuntoFisico;
use App\Models\Usuario;
use App\Services\CloudinaryMediaStorage;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    private function hasDelegatedCapability(
        Usuario $usuario,
        string $recursoTipo,
        int $recursoId,
        string $capacidad,
    ): bool {
        return DB::table('permisos_delegados')
            ->where('usuario_id', $usuario->id)
            ->where('recurso_tipo', $recursoTipo)
            ->where('recurso_id', $recursoId)
            ->where('capacidad', $capacidad)
            ->exists();
    }

    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(MediaStorage::class, CloudinaryMediaStorage::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('account.active', fn (Usuario $usuario): bool => in_array($usuario->estado, ['activo', null], true)
        );

        Gate::define('manage.accounts', fn (Usuario $usuario): bool => in_array($usuario->estado, ['activo', null], true) && $usuario->rol === 'admin'
        );

        Gate::define('moderate', fn (Usuario $usuario): bool => in_array($usuario->estado, ['activo', null], true)
            && in_array($usuario->rol, ['owner', 'admin'], true)
        );

        Gate::define('manage.points', fn (Usuario $usuario, ?PuntoFisico $punto = null): bool => in_array($usuario->estado, ['activo', null], true)
            && (
                $usuario->rol === 'admin'
                || ($usuario->rol === 'owner' && ($punto === null || (int) $punto->owner_id === (int) $usuario->id))
                || ($punto !== null && $this->hasDelegatedCapability($usuario, 'PuntoFisico', $punto->id, 'gestionar'))
            )
        );

        Gate::define('view.product', fn (Usuario $usuario, Producto $producto): bool => in_array($usuario->estado, ['activo', null], true)
            && (
                in_array($producto->visibilidad, ['publica', null], true)
                || (int) $producto->usuario_id === (int) $usuario->id
                || $usuario->rol === 'admin'
                || $this->hasDelegatedCapability($usuario, 'Producto', $producto->id, 'leer')
            )
        );

        Gate::define('update.product', fn (Usuario $usuario, Producto $producto): bool => in_array($usuario->estado, ['activo', null], true)
            && (
                (int) $producto->usuario_id === (int) $usuario->id
                || $usuario->rol === 'admin'
                || $this->hasDelegatedCapability($usuario, 'Producto', $producto->id, 'editar')
            )
        );

        Gate::define('delete.product', fn (Usuario $usuario, Producto $producto): bool => in_array($usuario->estado, ['activo', null], true)
            && (
                (int) $producto->usuario_id === (int) $usuario->id
                || $usuario->rol === 'admin'
                || $this->hasDelegatedCapability($usuario, 'Producto', $producto->id, 'eliminar')
            )
        );

        Gate::define('view.post', fn (Usuario $usuario, Publicacion $publicacion): bool => in_array($usuario->estado, ['activo', null], true)
            && (
                in_array($publicacion->visibilidad, ['publica', null], true)
                || (int) $publicacion->usuario_id === (int) $usuario->id
                || $usuario->rol === 'admin'
                || $this->hasDelegatedCapability($usuario, 'Publicacion', $publicacion->id, 'leer')
            )
        );

        Gate::define('update.post', fn (Usuario $usuario, Publicacion $publicacion): bool => in_array($usuario->estado, ['activo', null], true)
            && (
                (int) $publicacion->usuario_id === (int) $usuario->id
                || $usuario->rol === 'admin'
                || $this->hasDelegatedCapability($usuario, 'Publicacion', $publicacion->id, 'editar')
            )
        );

        Gate::define('delete.post', fn (Usuario $usuario, Publicacion $publicacion): bool => in_array($usuario->estado, ['activo', null], true)
            && (
                (int) $publicacion->usuario_id === (int) $usuario->id
                || $usuario->rol === 'admin'
                || $this->hasDelegatedCapability($usuario, 'Publicacion', $publicacion->id, 'eliminar')
            )
        );

        VerifyEmail::createUrlUsing(function ($usuario): string {
            return URL::temporarySignedRoute(
                'auth.web.verify',
                now()->addMinutes(60),
                [
                    'id' => $usuario->getKey(),
                    'hash' => sha1($usuario->getEmailForVerification()),
                ],
            );
        });

        ResetPassword::createUrlUsing(function ($usuario, string $token): string {
            return rtrim(config('app.frontend_url'), '/')
                .'/#/reset-password?'
                .http_build_query([
                    'email' => $usuario->getEmailForPasswordReset(),
                    'token' => $token,
                ]);
        });
    }
}
