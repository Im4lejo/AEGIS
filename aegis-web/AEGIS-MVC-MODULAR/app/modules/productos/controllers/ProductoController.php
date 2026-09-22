<?php

class ProductoController extends Controller
{
    private $productoModel;
    private $categoriaModel;
    private $puntoModel;
    private $encuentroModel;

    public function __construct()
    {
        $this->productoModel = $this->loadModel('productos', 'Producto');
        $this->categoriaModel = $this->loadModel('productos', 'Categoria');
        $this->puntoModel = $this->loadModel('puntosFisicos', 'PuntoFisico');
        $this->encuentroModel = $this->loadModel('puntosFisicos', 'Encuentro');
    }

    public function index(): void
    {
        // Obtener filtros de la solicitud
        $filtros = [
            'busqueda' => trim($_GET['busqueda'] ?? ''),
            'precio_max' => isset($_GET['precio_max']) ? (float) $_GET['precio_max'] : 0,
            'estado' => trim($_GET['estado'] ?? 'todo'),
            'categoria' => trim($_GET['cat'] ?? ''),
            'sort' => trim($_GET['sort'] ?? 'reciente'),
            'limit' => 24,
            'offset' => 0,
        ];

        // Verificar si hay algún filtro activo
        $hayFiltros = !empty($filtros['busqueda']) || 
                      $filtros['precio_max'] > 0 || 
                      $filtros['estado'] !== 'todo' || 
                      !empty($filtros['categoria']);

        if ($hayFiltros) {
            $productos = $this->productoModel->searchAndFilter($filtros);
            $totalProductos = $this->productoModel->countSearchResults($filtros);
        } else {
            $productos = $this->productoModel->getRecientes($filtros['limit']);
            $totalProductos = $this->productoModel->countActivos();
        }

        // Obtener todas las categorías para el filtro
        $categorias = $this->categoriaModel->getAll();

        $this->render(ROOT_PATH . '/app/modules/productos/views/index.php', [
            'productos' => $productos,
            'categoria' => $filtros['categoria'],
            'filtros' => $filtros,
            'totalProductos' => $totalProductos,
            'categorias' => $categorias,
        ]);
    }

    public function crear(): void
    {
        $this->requireAuth();

        $categorias = $this->categoriaModel->getAll();

        $this->render(ROOT_PATH . '/app/modules/productos/views/crear.php', [
            'categorias' => $categorias,
        ]);
    }

    public function detalle(): void
    {
        $id = (int) ($_GET['id'] ?? 0);

        if ($id <= 0) {
            $this->redirect('/productos');
        }

        $producto = $this->productoModel->findById($id);

        if (!$producto) {
            $this->notFound();
        }

        // Traer datos del usuario que creó el producto
        $usuarioModel = $this->loadModel('auth', 'Usuario');
        $usuario = $usuarioModel->findById((int) $producto['usuario_id']);

        // Traer imagen principal del producto
        $sql = 'SELECT imagen FROM imagenes_producto WHERE producto_id = ? AND principal = 1 LIMIT 1';
        $imagenRow = $this->productoModel->fetch($sql, [$id]);
        $imagenPrincipal = null;

        if ($imagenRow) {
            $imagenPrincipal = asset('Assets/uploads/products/' . htmlspecialchars($imagenRow['imagen']));
        }

        $puntos = $this->puntoModel->getActivos();

        $this->render(ROOT_PATH . '/app/modules/productos/views/detalle.php', [
            'producto'           => $producto,
            'usuario'            => $usuario ?? [],
            'imagen_principal'   => $imagenPrincipal,
            'puntos'             => $puntos,
        ]);
    }

    public function guardar(): void
    {
        $this->requireAuth();

        $data = [
            'usuario_id'       => Auth::id(),
            'titulo'           => trim($_POST['titulo'] ?? ''),
            'descripcion'      => trim($_POST['descripcion'] ?? ''),
            'precio'           => (float) ($_POST['precio'] ?? 0),
            'categoria_id'     => (int) ($_POST['categoria_id'] ?? 1),
            'estado_producto'  => $_POST['estado'] ?? 'usado',
            'ciudad'           => trim($_POST['ciudad'] ?? 'Medellín'),
            'estado_publicacion' => 'activo',
        ];

        if ($data['titulo'] === '' || $data['precio'] <= 0) {
            $_SESSION['error'] = 'Título y precio son obligatorios';
            $this->redirect('/productos/crear');
        }

        $id = $this->productoModel->create($data);

        // Manejar imagen principal si fue subida
        if (!empty($_FILES['imagen_principal']) && $_FILES['imagen_principal']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['imagen_principal'];

            // Validar tipo MIME usando getimagesize
            $info = @getimagesize($file['tmp_name']);
            if ($info !== false) {
                $ext = image_type_to_extension($info[2], false);
                $filename = 'prod_' . $id . '_' . time() . '.' . $ext;

                $uploadDir = ROOT_PATH . '/public/Assets/uploads/products';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }

                $destination = $uploadDir . '/' . $filename;

                if (move_uploaded_file($file['tmp_name'], $destination)) {
                    // Guardar referencia en la tabla imagenes_producto
                    $sql = 'INSERT INTO imagenes_producto (producto_id, imagen, principal) VALUES (?, ?, ?)';
                    $this->productoModel->query($sql, [$id, $filename, 1]);
                }
            }
        }

        $_SESSION['success'] = 'Producto publicado correctamente';
        $this->redirect('/productos/detalle?id=' . $id);
    }

    public function misProductos(): void
    {
        $this->requireAuth();

        $productos = $this->productoModel->findByUsuario(Auth::id());

        $this->render(ROOT_PATH . '/app/modules/productos/views/misProductos.php', [
            'productos' => $productos,
        ]);
    }

    public function eliminar(): void
    {
        $this->requireAuth();

        $id = (int) ($_POST['id'] ?? 0);
        $producto = $this->productoModel->findById($id);

        if (!$producto || (int) $producto['usuario_id'] !== Auth::id()) {
            $this->forbidden();
        }

        $this->productoModel->delete($id);
        $_SESSION['success'] = 'Producto eliminado';
        $this->redirect('/productos/mis-productos');
    }

    public function solicitarEncuentro(): void
    {
        $this->requireAuth();

        $productoId = (int) ($_POST['producto_id'] ?? 0);
        $puntoId = (int) ($_POST['punto_fisico_id'] ?? 0);
        $fecha = $_POST['fecha_encuentro'] ?? '';
        $hora = $_POST['hora_encuentro'] ?? '';

        $producto = $this->productoModel->findById($productoId);

        if (!$producto || $fecha === '' || $hora === '' || $puntoId <= 0) {
            $_SESSION['error'] = 'Completa todos los datos del encuentro';
            $this->redirect('/productos/detalle?id=' . $productoId);
        }

        if ((int) $producto['usuario_id'] === Auth::id()) {
            $_SESSION['error'] = 'No puedes solicitar un encuentro de tu propio producto';
            $this->redirect('/productos/detalle?id=' . $productoId);
        }

        $encuentroId = $this->encuentroModel->create([
            'comprador_id'    => Auth::id(),
            'vendedor_id'     => (int) $producto['usuario_id'],
            'producto_id'     => $productoId,
            'punto_fisico_id' => $puntoId,
            'fecha_encuentro' => $fecha,
            'hora_encuentro'  => $hora,
            'estado'          => 'pendiente',
        ]);

        $_SESSION['success'] = 'Encuentro solicitado. El vendedor y el punto físico lo confirmarán.';
        $this->redirect('/productos/detalle?id=' . $productoId . '&encuentro=' . $encuentroId);
    }
}
