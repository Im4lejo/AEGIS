<?php

session_start();

require_once '../config/app.php';

require_once '../app/core/Database.php';
require_once '../app/core/Router.php';
require_once '../app/core/Controller.php';
require_once '../app/core/Model.php';
require_once '../app/core/Auth.php';

$router = new Router();

require_once '../routes/web.php';

$url = trim((string) ($_GET['url'] ?? ''), '/');

if ($url === '') {
    header('Location: ' . url('/login'));
    exit;
}

$router->dispatch($url);
