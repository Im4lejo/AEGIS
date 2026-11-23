<?php

use App\Http\Middleware\EnsureAccountActive;
use App\Http\Middleware\EnsureWebEmailIsVerified;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Console\Scheduling\Schedule;
use App\Jobs\ExpirarHistorias;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->redirectGuestsTo(
            fn (Request $request): ?string => $request->is('api/*')
                ? null
                : route('login'),
        );
        $middleware->alias([
            'verified.web' => EnsureWebEmailIsVerified::class,
            'account.active' => EnsureAccountActive::class,
        ]);
    })
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->job(new ExpirarHistorias())->everyFiveMinutes();
        $schedule->job(new \App\Jobs\EnviarRecordatoriosEventos())->everyFiveMinutes()->withoutOverlapping();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request, Throwable $exception): bool => $request->is('api/*')
                || $request->expectsJson(),
        );

    })->create();
