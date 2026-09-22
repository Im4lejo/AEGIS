<?php

require_once '../app/core/Controller.php';
require_once '../app/core/Auth.php';

require_once '../app/modules/auth/models/Usuario.php';

class AuthController extends Controller
{
    private $usuarioModel;

    public function __construct()
    {
        $this->usuarioModel = new Usuario();
    }

    /*
    |--------------------------------------------------------------------------
    | LOGIN VIEW
    |--------------------------------------------------------------------------
    */

    public function login()
    {
        require_once '../app/modules/auth/views/login.php';
    }

    /*
    |--------------------------------------------------------------------------
    | REGISTER VIEW
    |--------------------------------------------------------------------------
    */

    public function register()
    {
        require_once '../app/modules/auth/views/register.php';
    }

    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATE
    |--------------------------------------------------------------------------
    */

    public function authenticate()
    {
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';

        $user = $this->usuarioModel->findByEmail($email);

        if (!$user) {

            $_SESSION['error'] = 'El usuario no existe';

            $this->redirect('/login');
        }

        if (!password_verify($password, $user['password'])) {

            $_SESSION['error'] = 'Contraseña incorrecta';

            $this->redirect('/login');
        }

        Auth::login($user);

        $this->redirect('/home');
    }

    /*
    |--------------------------------------------------------------------------
    | REGISTER STORE
    |--------------------------------------------------------------------------
    */

    public function store()
    {
        $nombre = trim($_POST['nombre'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = trim($_POST['password'] ?? '');

        if (
            empty($nombre) ||
            empty($email) ||
            empty($password)
        ) {

            $_SESSION['error'] = 'Todos los campos son obligatorios';

            $this->redirect('/register');
        }

        $existingUser = $this->usuarioModel->findByEmail($email);

        if ($existingUser) {

            $_SESSION['error'] = 'El correo ya está registrado';

            $this->redirect('/register');
        }

        $hashedPassword = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        $this->usuarioModel->create([

            'nombre'   => $nombre,
            'email'    => $email,
            'password' => $hashedPassword

        ]);

        $_SESSION['success'] = 'Cuenta creada correctamente';

        $this->redirect('/login');
    }

    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */

    public function logout()
    {
        Auth::logout();
    }
}