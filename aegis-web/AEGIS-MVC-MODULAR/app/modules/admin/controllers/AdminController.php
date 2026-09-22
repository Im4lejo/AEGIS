<?php

class AdminController extends Controller
{
    private $usuarioModel;
    private $productoModel;
    private $reporteModel;
    private $encuentroModel;

    public function __construct()
    {
        $this->requireAdmin();

        $this->usuarioModel = $this->loadModel('auth', 'Usuario');
        $this->productoModel = $this->loadModel('productos', 'Producto');
        $this->reporteModel = $this->loadModel('admin', 'Reporte');
        $this->encuentroModel = $this->loadModel('puntosFisicos', 'Encuentro');
    }

    public function index(): void
    {
        $stats = [
            'usuarios'   => $this->usuarioModel->countAll(),
            'productos'  => $this->productoModel->countActivos(),
            'reportes'   => count($this->reporteModel->getPendientes()),
            'encuentros' => $this->encuentroModel->countByEstado('pendiente'),
        ];

        $this->render(ROOT_PATH . '/app/modules/admin/views/dashboard.php', [
            'stats' => $stats,
        ]);
    }

    public function usuarios(): void
    {
        $usuarios = $this->usuarioModel->getAll();

        $this->render(ROOT_PATH . '/app/modules/admin/views/usuarios.php', [
            'usuarios' => $usuarios,
        ]);
    }

    public function productos(): void
    {
        $productos = $this->productoModel->getRecientes(100);

        $this->render(ROOT_PATH . '/app/modules/admin/views/productos.php', [
            'productos' => $productos,
        ]);
    }

    public function reportes(): void
    {
        $reportes = $this->reporteModel->getAll();

        $this->render(ROOT_PATH . '/app/modules/admin/views/reportes.php', [
            'reportes' => $reportes,
        ]);
    }

    public function cambiarEstadoUsuario(): void
    {
        $id = (int) ($_POST['id'] ?? 0);
        $estado = $_POST['estado'] ?? 'activo';

        if (!in_array($estado, ['activo', 'suspendido', 'baneado'], true)) {
            $this->redirect('/admin/usuarios');
        }

        $this->usuarioModel->updateEstado($id, $estado);
        $_SESSION['success'] = 'Estado de usuario actualizado';
        $this->redirect('/admin/usuarios');
    }

    public function cambiarEstadoReporte(): void
    {
        $id = (int) ($_POST['id'] ?? 0);
        $estado = $_POST['estado'] ?? 'revisado';

        if (!in_array($estado, ['pendiente', 'revisado', 'resuelto'], true)) {
            $this->redirect('/admin/reportes');
        }

        $this->reporteModel->updateEstado($id, $estado);
        $_SESSION['success'] = 'Reporte actualizado';
        $this->redirect('/admin/reportes');
    }
}
