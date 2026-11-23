<?php

use App\Http\Controllers\Api\AdminAuthorizationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ComunidadController;
use App\Http\Controllers\Api\ForoController;
use App\Http\Controllers\Api\GuardadosController;
use App\Http\Controllers\Api\InicioController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\PerfilController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\PuntoFisicoController;
use App\Http\Controllers\Api\TiendaController;
use App\Http\Controllers\Api\WebAuthController;
use Illuminate\Support\Facades\Route;

Route::get('/inicio', InicioController::class);
Route::get('/categorias', [ProductoController::class, 'categorias']);
Route::get('/productos', [ProductoController::class, 'index']);
Route::get('/productos/comparar', [ProductoController::class, 'compare']);
Route::get('/productos/{producto}/similares', [ProductoController::class, 'similar'])->whereNumber('producto');
Route::get('/productos/{producto}', [ProductoController::class, 'show'])->whereNumber('producto');
Route::get('/productos/{producto}/preguntas', [ProductoController::class, 'questions'])->whereNumber('producto');
Route::get('/foro', [ForoController::class, 'index']);
Route::get('/foro/{publicacion}', [ForoController::class, 'show'])->whereNumber('publicacion');
Route::get('/foro/{publicacion}/comentarios', [ForoController::class, 'comments'])->whereNumber('publicacion');
Route::get('/perfil/{usuario}', [PerfilController::class, 'show'])->whereNumber('usuario');
Route::get('/perfil/{usuario}/tabs/{tab}', [PerfilController::class, 'tab'])
    ->whereNumber('usuario');
Route::get('/perfil/{usuario}/seguidores', [PerfilController::class, 'followers'])->whereNumber('usuario');
Route::get('/perfil/{usuario}/siguiendo', [PerfilController::class, 'following'])->whereNumber('usuario');
Route::get('/puntos-fisicos', [PuntoFisicoController::class, 'index']);
Route::get('/tiendas', [TiendaController::class, 'index']);
Route::get('/tiendas/{tienda}', [TiendaController::class, 'show'])->whereNumber('tienda');
Route::get('/comunidades', [ComunidadController::class, 'index']);
Route::get('/comunidades/sugerencias', [ComunidadController::class, 'suggestions']);
Route::get('/comunidades/{comunidad}', [ComunidadController::class, 'show'])->whereNumber('comunidad');
Route::get('/comunidades/{comunidad}/posts', [ComunidadController::class, 'posts'])->whereNumber('comunidad');
Route::get('/comunidades/{comunidad}/miembros', [ComunidadController::class, 'members'])->whereNumber('comunidad');

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
    Route::post('/tiendas', [TiendaController::class, 'store']);
    Route::patch('/tiendas/{tienda}', [TiendaController::class, 'update'])->whereNumber('tienda');
    Route::post('/tiendas/{tienda}/verificacion', [TiendaController::class, 'requestVerification'])->whereNumber('tienda');
    Route::patch('/tiendas/{tienda}/verificacion', [TiendaController::class, 'reviewVerification'])->whereNumber('tienda');
    Route::get('/tiendas/{tienda}/inventario', [TiendaController::class, 'inventory'])->whereNumber('tienda');
    Route::patch('/tiendas/{tienda}/inventario/{producto}', [TiendaController::class, 'adjustInventory'])
        ->whereNumber('tienda')
        ->whereNumber('producto');
    Route::get('/tiendas/{tienda}/dashboard', [TiendaController::class, 'dashboard'])->whereNumber('tienda');
    Route::get('/productos/mis', [ProductoController::class, 'mine']);
    Route::get('/productos/mis/estadisticas', [ProductoController::class, 'stats']);
    Route::middleware(['account.active', 'verified.web'])->group(function () {
        Route::post('/productos', [ProductoController::class, 'store']);
        Route::patch('/productos/{producto}', [ProductoController::class, 'update'])->whereNumber('producto');
        Route::delete('/productos/{producto}', [ProductoController::class, 'destroy'])->whereNumber('producto');
        Route::patch('/productos/{producto}/estado', [ProductoController::class, 'transition'])->whereNumber('producto');
        Route::post('/productos/{producto}/renovar', [ProductoController::class, 'renew'])->whereNumber('producto');
        Route::post('/productos/{producto}/preguntas', [ProductoController::class, 'ask'])->whereNumber('producto');
        Route::patch('/productos/{producto}/preguntas/{pregunta}/respuesta', [ProductoController::class, 'answerQuestion'])
            ->whereNumber('producto')
            ->whereNumber('pregunta');
        Route::patch('/productos/{producto}/preguntas/{pregunta}/moderacion', [ProductoController::class, 'moderateQuestion'])
            ->whereNumber('producto')
            ->whereNumber('pregunta');
        Route::post('/productos/{producto}/imagenes', [MediaController::class, 'storeProducto'])->whereNumber('producto');
        Route::delete('/productos/{producto}/imagenes/{imagen}', [MediaController::class, 'destroyProducto'])->whereNumber('producto')->whereNumber('imagen');
        Route::patch('/productos/{producto}/imagenes/orden', [MediaController::class, 'reorderProducto'])->whereNumber('producto');
        Route::post('/perfil/media/avatar', [MediaController::class, 'replaceAvatar']);
        Route::post('/perfil/media/portada', [MediaController::class, 'replaceCover']);
        Route::get('/perfil/me', [PerfilController::class, 'own']);
        Route::patch('/perfil/me', [PerfilController::class, 'updateOwn']);
        Route::post('/perfil/{usuario}/seguir', [PerfilController::class, 'follow'])->whereNumber('usuario');
        Route::delete('/perfil/{usuario}/seguir', [PerfilController::class, 'unfollow'])->whereNumber('usuario');
        Route::post('/perfil/{usuario}/restriccion', [PerfilController::class, 'restrict'])->whereNumber('usuario');
        Route::delete('/perfil/{usuario}/restriccion', [PerfilController::class, 'unrestrict'])->whereNumber('usuario');
        Route::post('/perfil/me/desactivar', [PerfilController::class, 'deactivate']);
        Route::post('/comunidades', [ComunidadController::class, 'store']);
        Route::patch('/comunidades/{comunidad}', [ComunidadController::class, 'update'])->whereNumber('comunidad');
        Route::patch('/comunidades/{comunidad}/archivar', [ComunidadController::class, 'archive'])->whereNumber('comunidad');
        Route::post('/comunidades/{comunidad}/membresia', [ComunidadController::class, 'membershipAction'])->whereNumber('comunidad');
        Route::delete('/comunidades/{comunidad}/membresia', [ComunidadController::class, 'leave'])->whereNumber('comunidad');
        Route::get('/comunidades/{comunidad}/solicitudes', [ComunidadController::class, 'pending'])->whereNumber('comunidad');
        Route::patch('/comunidades/{comunidad}/membresias/{usuario}', [ComunidadController::class, 'decideMembership'])
            ->whereNumber('comunidad')
            ->whereNumber('usuario');
        Route::post('/comunidades/{comunidad}/invitar', [ComunidadController::class, 'invite'])->whereNumber('comunidad');
        Route::post('/comunidades/{comunidad}/posts', [ComunidadController::class, 'storePost'])->whereNumber('comunidad');
        Route::get('/comunidades/{comunidad}/auditoria', [ComunidadController::class, 'auditLog'])->whereNumber('comunidad');
        Route::post('/foro', [ForoController::class, 'store']);
        Route::patch('/foro/{publicacion}', [ForoController::class, 'update'])->whereNumber('publicacion');
        Route::delete('/foro/{publicacion}', [ForoController::class, 'destroy'])->whereNumber('publicacion');
        Route::patch('/foro/{publicacion}/archivar', [ForoController::class, 'archive'])->whereNumber('publicacion');
        Route::post('/foro/{publicacion}/reacciones', [ForoController::class, 'react'])->whereNumber('publicacion');
        Route::delete('/foro/{publicacion}/reacciones', [ForoController::class, 'unreact'])->whereNumber('publicacion');
        Route::patch('/foro/{publicacion}/comentarios/{comentario}', [ForoController::class, 'updateComment'])
            ->whereNumber('publicacion')
            ->whereNumber('comentario');
        Route::delete('/foro/{publicacion}/comentarios/{comentario}', [ForoController::class, 'destroyComment'])
            ->whereNumber('publicacion')
            ->whereNumber('comentario');
        Route::post('/foro/{publicacion}/reposts', [ForoController::class, 'repost'])->whereNumber('publicacion');
        Route::delete('/foro/{publicacion}/reposts', [ForoController::class, 'unrepost'])->whereNumber('publicacion');
        Route::patch('/foro/{publicacion}/solucion', [ForoController::class, 'setSolution'])->whereNumber('publicacion');
        Route::patch('/foro/{publicacion}/hilo', [ForoController::class, 'toggleThread'])->whereNumber('publicacion');
        Route::post('/foro/{publicacion}/suscripcion', [ForoController::class, 'subscribe'])->whereNumber('publicacion');
        Route::delete('/foro/{publicacion}/suscripcion', [ForoController::class, 'unsubscribe'])->whereNumber('publicacion');
        Route::put('/foro/{publicacion}/encuesta', [ForoController::class, 'createPoll'])->whereNumber('publicacion');
        Route::post('/foro/{publicacion}/encuesta/voto', [ForoController::class, 'votePoll'])->whereNumber('publicacion');
        Route::get('/guardados', [GuardadosController::class, 'index']);
        Route::post('/guardados', [GuardadosController::class, 'save']);
        Route::delete('/guardados', [GuardadosController::class, 'unsave']);
        Route::get('/guardados/colecciones', [GuardadosController::class, 'collections']);
        Route::post('/guardados/colecciones', [GuardadosController::class, 'storeCollection']);
        Route::post('/reportes/contextual', [GuardadosController::class, 'report']);
        Route::post('/foro/{publicacion}/imagenes', [MediaController::class, 'storeForo'])->whereNumber('publicacion');
        Route::delete('/foro/{publicacion}/imagenes/{imagen}', [MediaController::class, 'destroyForo'])->whereNumber('publicacion')->whereNumber('imagen');
        Route::patch('/foro/{publicacion}/imagenes/orden', [MediaController::class, 'reorderForo'])->whereNumber('publicacion');
        Route::patch('/puntos-fisicos/{punto}', [PuntoFisicoController::class, 'update'])->whereNumber('punto');
        Route::get('/admin/usuarios', [AdminAuthorizationController::class, 'usuarios']);
        Route::patch('/admin/usuarios/{usuario}', [AdminAuthorizationController::class, 'updateUsuario'])->whereNumber('usuario');
    });
    Route::post('/foro/{publicacion}/comentarios', [ForoController::class, 'storeComment'])
        ->whereNumber('publicacion')
        ->middleware(['account.active', 'verified.web']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
