<?php

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

$router->get('/login', 'AuthController@login');
$router->post('/login', 'AuthController@authenticate');

$router ->get('/register', 'AuthController@register');
$router->post('/register', 'AuthController@store');

$router->get('/logout', 'AuthController@logout');

/*
|--------------------------------------------------------------------------
| HOME
|--------------------------------------------------------------------------
*/

$router->get('/home', 'HomeController@index');

/*
|--------------------------------------------------------------------------
| PRODUCTOS
|--------------------------------------------------------------------------
*/

$router->get('/productos', 'ProductoController@index');
$router->get('/productos/crear', 'ProductoController@crear');
$router->post('/productos/guardar', 'ProductoController@guardar');
$router->get('/productos/detalle', 'ProductoController@detalle');
$router->get('/productos/mis-productos', 'ProductoController@misProductos');
$router->post('/productos/eliminar', 'ProductoController@eliminar');
$router->post('/productos/encuentro', 'ProductoController@solicitarEncuentro');

/*
|--------------------------------------------------------------------------
| FORO
|--------------------------------------------------------------------------
*/

$router->get('/foro', 'ForoController@index');
$router->post('/foro/publicar', 'ForoController@crear');
$router->post('/foro/comentar', 'ForoController@comentar');
$router->get('/foro/editar', 'ForoController@editar');
$router->post('/foro/actualizar', 'ForoController@actualizar');

/*
|--------------------------------------------------------------------------
| PERFIL
|--------------------------------------------------------------------------
*/

$router->get('/perfil', 'PerfilController@index');
$router->get('/perfil/editar', 'PerfilController@editar');
$router->post('/perfil/editar', 'PerfilController@editar');
$router->get('/perfil/ver', 'PerfilController@ver');

/*
|--------------------------------------------------------------------------
| PUNTOS FISICOS
|--------------------------------------------------------------------------
*/

$router->get('/puntos-fisicos', 'PuntoFisicoController@index');
$router->get('/puntos-fisicos/dashboard', 'PuntoFisicoController@dashboard');
$router->get('/puntos-fisicos/encuentros', 'PuntoFisicoController@encuentros');
$router->get('/puntos-fisicos/qr', 'PuntoFisicoController@qr');
$router->get('/puntos-fisicos/configuracion', 'PuntoFisicoController@configuracion');
$router->post('/puntos-fisicos/guardar', 'PuntoFisicoController@guardar');
$router->post('/puntos-fisicos/encuentro/estado', 'PuntoFisicoController@actualizarEncuentro');

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

$router->get('/admin', 'AdminController@index');
$router->get('/admin/usuarios', 'AdminController@usuarios');
$router->get('/admin/productos', 'AdminController@productos');
$router->get('/admin/reportes', 'AdminController@reportes');
$router->post('/admin/usuario/estado', 'AdminController@cambiarEstadoUsuario');
$router->post('/admin/reporte/estado', 'AdminController@cambiarEstadoReporte');