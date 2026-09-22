<?php

require_once ROOT_PATH . '/app/modules/auth/models/Usuario.php';

class AuthController extends Controller
{
    private Usuario $usuarioModel;

    public function __construct()
    {
        $this->usuarioModel = new Usuario();
    }

    public function login(): void
    {
        if (Auth::check()) {
            $this->redirect('/home');
        }

        $this->render(ROOT_PATH . '/app/modules/auth/views/login.php');
    }

    public function register(): void
    {
        if (Auth::check()) {
            $this->redirect('/home');
        }

        $this->render(ROOT_PATH . '/app/modules/auth/views/register.php');
    }

    public function authenticate(): void
    {
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        if ($email === '' || $password === '') {
            $_SESSION['error'] = 'Correo y contraseña son obligatorios';
            $this->redirect('/login');
        }

        $user = $this->usuarioModel->findByEmail($email);

        if (!$user) {
            $_SESSION['error'] = 'El usuario no existe';
            $this->redirect('/login');
        }

        if ($user['estado'] !== 'activo') {
            $_SESSION['error'] = 'Tu cuenta está suspendida o baneada';
            $this->redirect('/login');
        }

        if (!password_verify($password, $user['password'])) {
            $_SESSION['error'] = 'Contraseña incorrecta';
            $this->redirect('/login');
        }

        Auth::login($user);

        if (Auth::isAdmin()) {
            $this->redirect('/admin');
        }

        if (Auth::isOwner()) {
            $this->redirect('/puntos-fisicos/dashboard');
        }

        $this->redirect('/home');
    }

    public function store(): void
    {
        $nombre = trim($_POST['nombre'] ?? '');
        $apellido = trim($_POST['apellido'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $passwordConfirm = $_POST['password_confirm'] ?? '';

        if ($nombre === '' || $email === '' || $password === '') {
            $_SESSION['error'] = 'Nombre, correo y contraseña son obligatorios';
            $this->redirect('/register');
        }

        if ($password !== $passwordConfirm) {
            $_SESSION['error'] = 'Las contraseñas no coinciden';
            $this->redirect('/register');
        }

        if (strlen($password) < 6) {
            $_SESSION['error'] = 'La contraseña debe tener al menos 6 caracteres';
            $this->redirect('/register');
        }

        if ($this->usuarioModel->findByEmail($email)) {
            $_SESSION['error'] = 'El correo ya está registrado';
            $this->redirect('/register');
        }

        $parts = preg_split('/\s+/', $nombre, 2);
        if ($apellido === '') {
            $apellido = $parts[1] ?? 'Usuario';
            $nombre = $parts[0];
        }

        $username = $this->usuarioModel->generateUsername($email);

        $this->usuarioModel->create([
            'nombre'   => $nombre,
            'apellido' => $apellido,
            'username' => $username,
            'email'    => $email,
            'password' => password_hash($password, PASSWORD_DEFAULT),
        ]);

        $_SESSION['success'] = 'Cuenta creada correctamente. Inicia sesión.';
        $this->redirect('/login');
    }

    public function logout(): void
    {
        Auth::logout();
    }
}
