<?php

class PuntoFisicoController extends Controller
{
    private $puntoModel;
    private $encuentroModel;
    private $qrModel;

    public function __construct()
    {
        $this->puntoModel = $this->loadModel('puntosFisicos', 'PuntoFisico');
        $this->encuentroModel = $this->loadModel('puntosFisicos', 'Encuentro');
        $this->qrModel = $this->loadModel('puntosFisicos', 'CodigoQR');
    }

    public function index(): void
    {
        if (!Auth::check()) {
            $this->redirect('/login');
        }

        if (Auth::isOwner() || Auth::isAdmin()) {
            $this->redirect('/puntos-fisicos/dashboard');
        }

        $puntos = $this->puntoModel->getActivos();

        $this->render(ROOT_PATH . '/app/modules/puntosFisicos/views/index.php', [
            'puntos' => $puntos,
        ]);
    }

    public function dashboard(): void
    {
        $this->requireOwner();

        $punto = $this->puntoModel->findByOwner(Auth::id());
        $encuentros = $punto ? $this->encuentroModel->getByPunto((int) $punto['id']) : [];

        $this->render(ROOT_PATH . '/app/modules/puntosFisicos/views/dashboard.php', [
            'punto'      => $punto,
            'encuentros' => array_slice($encuentros, 0, 5),
        ]);
    }

    public function encuentros(): void
    {
        $this->requireOwner();

        $punto = $this->puntoModel->findByOwner(Auth::id());

        if (!$punto) {
            $_SESSION['error'] = 'Primero configura tu punto físico';
            $this->redirect('/puntos-fisicos/configuracion');
        }

        $encuentros = $this->encuentroModel->getByPunto((int) $punto['id']);

        $this->render(ROOT_PATH . '/app/modules/puntosFisicos/views/encuentros.php', [
            'punto'      => $punto,
            'encuentros' => $encuentros,
        ]);
    }

    public function qr(): void
    {
        $this->requireAuth();

        $encuentroId = (int) ($_GET['encuentro'] ?? 0);
        $encuentro = $this->encuentroModel->findById($encuentroId);

        if (!$encuentro) {
            $this->notFound();
        }

        $userId = Auth::id();
        $isParticipant = in_array($userId, [(int) $encuentro['comprador_id'], (int) $encuentro['vendedor_id']], true);

        if (!$isParticipant && !Auth::isOwner() && !Auth::isAdmin()) {
            $this->forbidden();
        }

        $qr = $this->qrModel->findByEncuentro($encuentroId);

        if (!$qr && $encuentro['estado'] === 'confirmado') {
            $this->qrModel->createForEncuentro($encuentroId);
            $qr = $this->qrModel->findByEncuentro($encuentroId);
        }

        $this->render(ROOT_PATH . '/app/modules/puntosFisicos/views/qr.php', [
            'encuentro' => $encuentro,
            'qr'        => $qr,
        ]);
    }

    public function configuracion(): void
    {
        $this->requireOwner();

        $punto = $this->puntoModel->findByOwner(Auth::id());

        $this->render(ROOT_PATH . '/app/modules/puntosFisicos/views/configuracion.php', [
            'punto' => $punto,
        ]);
    }

    public function guardar(): void
    {
        $this->requireOwner();

        $data = [
            'nombre'      => trim($_POST['nombre'] ?? ''),
            'descripcion' => trim($_POST['descripcion'] ?? ''),
            'direccion'   => trim($_POST['direccion'] ?? ''),
            'ciudad'      => trim($_POST['ciudad'] ?? ''),
            'telefono'    => trim($_POST['telefono'] ?? ''),
        ];

        if ($data['nombre'] === '' || $data['direccion'] === '' || $data['ciudad'] === '') {
            $_SESSION['error'] = 'Nombre, dirección y ciudad son obligatorios';
            $this->redirect('/puntos-fisicos/configuracion');
        }

        $punto = $this->puntoModel->findByOwner(Auth::id());

        if ($punto) {
            $this->puntoModel->update((int) $punto['id'], $data);
            $_SESSION['success'] = 'Punto físico actualizado';
        } else {
            $data['owner_id'] = Auth::id();
            $data['estado'] = Auth::isAdmin() ? 'activo' : 'pendiente';
            $this->puntoModel->create($data);
            $_SESSION['success'] = 'Punto físico registrado. Pendiente de verificación.';
        }

        $this->redirect('/puntos-fisicos/dashboard');
    }

    public function actualizarEncuentro(): void
    {
        $this->requireOwner();

        $id = (int) ($_POST['id'] ?? 0);
        $estado = $_POST['estado'] ?? 'pendiente';

        if (!in_array($estado, ['pendiente', 'confirmado', 'cancelado', 'finalizado'], true)) {
            $this->redirect('/puntos-fisicos/encuentros');
        }

        $encuentro = $this->encuentroModel->findById($id);
        $punto = $this->puntoModel->findByOwner(Auth::id());

        if (!$encuentro || !$punto || (int) $encuentro['punto_fisico_id'] !== (int) $punto['id']) {
            $this->forbidden();
        }

        $this->encuentroModel->updateEstado($id, $estado);

        if ($estado === 'confirmado' && !$this->qrModel->findByEncuentro($id)) {
            $this->qrModel->createForEncuentro($id);
        }

        if ($estado === 'finalizado') {
            $this->qrModel->marcarUsado($id);
        }

        $_SESSION['success'] = 'Encuentro actualizado';
        $this->redirect('/puntos-fisicos/encuentros');
    }
}
