<?php require_once ROOT_PATH . '/app/layouts/head.php'; ?>
<?php require_once ROOT_PATH . '/app/layouts/navbar.php'; ?>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<link rel="stylesheet" href="<?= asset('css/pages/perfil.css') ?>">

<main class="page">
    <section class="profile-card">
        <div class="cover"></div>

        <div class="profile-body">
        <div class="profile-row">
            <div class="avatar-profile-wrap">
                <form id="avatarForm" method="POST" action="<?= url('/perfil/editar') ?>" enctype="multipart/form-data">
                    <div class="avatar-profile">
                    <?php
                        $fotoPerfil = trim((string) ($usuario['foto_perfil'] ?? ''));
                        $rutaFoto = ROOT_PATH . '/public/Assets/uploads/users/' . $fotoPerfil;
                        $avatarSrc = (!empty($fotoPerfil) && file_exists($rutaFoto))
                            ? url('/Assets/uploads/users/' . htmlspecialchars($fotoPerfil))
                            : avatar_url($usuario['username'] ?? $usuario['email'] ?? 'perfil', 140);
                    ?>
                    <img id="avatarPreview" src="<?= htmlspecialchars($avatarSrc) ?>" alt="Foto de perfil">
                </div>

                    <?php if (!empty($esPropio)): ?>
                        <label for="fotoPerfilInput" class="avatar-edit-btn" title="Cambiar foto de perfil">
                            <i class="fa-solid fa-camera"></i>
                        </label>
                        <input type="file" id="fotoPerfilInput" name="foto_perfil" accept="image/*" style="display:none;">
                    <?php endif; ?>
                </form>
            </div>

            <div class="profile-info">
                <div class="profile-name"><?= htmlspecialchars(trim(($usuario['nombre'] ?? '') . ' ' . ($usuario['apellido'] ?? ''))) ?></div>
                <div class="profile-handle">@<?= htmlspecialchars($usuario['username'] ?? $usuario['email'] ?? 'usuario') ?></div>
                <div style="margin-top:12px; display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
                    <span class="chip">Reputación: <?= number_format((float) ($usuario['reputacion'] ?? 5), 1) ?></span>
                    <?php if (!empty($esPropio)): ?>
                        <a href="<?= url('/perfil/editar') ?>" class="btn-alt">Editar perfil</a>
                    <?php endif; ?>
                </div>
            </div>
        </div>

            <div class="badges-row">
                <a href="#" class="badge-item">
                    <span class="badge-icon">
                        <svg viewBox="0 0 24 24" stroke-width="1.8" width="20" height="20"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/></svg>
                    </span>
                    <div>
                        <span class="badge-label">Nivel de Servicio</span>
                        <span class="badge-sub">Plataforma</span>
                    </div>
                </a>

                <a href="#" class="badge-item">
                    <span class="badge-icon gold">
                        <svg viewBox="0 0 24 24" stroke-width="1.8" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </span>
                    <div>
                        <span class="badge-label">Vendedor Estrella</span>
                        <span class="badge-sub">Nivel 3</span>
                    </div>
                </a>

                <a href="#" class="badge-item">
                    <span class="badge-icon star-outline">
                        <svg viewBox="0 0 24 24" stroke-width="1.8" width="20" height="20"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </span>
                    <div>
                        <span class="badge-rating"><?= number_format((float) ($usuario['reputacion'] ?? 5), 1) ?></span>
                        <span class="stars">★★★★☆</span>
                        <span class="badge-label">Reseñas</span>
                    </div>
                </a>
            </div>
        </div><!-- profile-body -->
    </section>

    <div class="content">
        <div class="left-col">
            <section class="info-card">
                <div class="info-section-title">Descripción</div>
                <div class="info-desc"><?= nl2br(htmlspecialchars($usuario['descripcion'] ?? 'Sin descripción disponible.')) ?></div>
                <div class="info-row">
                    <span class="info-row-label">Ciudad</span>
                    <span class="info-row-value"><?= htmlspecialchars($usuario['ciudad'] ?? 'No definida') ?></span>
                </div>
                <div class="info-row">
                    <span class="info-row-label">Correo</span>
                    <span class="info-row-value"><?= htmlspecialchars($usuario['email'] ?? '-') ?></span>
                </div>
                <div class="info-row">
                    <span class="info-row-label">Registrado</span>
                    <span class="info-row-value"><?= htmlspecialchars(date('d/m/Y', strtotime($usuario['fecha_registro'] ?? date('Y-m-d')))) ?></span>
                </div>
                <div class="info-row">
                    <span class="info-row-label">Teléfono</span>
                    <span class="info-row-value"><?= htmlspecialchars($usuario['telefono'] ?? 'No disponible') ?></span>
                </div>
            </section>

            <section class="pub-card">
                <div class="pub-header">
                    <span class="pub-header-title">Publicaciones</span>
                    <a href="<?= url('/foro') ?>" class="sort-btn">Ver foro</a>
                </div>

                <?php if (empty($publicaciones)): ?>
                    <div class="pub-item" style="grid-template-columns:1fr;">
                        <div class="pub-content">
                            <div class="pub-text">No hay publicaciones para este perfil.</div>
                        </div>
                    </div>
                <?php endif; ?>

                <?php foreach ($publicaciones as $pub):
                    $autorMostrar = htmlspecialchars($usuario['username'] ?? ($usuario['nombre'] ?? 'Usuario'));
                    $reacciones = function_exists('reacciones_simuladas') ? reacciones_simuladas((int)$pub['id']) : 0;
                ?>
                    <a href="<?= url('/foro') ?>" class="pub-item">
                        <img class="pub-avatar" src="<?= htmlspecialchars($avatarSrc) ?>" alt="<?= $autorMostrar ?>">
                        <div class="pub-content">
                            <div class="pub-meta">
                                <div class="pub-author"><?= $autorMostrar ?></div>
                                <div class="pub-timestamp"><?= function_exists('tiempo_relativo') ? tiempo_relativo($pub['fecha_publicacion'] ?? date('Y-m-d')) : htmlspecialchars(date('d/m/Y', strtotime($pub['fecha_publicacion'] ?? date('Y-m-d')))) ?> • Foro AEGIS</div>
                            </div>
                            <h3 class="pub-post-title"><?= htmlspecialchars($pub['titulo'] ?? 'Publicación') ?></h3>
                            <p class="pub-text"><?= nl2br(htmlspecialchars(mb_strimwidth($pub['contenido'] ?? '', 0, 220, '...'))) ?></p>
                            <div class="pub-actions">
                                <span class="pub-action"><i class="fa-regular fa-heart"></i> <?= number_format($reacciones) ?></span>
                                <span class="pub-action"><i class="fa-solid fa-message"></i> Ver foro</span>
                            </div>
                        </div>
                    </a>
                <?php endforeach; ?>
            </section>
        </div>

        <div class="right-col">
            <section class="profile-products-card">
                <div class="products-header">
                    <span class="products-title">Productos del Vendedor</span>
                    <a href="<?= url('/productos') ?>" class="sort-btn">Ver todos</a>
                </div>

                <div class="profile-products-grid">
                    <?php if (empty($productos)): ?>
                        <div class="pub-item" style="grid-template-columns:1fr;">
                            <div class="pub-content">
                                <div class="pub-text">Este usuario no tiene productos publicados aún.</div>
                            </div>
                        </div>
                    <?php endif; ?>

                    <?php foreach ($productos as $producto): 
                        $estado = $producto['estado_producto'] ?? 'usado';
                        $etiqueta = 'Producto';
                        $claseEtiqueta = 'tag-usado';

                        if ($estado === 'nuevo') {
                            $etiqueta = 'Nuevo';
                            $claseEtiqueta = 'tag-nuevo';
                        } elseif ($estado === 'casi-nuevo') {
                            $etiqueta = 'Casi Nuevo';
                        } elseif ($estado === 'usado-buen-estado') {
                            $etiqueta = 'Buen Estado';
                        } elseif ($estado === 'usado-detalles') {
                            $etiqueta = 'Con Detalles';
                        } elseif ($estado === 'usado-mal-estado') {
                            $etiqueta = 'Mal Estado';
                        }
                        $imagenUrl = !empty($producto['imagen_principal'])
                            ? asset('Assets/uploads/products/' . $producto['imagen_principal'])
                            : 'https://via.placeholder.com/340x220?text=Sin+Imagen';
                    ?>
                        <a href="<?= url('/productos/detalle?id=' . (int) $producto['id']) ?>" class="profile-product-card">
                            <div class="product-image-container">
                                    <div class="product-image">
                                        <img src="<?= htmlspecialchars($imagenUrl) ?>" alt="<?= htmlspecialchars($producto['titulo']) ?>">
                                    </div>
                                </div>
                            <div class="product-details">
                                <span class="product-condition <?= htmlspecialchars($claseEtiqueta) ?>"><?= htmlspecialchars($etiqueta) ?></span>
                                <h3 class="product-title"><?= htmlspecialchars($producto['titulo']) ?></h3>
                                <div class="price-row">
                                    <span class="product-price">COP <?= number_format((float)$producto['precio'], 0, ',', '.') ?></span>
                                </div>
                                <span class="seller-meta"><?= htmlspecialchars($producto['categoria_nombre'] ?? 'Categoría') ?></span>
                                <span class="add-to-cart-btn">Ver detalle</span>
                            </div>
                        </a>
                    <?php endforeach; ?>
                </div>
            </section>
        </div>
    </div>
</main>

<?php require_once ROOT_PATH . '/app/layouts/footer.php'; ?>

<script>
    const fotoPerfilInput = document.getElementById('fotoPerfilInput');
    const avatarPreview = document.getElementById('avatarPreview');

    if (fotoPerfilInput) {
        fotoPerfilInput.addEventListener('change', function () {
            if (!this.files || this.files.length === 0) {
                return;
            }

            const file = this.files[0];
            const reader = new FileReader();

            reader.onload = function (event) {
                avatarPreview.src = event.target.result;
            };

            reader.readAsDataURL(file);
            document.getElementById('avatarForm').submit();
        });
    }
</script>