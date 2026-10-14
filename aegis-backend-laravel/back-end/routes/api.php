<?php

use App\Http\Controllers\Api\ForoController;
use App\Http\Controllers\Api\InicioController;
use App\Http\Controllers\Api\PerfilController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\PuntoFisicoController;
use Illuminate\Support\Facades\Route;

Route::get('/inicio', InicioController::class);
Route::get('/categorias', [ProductoController::class, 'categorias']);
Route::get('/productos', [ProductoController::class, 'index']);
Route::get('/productos/{producto}', [ProductoController::class, 'show'])->whereNumber('producto');
Route::get('/foro', [ForoController::class, 'index']);
Route::get('/perfiles/{usuario}', [PerfilController::class, 'show'])->whereNumber('usuario');
Route::get('/puntos-fisicos', [PuntoFisicoController::class, 'index']);
