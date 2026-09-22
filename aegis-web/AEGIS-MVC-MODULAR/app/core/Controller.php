<?php

class Controller
{
    public function render(string $view, array $data = []): void
    {
        extract($data);
        require $view;
    }

    public function redirect(string $url): void
    {
        header('Location: ' . url($url));
        exit;
    }

    protected function requireAuth(): void
    {
        if (!Auth::check()) {
            $_SESSION['error'] = 'Debes iniciar sesión';
            $this->redirect('/login');
        }
    }

    protected function requireAdmin(): void
    {
        $this->requireAuth();

        if (!Auth::isAdmin()) {
            $this->forbidden();
        }
    }

    protected function requireOwner(): void
    {
        $this->requireAuth();

        if (!Auth::isOwner() && !Auth::isAdmin()) {
            $this->forbidden();
        }
    }

    protected function forbidden(): void
    {
        http_response_code(403);
        require ROOT_PATH . '/app/views/errors/403.php';
        exit;
    }

    protected function notFound(): void
    {
        http_response_code(404);
        require ROOT_PATH . '/app/views/errors/404.php';
        exit;
    }

    protected function loadModel(string $module, string $model): object
    {
        $path = ROOT_PATH . "/app/modules/{$module}/models/{$model}.php";

        if (!file_exists($path)) {
            die("Modelo no encontrado: {$model}");
        }

        require_once $path;

        return new $model();
    }
}
