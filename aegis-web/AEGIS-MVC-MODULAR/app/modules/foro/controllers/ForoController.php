<?php

class ForoController extends Controller
{
    private $publicacionModel;
    private $comentarioModel;

    public function __construct()
    {
        $this->publicacionModel = $this->loadModel('foro', 'Publicacion');
        $this->comentarioModel = $this->loadModel('foro', 'Comentario');
    }

    public function index(): void
    {
        $publicaciones = $this->publicacionModel->getAllWithAuthor();
        $comentariosPorPublicacion = [];

        foreach ($publicaciones as $publicacion) {
            $comentariosPorPublicacion[$publicacion['id']] =
                $this->comentarioModel->findByPublicacion((int) $publicacion['id']);
        }

        $miembrosDestacados = [];
        $vistos = [];

        foreach ($publicaciones as $publicacion) {
            $uid = (int) $publicacion['usuario_id'];

            if (isset($vistos[$uid])) {
                continue;
            }

            $vistos[$uid] = true;
            $miembrosDestacados[] = $publicacion;

            if (count($miembrosDestacados) >= 3) {
                break;
            }
        }

        $this->render(ROOT_PATH . '/app/modules/foro/views/Foro.php', [
            'publicaciones'      => $publicaciones,
            'comentarios'        => $comentariosPorPublicacion,
            'miembrosDestacados' => $miembrosDestacados,
        ]);
    }

    public function crear(): void
    {
        $this->requireAuth();

        $titulo = trim($_POST['titulo'] ?? '');
        $contenido = trim($_POST['contenido'] ?? '');

        if ($titulo === '' || $contenido === '') {
            $_SESSION['error'] = 'Título y contenido son obligatorios';
            $this->redirect('/foro');
        }

        $this->publicacionModel->create([
            'usuario_id' => Auth::id(),
            'titulo'     => $titulo,
            'contenido'  => $contenido,
        ]);

        $_SESSION['success'] = 'Publicación creada';
        $this->redirect('/foro');
    }

    public function comentar(): void
    {
        $this->requireAuth();

        $publicacionId = (int) ($_POST['publicacion_id'] ?? 0);
        $comentario = trim($_POST['comentario'] ?? '');

        if ($publicacionId <= 0 || $comentario === '') {
            $_SESSION['error'] = 'El comentario no puede estar vacío';
            $this->redirect('/foro');
        }

        $this->comentarioModel->create([
            'publicacion_id' => $publicacionId,
            'usuario_id'     => Auth::id(),
            'comentario'     => $comentario,
        ]);

        $_SESSION['success'] = 'Comentario publicado';
        $this->redirect('/foro');
    }

    public function editar(): void
    {
        $this->requireAuth();

        $id = (int) ($_GET['id'] ?? 0);
        $publicacion = $this->publicacionModel->findById($id);

        if (!$publicacion || (int) $publicacion['usuario_id'] !== Auth::id()) {
            $_SESSION['error'] = 'No tienes permiso para editar esta publicación';
            $this->redirect('/foro');
        }

        $this->render(ROOT_PATH . '/app/modules/foro/views/editar.php', [
            'publicacion' => $publicacion,
        ]);
    }

    public function actualizar(): void
    {
        $this->requireAuth();

        $id = (int) ($_POST['id'] ?? 0);
        $titulo = trim($_POST['titulo'] ?? '');
        $contenido = trim($_POST['contenido'] ?? '');

        $publicacion = $this->publicacionModel->findById($id);

        if (!$publicacion || (int) $publicacion['usuario_id'] !== Auth::id()) {
            $_SESSION['error'] = 'No tienes permiso para editar esta publicación';
            $this->redirect('/foro');
        }

        if ($titulo === '' || $contenido === '') {
            $_SESSION['error'] = 'Título y contenido son obligatorios';
            $this->redirect('/foro/editar?id=' . $id);
        }

        $this->publicacionModel->update($id, [
            'titulo'    => $titulo,
            'contenido' => $contenido,
        ]);

        $_SESSION['success'] = 'Publicación actualizada';
        $this->redirect('/foro');
    }
}
