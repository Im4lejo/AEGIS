<?php

class HomeController extends Controller
{
    public function index(): void
    {
        $productoModel = $this->loadModel('productos', 'Producto');
        $productos = $productoModel->getRecientes(8);

        $this->render(ROOT_PATH . '/app/modules/home/views/home.php', [
            'productos' => $productos,
        ]);
    }
}
