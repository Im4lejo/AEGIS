<?php require_once ROOT_PATH . '/app/layouts/head.php'; ?>
<link rel="stylesheet" href="<?= asset('Assets/css/pages/home.css') ?>">
<?php require_once ROOT_PATH . '/app/layouts/navbar.php'; ?>

<!-- ========================================
     SUBNAV CATEGORÍAS
========================================= -->

<section class="subnav">
    <a href="#"><i class="fa-solid fa-list"></i> Categorías <i class="fa-solid fa-chevron-down"></i></a>
    <a href="#">Ofertas</a>
    <a href="#">Electrónica</a>
    <a href="#">Gaming</a>
    <a href="#">Ropa</a>
    <a href="#">Accesorios</a>
    <a href="#">Hogar</a>
    <a href="#">Coleccionables</a>
    <a href="#">Vehículos</a>
</section>

<!-- ========================================
     CONTENIDO PRINCIPAL
========================================= -->

<main class="home-container">

    <?php if (!empty($_SESSION['success'])): ?>
        <div style="background:#DCFCE7;color:#166534;padding:12px 16px;border-radius:10px;margin-bottom:20px;font-weight:500;">
            <?= htmlspecialchars($_SESSION['success']) ?>
        </div>
        <?php unset($_SESSION['success']); ?>
    <?php endif; ?>

    <!--HERO-->

    <section class="hero-section">

        <!-- HERO IZQUIERDA -->

        <div class="hero-main">

            <div class="hero-badge">
                Oferta destacada
            </div>

            <h1>
                Potencia tu juego
                <span>al máximo</span>
            </h1>

            <h2>
                NVIDIA GeForce RTX™ 4070 Ti SUPER
            </h2>

            <p>
                Gráficos increíbles, rendimiento superior
                y la experiencia gaming definitiva.
            </p>

            <div class="hero-price">

                <h3>$4.299.000</h3>

                <span>$5.100.000</span>

            </div>

            <div class="hero-buttons">

                <button class="primary-btn" onclick="window.location.href='<?= url('/productos') ?>'">
                    Comprar ahora
                </button>

                <button class="secondary-btn" onclick="alert('Ver detalles del producto destacado')">
                    Ver detalles
                </button>

            </div>

        </div>


        <!-- HERO DERECHA -->

        <div class="hero-side">

            <div class="promo-card orange">

                <span>Oferta Hot</span>

                <h3>Portátil HP Victus Gaming</h3>

                <p>Hasta 50% OFF</p>

                <button onclick="window.location.href='<?= url('/productos') ?>'">Ver oferta</button>

            </div>

            <div class="promo-card blue">

                <span>Black Friday</span>

                <h3>Descuentos increíbles</h3>

                <p>Hasta 70% DTO</p>

                <button onclick="window.location.href='<?= url('/productos') ?>'">Ver ofertas</button>

            </div>

        </div>

    </section>



    <!-- ========================================
         FEATURES
    ========================================= -->

    <section class="features">

        <div class="feature-card">
            <i class="fa-solid fa-shield-halved"></i>
            <div>
                <h4>Transacciones Seguras</h4>
                <p>Compra con confianza</p>
            </div>
        </div>

        <div class="feature-card">
            <i class="fa-solid fa-user-check"></i>
            <div>
                <h4>Usuarios Verificados</h4>
                <p>Perfiles con reputación</p>
            </div>
        </div>

        <div class="feature-card">
            <i class="fa-solid fa-location-dot"></i>
            <div>
                <h4>Puntos Físicos</h4>
                <p>Encuentros seguros</p>
            </div>
        </div>

        <div class="feature-card">
            <i class="fa-solid fa-comments"></i>
            <div>
                <h4>Comunidad Activa</h4>
                <p>Foros y ayuda</p>
            </div>
        </div>

    </section>



    <!-- ========================================
         PRODUCTOS DESTACADOS
    ========================================= -->

    <section class="products-section">

        <div class="section-header">

            <h2>Productos Destacados</h2>

            <a href="<?= url('/productos') ?>">Ver todos</a>

        </div>


        <div class="products-grid">

            <?php foreach (($productos ?? []) as $producto): ?>

                <!-- CARD -->

                <a href="<?= url('/productos/detalle?id=' . (int) $producto['id']) ?>" class="product-card-link">
                    <div class="product-card">

                        <?php
                        $estado = $producto['estado_producto'] ?? 'usado';
                        $tagClass = '';
                        $tagText = '';

                        if ($estado === 'nuevo') {
                            $tagClass = '';
                            $tagText = 'Nuevo';
                        } elseif ($estado === 'reacondicionado') {
                            $tagClass = 'green';
                            $tagText = 'Recondicionado';
                        } else {
                            $tagClass = 'blue';
                            $tagText = 'Usado';
                        }
                        ?>

                        <div class="product-tag <?= $tagClass ?>">
                            <?= $tagText ?>
                        </div>

                        <img src="<?= !empty($producto['imagen_principal']) ? url('/Assets/uploads/products/' . htmlspecialchars($producto['imagen_principal'])) : 'https://via.placeholder.com/300x230?text=Sin+Imagen' ?>" alt="<?= htmlspecialchars($producto['titulo']) ?>" loading="lazy">

                        <h3><?= htmlspecialchars($producto['titulo']) ?></h3>

                        <!-- VENDOR INFO -->
                        <div class="product-vendor">
                            <div class="vendor-details">
                                <p class="vendor-name"><?= htmlspecialchars($producto['vendedor_nombre'] ?? 'Vendedor desconocido') ?></p>
                                <small class="vendor-rating">
                                    <i class="fa-solid fa-star"></i>
                                    <?= number_format((float) ($producto['vendedor_reputacion'] ?? 5), 1) ?>
                                </small>
                            </div>
                        </div>

                        <!-- LOCATION -->
                        <div class="product-location">
                            <span><?= htmlspecialchars($producto['ciudad'] ?? 'No especificada') ?></span>
                        </div>

                        <!-- PRICE -->
                        <div class="product-price">
                            <span class="price">$<?= number_format((float) $producto['precio'], 0, ',', '.') ?> COP</span>
                        </div>

                    </div>
                </a>

            <?php endforeach; ?>

        </div>

    </section>

</main>

<?php require_once ROOT_PATH . '/app/layouts/footer.php'; ?>