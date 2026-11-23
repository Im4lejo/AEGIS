<?php

use App\Http\Controllers\Api\ForoController;
use App\Http\Controllers\Api\InicioController;
use App\Http\Controllers\Api\PerfilController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\PuntoFisicoController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\WebAuthController;

Route::get('/inicio', InicioController::class);
Route::get('/categorias', [ProductoController::class, 'categorias']);
Route::get('/productos', [ProductoController::class, 'index']);
Route::get('/productos/{producto}', [ProductoController::class, 'show'])->whereNumber('producto');
Route::get('/foro', [ForoController::class, 'index']);
Route::get('/perfil/{usuario}', [PerfilController::class, 'show'])->whereNumber('usuario');
Route::get('/puntos-fisicos', [PuntoFisicoController::class, 'index']);


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::prefix('auth/web')->name('auth.web.')->group(function () {
    Route::post('/register', [WebAuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('/login', [WebAuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/email/resend', [WebAuthController::class, 'resendVerification'])
        ->middleware('throttle:3,1');
    Route::get('/email/verify/{id}/{hash}', [WebAuthController::class, 'verifyEmail'])
        ->middleware(['signed', 'throttle:10,1'])
        ->whereNumber('id')
        ->name('verify');
    Route::post('/password/forgot', [WebAuthController::class, 'forgotPassword'])
        ->middleware('throttle:3,1');
    Route::post('/password/reset', [WebAuthController::class, 'resetPassword'])
        ->middleware('throttle:5,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [WebAuthController::class, 'me']);
        Route::post('/logout', [WebAuthController::class, 'logout']);
        Route::get('/sessions', [WebAuthController::class, 'sessions']);
        Route::delete('/sessions', [WebAuthController::class, 'logoutAll']);
        Route::delete('/sessions/{token}', [WebAuthController::class, 'revokeSession'])
            ->whereNumber('token');
        Route::get('/security-notices', [WebAuthController::class, 'securityNotices']);
        Route::patch('/password', [WebAuthController::class, 'changePassword'])
            ->middleware('throttle:5,1');
        Route::post('/email/verification-notification', [WebAuthController::class, 'resendAuthenticatedVerification'])
            ->middleware('throttle:3,1');
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/productos', [ProductoController::class, 'store'])->middleware('verified.web');
    Route::post('/foro', [ForoController::class, 'store'])->middleware('verified.web');
    Route::post('/foro/{publicacion}/comentarios', [ForoController::class, 'storeComment'])
        ->whereNumber('publicacion')
        ->middleware('verified.web');
    Route::post('/logout', [AuthController::class, 'logout']);
});
