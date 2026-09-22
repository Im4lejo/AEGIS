<?php
$pageTitle = 'AEGIS | Publicar Producto';
$pageStylesheet = asset('Assets/css/pages/publish.css');
require_once ROOT_PATH . '/app/layouts/head.php';
require_once ROOT_PATH . '/app/layouts/navbar.php';
?>

<main class="main-content publish-page">

    <form id="publishForm" method="POST" action="<?= url('/productos/guardar') ?>" enctype="multipart/form-data">

        <div class="publish-header">

            <div class="publish-title">

                <a href="<?= url('/productos') ?>" aria-label="Volver a productos">
                    <i class="fa-solid fa-arrow-left"></i>
                </a>

                <h1>Publicación</h1>

            </div>

            <button type="submit" class="publish-btn">
                Publicar
            </button>

        </div>

        <?php if (!empty($_SESSION['error'])): ?>
            <div class="auth-alert auth-alert--error">
                <?= htmlspecialchars($_SESSION['error']) ?>
            </div>
            <?php unset($_SESSION['error']); ?>
        <?php endif; ?>

        <section class="publish-card">

            <div class="images-section">

                <h2>1. Imágenes</h2>

                <div class="images-container">

                    <div class="main-image" role="presentation">

                        <label for="imagen_principal" style="cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;">
                            <i class="fa-regular fa-image"></i>
                            <span>Añadir Foto Principal</span>
                        </label>
                        <input type="file" id="imagen_principal" name="imagen_principal" accept="image/*" style="display:none;">

                    </div>

                    <div class="small-images">

                        <div class="small-box" role="presentation">
                            <i class="fa-solid fa-plus"></i>
                        </div>

                        <div class="small-box" role="presentation">
                            <i class="fa-solid fa-plus"></i>
                        </div>

                        <div class="small-box" role="presentation">
                            <i class="fa-solid fa-plus"></i>
                        </div>

                        <div class="small-box" role="presentation">
                            <i class="fa-solid fa-plus"></i>
                        </div>

                    </div>

                </div>

            </div>

            <div class="info-section">

                <h2>2. Información Básica</h2>

                <div class="input-group">
                    <label for="titulo">Título del anuncio</label>
                    <input type="text" id="titulo" name="titulo" required placeholder="Ej. Tarjeta gráfica RTX 4070">
                </div>

                <div class="input-group">
                    <label for="categoria_id">Categoría</label>
                    <select id="categoria_id" name="categoria_id" required>
                        <?php foreach (($categorias ?? []) as $categoria): ?>
                            <option value="<?= (int) $categoria['id'] ?>">
                                <?= htmlspecialchars($categoria['nombre']) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="input-group">
                    <label for="estado">Estado</label>
                    <select id="estado" name="estado">
                        <option value="nuevo">Nuevo</option>
                        <option value="usado">Usado</option>
                        <option value="reacondicionado">Reacondicionado</option>
                    </select>
                </div>

            </div>

        </section>

        <section class="details-card">

            <h2>3. Detalles del Intercambio</h2>

            <div class="double-grid">

                <div class="input-group">
                    <label for="precio">Precio Referencial</label>
                    <input type="number" id="precio" name="precio" min="1" step="0.01" required placeholder="COP 0.00">
                </div>

                <div class="input-group">
                    <label for="ciudad">Ciudad</label>
                    <input type="text" id="ciudad" name="ciudad" value="Medellín" placeholder="Medellín">
                </div>

            </div>

            <div class="input-group">
                <label for="descripcion">Descripción (Opcional)</label>
                <textarea id="descripcion" name="descripcion" placeholder="Especificaciones opcionales..."></textarea>
            </div>

        </section>

    </form>

</main>

<?php require_once ROOT_PATH . '/app/layouts/footer.php'; ?>
