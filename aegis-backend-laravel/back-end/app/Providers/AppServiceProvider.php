<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
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
