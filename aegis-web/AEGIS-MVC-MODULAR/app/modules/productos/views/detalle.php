<?php
$pageTitle = 'AEGIS | ' . htmlspecialchars($producto['titulo'] ?? 'Producto');
$pageStylesheet = asset('Assets/css/pages/product-detail.css');
require_once ROOT_PATH . '/app/layouts/head.php';
require_once ROOT_PATH . '/app/layouts/navbar.php';
?>

<?php
    $fotoPerfilVendedor = trim((string) ($usuario['foto_perfil'] ?? ''));
    $fotoPathVendedor = ROOT_PATH . '/public/Assets/uploads/users/' . basename($fotoPerfilVendedor);
    $sellerAvatarSrc = (is_file($fotoPathVendedor) && $fotoPerfilVendedor !== '')
        ? url('/Assets/uploads/users/' . $fotoPerfilVendedor)
        : avatar_url($usuario['username'] ?? $usuario['email'] ?? 'aegis', 120);
?>

<main class="product-detail-page">

    <section class="product-detail__top-section">
        
        <!-- Galería de Imágenes -->
        <article class="gallery card">
            <div class="gallery__thumbnails">
                <button class="gallery__thumbnail gallery__thumbnail--active">
                    <div class="gallery__thumbnail--empty"><i class="fa-regular fa-image"></i></div>
                </button>
                <button class="gallery__thumbnail">
                    <div class="gallery__thumbnail--empty"><i class="fa-regular fa-image"></i></div>
                </button>
                <button class="gallery__thumbnail">
                    <div class="gallery__thumbnail--empty"><i class="fa-regular fa-image"></i></div>
                </button>
                <button class="gallery__thumbnail">
                    <div class="gallery__thumbnail--empty"><i class="fa-regular fa-image"></i></div>
                </button>
            </div>
            <div class="gallery__main">
                <?php if (!empty($imagen_principal)): ?>
                    <img src="<?= htmlspecialchars($imagen_principal) ?>" alt="<?= htmlspecialchars($producto['titulo']) ?>">
                <?php else: ?>
                    <i class="fa-regular fa-image"></i>
                <?php endif; ?>
            </div>
        </article>

        <!-- Información del Producto -->
        <article class="product-info card">
            <header class="product-info__header">
                <h1 class="product-info__title">
                    <?= htmlspecialchars($producto['titulo']) ?>
                </h1>
            </header>

            <!-- Vista Previa del Vendedor -->
            <div class="seller-preview">
                <div class="seller-preview__profile">
                    <div class="seller-preview__avatar">
                        <img src="<?= htmlspecialchars($sellerAvatarSrc) ?>" alt="<?= htmlspecialchars($usuario['nombre']) ?>">
                    </div>
                    <div class="seller-preview__data">
                        <h3 class="seller-preview__name"><?= htmlspecialchars($usuario['nombre'] ?? 'Usuario') ?></h3>
                        <div class="seller-preview__badges">
                            <span class="badge badge--blue"><i class="fa-solid fa-crown"></i></span>
                            <span class="badge badge--purple"><i class="fa-solid fa-shield"></i></span>
                            <span class="badge badge--light-border">
                                <span class="badge__rating-text">
                                    <i class="fa-regular fa-star"></i> <?= number_format((float) ($usuario['reputacion'] ?? 5.00), 2) ?>
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
                <button class="btn-icon">
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>

            <!-- Precio -->
            <div class="product-info__price-box">
                <h2 class="product-info__price">COP $<?= number_format((float) $producto['precio'], 0, '.', '.') ?></h2>
                <span class="product-info__availability">(Único Disponible)</span>
            </div>

            <!-- Especificaciones -->
            <div class="product-specs">
                <div class="product-specs__row">
                    <div class="product-specs__item">
                        <span class="product-specs__label">Categoría:</span>
                        <strong class="product-specs__value"><?= htmlspecialchars($producto['categoria_nombre'] ?? 'Sin categoría') ?></strong>
                    </div>
                    <div class="product-specs__item">
                        <span class="product-specs__label">Ciudad:</span>
                        <strong class="product-specs__value"><?= htmlspecialchars($producto['ciudad']) ?></strong>
                    </div>
                </div>
                <div class="product-specs__row">
                    <div class="product-specs__item">
                        <span class="product-specs__label">Estado:</span>
                        <strong class="product-specs__value"><?= ucfirst(htmlspecialchars($producto['estado_producto'] ?? 'usado')) ?></strong>
                    </div>
                </div>
            </div>

            <!-- Descripción -->
            <div class="product-description">
                <h4 class="product-description__title">Descripción</h4>
                <p class="product-description__text">
                    <?= !empty($producto['descripcion']) ? htmlspecialchars($producto['descripcion']) : 'Sin descripción disponible' ?>
                </p>
            </div>

            <!-- Botones de Acción -->
            <div class="action-buttons">
                <button class="btn btn--primary">Contactar</button>
                <button class="btn btn--outline">Agregar a Favoritos</button>
            </div>
        </article>

    </section>

    <!-- Sección Inferior: Vendedor y Comentarios -->
    <section class="product-detail__bottom-section">
        
        <!-- Información del Vendedor -->
        <article class="seller-stats card">
            <h2 class="card__title">Más información sobre este vendedor</h2>
            
            <div class="seller-stats__grid">
                <div class="seller-stats__main-avatar">
                    <img src="<?= htmlspecialchars($sellerAvatarSrc) ?>" alt="<?= htmlspecialchars($usuario['nombre']) ?>">
                </div>
                
                <div class="seller-stats__item">
                    <div class="stat-icon stat-icon--blue">
                        <i class="fa-solid fa-crown"></i>
                    </div>
                    <h4 class="seller-stats__label">Nivel de Servicio</h4>
                    <span class="seller-stats__value seller-stats__value--badge-blue">Plataforma</span>
                </div>

                <div class="seller-stats__item">
                    <div class="stat-icon stat-icon--purple">
                        <i class="fa-solid fa-shield"></i>
                    </div>
                    <h4 class="seller-stats__label">Vendedor Estrella</h4>
                    <span class="seller-stats__value seller-stats__value--badge-purple">Nivel 3</span>
                </div>

                <div class="seller-stats__item">
                    <div class="stat-icon stat-icon--light">
                        <span class="stat-icon__text-rating">
                            <i class="fa-regular fa-star"></i> <?= number_format((float) ($usuario['reputacion'] ?? 5.00), 2) ?>
                        </span>
                    </div>
                    <h4 class="seller-stats__label">Reseñas</h4>
                    <span class="seller-stats__stars">★★★★★</span>
                </div>
            </div>

            <!-- Descripción del Perfil del Vendedor -->
            <div class="seller-stats__description">
                <h4 class="seller-stats__description-title">Sobre este vendedor</h4>
                <p class="seller-stats__description-text">
                    <?= !empty($usuario['descripcion']) ? htmlspecialchars($usuario['descripcion']) : 'Vendedor confiable con excelentes referencias y productos de calidad. Comunícate para más detalles.' ?>
                </p>
            </div>
        </article>

        <!-- Comentarios del Vendedor -->
        <article class="reviews card">
            <header class="reviews__header">
                <h2 class="card__title">Comentarios del Vendedor (12)</h2>
                <div class="reviews__filter">
                    <select class="reviews__select">
                        <option>Filtro: Todas las valoraciones</option>
                    </select>
                </div>
            </header>

            <div class="review-item">
                <div class="review-item__header">
                    <div class="review-item__user">
                        <i class="fa-solid fa-circle-user"></i>
                        <span class="review-item__name">Juan Carlos Pérez</span>
                        <span class="review-item__date">• Hace 2 semanas</span>
                    </div>
                    <span class="review-item__verified">Compra Verificada</span>
                </div>
                <p class="review-item__text">
                    Excelente producto, llegó en perfecto estado. El vendedor fue muy atento con todas mis preguntas y el empaque fue de muy buena calidad. Definitivamente volvería a comprar con este vendedor. ¡Recomendado!
                </p>
            </div>
        </article>

    </section>

</main>

<?php require_once ROOT_PATH . '/app/layouts/footer.php'; ?>
