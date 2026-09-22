<?php

class PerfilController extends Controller
{
    private $perfilModel;
    private $productoModel;

    public function __construct()
    {
        $this->perfilModel = $this->loadModel('perfil', 'Perfil');
        $this->productoModel = $this->loadModel('productos', 'Producto');
    }

    public function index(): void
    {
        $this->requireAuth();

        $usuario = $this->perfilModel->findByUsuarioId(Auth::id());
        $publicaciones = $this->perfilModel->getPublicaciones(Auth::id());
        $productos = $this->productoModel->findByUsuario(Auth::id());

        $this->render(ROOT_PATH . '/app/modules/perfil/views/perfil.php', [
            'usuario'       => $usuario,
            'publicaciones' => $publicaciones,
            'productos'     => $productos,
            'esPropio'      => true,
        ]);
    }

    public function ver(): void
    {
        $id = (int) ($_GET['id'] ?? 0);

        if ($id <= 0) {
            $this->redirect('/home');
        }

        $usuario = $this->perfilModel->findByUsuarioId($id);

        if (!$usuario) {
            $this->notFound();
        }

        $publicaciones = $this->perfilModel->getPublicaciones($id);
        $productos = $this->productoModel->findByUsuario($id);

        $this->render(ROOT_PATH . '/app/modules/perfil/views/perfil.php', [
            'usuario'       => $usuario,
            'publicaciones' => $publicaciones,
            'productos'     => $productos,
            'esPropio'      => Auth::check() && Auth::id() === $id,
        ]);
    }

    public function editar(): void
    {
        $this->requireAuth();

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $usuario = $this->perfilModel->findByUsuarioId(Auth::id());

            $this->render(ROOT_PATH . '/app/modules/perfil/views/editar.php', [
                'usuario' => $usuario,
            ]);
            return;
        }

        $data = [];
        if (isset($_POST['descripcion'])) {
            $data['descripcion'] = trim($_POST['descripcion']);
        }
        if (isset($_POST['ciudad'])) {
            $data['ciudad'] = trim($_POST['ciudad']);
        }
        if (isset($_POST['telefono'])) {
            $data['telefono'] = trim($_POST['telefono']);
        }

        if (!empty($_FILES['foto_perfil']) && $_FILES['foto_perfil']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = ROOT_PATH . '/public/Assets/uploads/users/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $extension = pathinfo($_FILES['foto_perfil']['name'], PATHINFO_EXTENSION);
            $filename = 'user_' . Auth::id() . '_' . time() . '.' . $extension;
            $destination = $uploadDir . $filename;

            if (move_uploaded_file($_FILES['foto_perfil']['tmp_name'], $destination)) {
                $data['foto_perfil'] = $filename;
            }
        }

        if (!empty($data)) {
            $this->perfilModel->update(Auth::id(), $data);
        }

        $updated = $this->perfilModel->findByUsuarioId(Auth::id());
        Auth::login($updated);

        $_SESSION['success'] = 'Perfil actualizado';
        $this->redirect('/perfil');
    }
}
