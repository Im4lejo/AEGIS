<?php

class Router
{
    private $routes = [];

    /*
    |----------------------------------------------------------------------
    | GET
    |----------------------------------------------------------------------
    */

    public function get($route, $action)
    {
        $this->routes['GET'][$route] = $action;
    }

    /*
    |----------------------------------------------------------------------
    | POST
    |----------------------------------------------------------------------
    */

    public function post($route, $action)
    {
        $this->routes['POST'][$route] = $action;
    }

    /*
    |----------------------------------------------------------------------
    | DISPATCH
    |----------------------------------------------------------------------
    */

    public function dispatch($url)
    {
        $url = '/' . trim($url, '/');

        $method = $_SERVER['REQUEST_METHOD'];

        if (!isset($this->routes[$method][$url])) {
            require_once ROOT_PATH . '/app/views/errors/404.php';
            return;
        }

        $action = $this->routes[$method][$url];

        list($controllerName, $methodName) = explode('@', $action);

        $module = $this->getModuleByController($controllerName);

        if (!$module) {
            require_once ROOT_PATH . '/app/views/errors/404.php';
            return;
        }

        $controllerPath =
            ROOT_PATH . "/app/modules/{$module}/controllers/{$controllerName}.php";

        if (!file_exists($controllerPath)) {
            require_once ROOT_PATH . '/app/views/errors/404.php';
            return;
        }

        require_once $controllerPath;

        if (!class_exists($controllerName)) {
            require_once ROOT_PATH . '/app/views/errors/404.php';
            return;
        }

        $controller = new $controllerName();

        if (!method_exists($controller, $methodName)) {
            require_once ROOT_PATH . '/app/views/errors/404.php';
            return;
        }

        $controller->$methodName();
    }

    /*
    |----------------------------------------------------------------------
    | MODULES
    |----------------------------------------------------------------------
    */

    private function getModuleByController($controller)
    {
        $modules = [

            'AuthController'         => 'auth',
            'HomeController'         => 'home',
            'ProductoController'     => 'productos',
            'ForoController'         => 'foro',
            'PerfilController'       => 'perfil',
            'PuntoFisicoController'  => 'puntosFisicos',
            'AdminController'        => 'admin'

        ];

        return $modules[$controller] ?? null;
    }
}