<?php
$pageTitle = 'AEGIS | Publicar Producto';
$pageStylesheet = asset('Assets/css/pages/publish.css');
require_once ROOT_PATH . '/app/layouts/head.php';
require_once ROOT_PATH . '/app/layouts/navbar.php';

$seller = Auth::user() ?? [];
$sellerName = trim(($seller['nombre'] ?? '') . ' ' . ($seller['apellido'] ?? ''));
$sellerName = $sellerName !== '' ? $sellerName : ($seller['username'] ?? 'Vendedor AEGIS');
$sellerPhoto = trim((string) ($seller['foto_perfil_url'] ?? $seller['foto_perfil'] ?? ''));
$sellerPhotoScheme = parse_url($sellerPhoto, PHP_URL_SCHEME);

if ($sellerPhoto !== '' && in_array($sellerPhotoScheme, ['http', 'https'], true)) {
    $sellerAvatar = $sellerPhoto;
} else {
    $sellerPhotoFile = basename($sellerPhoto);
    $sellerPhotoPath = ROOT_PATH . '/public/Assets/uploads/users/' . $sellerPhotoFile;
    $sellerAvatar = $sellerPhotoFile !== '' && is_file($sellerPhotoPath)
        ? url('/Assets/uploads/users/' . $sellerPhotoFile)
        : avatar_url($seller['username'] ?? $seller['email'] ?? 'aegis', 100);
}

$sellerCity = $seller['ciudad'] ?? 'Medellín';
?>

<main class="publish-workspace">
    <section class="publish-editor-panel">
        <form id="publishForm" method="POST" action="<?= url('/productos/guardar') ?>" enctype="multipart/form-data">
            <header class="publish-editor-header">
                <a class="publish-back-link" href="<?= url('/productos') ?>" aria-label="Volver a productos">
                    <i class="fa-solid fa-arrow-left"></i>
                </a>
                <div>
                    <p class="publish-eyebrow">AEGIS Marketplace</p>
                    <h1>Publicar producto</h1>
                    <p class="publish-intro">Completa los detalles y revisa cómo verán tu anuncio.</p>
                </div>
            </header>

            <?php if (!empty($_SESSION['error'])): ?>
                <div class="auth-alert auth-alert--error" role="alert">
                    <?= htmlspecialchars($_SESSION['error']) ?>
                </div>
                <?php unset($_SESSION['error']); ?>
            <?php endif; ?>

            <section class="publish-form-section publish-photo-section">
                <div class="publish-section-heading">
                    <div>
                        <span class="publish-step">01</span>
                        <h2>Fotos del producto</h2>
                    </div>
                    <span class="publish-photo-count" id="photoCount">0/1</span>
                </div>
                <p class="publish-field-hint">Agrega una foto principal clara; aparecerá en la vista previa.</p>

                <label class="publish-dropzone" id="publishDropzone" for="imagen_principal">
                    <input
                        class="publish-file-input"
                        type="file"
                        id="imagen_principal"
                        name="imagen_principal"
                        accept="image/*"
                        aria-describedby="photoMessage"
                    >
                    <span class="publish-upload-placeholder" id="uploadPlaceholder">
                        <span class="publish-upload-icon"><i class="fa-solid fa-arrow-up-from-bracket"></i></span>
                        <strong>Añadir foto</strong>
                        <span>Haz clic o arrastra una imagen aquí</span>
                        <small>JPG, PNG o WebP</small>
                    </span>
                    <img class="publish-upload-preview" id="uploadPreview" alt="Vista previa de la foto del producto" hidden>
                </label>
                <div class="publish-photo-controls">
                    <p class="publish-field-hint" id="photoMessage" aria-live="polite">La foto se mostrará en el anuncio.</p>
                    <button class="publish-remove-photo" id="removePhoto" type="button" hidden>Quitar foto</button>
                </div>
            </section>

            <section class="publish-form-section">
                <div class="publish-section-heading">
                    <div>
                        <span class="publish-step">02</span>
                        <h2>Información del producto</h2>
                    </div>
                </div>

                <div class="publish-field">
                    <label for="titulo">Título del anuncio <span>Obligatorio</span></label>
                    <input
                        type="text"
                        id="titulo"
                        name="titulo"
                        maxlength="150"
                        required
                        placeholder="Ej. Portátil gamer AEGIS"
                    >
                </div>

                <div class="publish-field">
                    <label for="categoria_id">Categoría <span>Obligatorio</span></label>
                    <select id="categoria_id" name="categoria_id" required>
                        <option value="" selected disabled>Selecciona una categoría</option>
                        <?php foreach (($categorias ?? []) as $categoria): ?>
                            <option value="<?= (int) $categoria['id'] ?>">
                                <?= htmlspecialchars($categoria['nombre']) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="publish-field-grid">
                    <div class="publish-field">
                        <label for="precio">Precio (COP) <span>Obligatorio</span></label>
                        <div class="publish-price-input">
                            <span>$</span>
                            <input type="number" id="precio" name="precio" min="1" step="0.01" required placeholder="0">
                        </div>
                    </div>

                    <div class="publish-field">
                        <label for="estado">Estado</label>
                        <select id="estado" name="estado">
                            <option value="nuevo">Nuevo</option>
                            <option value="usado" selected>Usado</option>
                            <option value="reacondicionado">Reacondicionado</option>
                        </select>
                    </div>
                </div>

                <div class="publish-field">
                    <label for="ciudad">Ciudad</label>
                    <input
                        type="text"
                        id="ciudad"
                        name="ciudad"
                        maxlength="100"
                        value="<?= htmlspecialchars($sellerCity) ?>"
                        placeholder="¿Dónde está el producto?"
                    >
                </div>

                <div class="publish-field">
                    <label for="descripcion">Descripción</label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        rows="5"
                        placeholder="Describe el estado, las características y lo que incluye..."
                    ></textarea>
                </div>
            </section>

            <footer class="publish-form-footer">
                <p>Al publicar, aceptas las normas de compra y venta segura de AEGIS.</p>
                <button type="submit" class="publish-submit">
                    <i class="fa-solid fa-bag-shopping"></i>
                    Publicar producto
                </button>
            </footer>
        </form>
    </section>

    <section class="publish-preview-panel" aria-label="Vista previa de la publicación">
        <div class="publish-preview-heading">
            <div>
                <span class="publish-preview-indicator"><i class="fa-solid fa-eye"></i></span>
                <div>
                    <p class="publish-eyebrow">Así lo verán los compradores</p>
                    <h2>Vista previa</h2>
                </div>
            </div>
            <span class="publish-preview-badge"><i class="fa-solid fa-globe"></i> Público</span>
        </div>

        <article class="listing-preview">
            <div class="listing-preview-image" id="previewImageFrame">
                <img id="previewImage" alt="" hidden>
                <div class="listing-preview-empty" id="previewEmpty">
                    <span><i class="fa-regular fa-image"></i></span>
                    <strong>Vista previa del producto</strong>
                    <p>La foto que agregues aparecerá aquí.</p>
                </div>
                <span class="listing-preview-condition" id="previewConditionBadge">Usado</span>
            </div>

            <div class="listing-preview-details">
                <p class="listing-preview-category" id="previewCategory">Categoría del producto</p>
                <h3 id="previewTitle">Título del producto</h3>
                <p class="listing-preview-price" id="previewPrice">Precio</p>
                <p class="listing-preview-location">
                    <i class="fa-solid fa-location-dot"></i>
                    Publicado ahora en <span id="previewCity"><?= htmlspecialchars($sellerCity) ?></span>
                </p>

                <div class="listing-preview-divider"></div>
                <h4>Detalles</h4>
                <p class="listing-preview-description" id="previewDescription">La descripción aparecerá aquí.</p>

                <div class="listing-preview-divider"></div>
                <h4>Información del vendedor</h4>
                <div class="listing-preview-seller">
                    <img src="<?= htmlspecialchars($sellerAvatar) ?>" alt="">
                    <div>
                        <strong><?= htmlspecialchars($sellerName) ?></strong>
                        <span>Vendedor de AEGIS</span>
                    </div>
                    <i class="fa-solid fa-circle-check" aria-label="Cuenta de AEGIS"></i>
                </div>
                <button class="listing-preview-contact" type="button" disabled>Vista previa del contacto</button>
            </div>
        </article>

        <p class="publish-preview-note">
            <i class="fa-solid fa-shield-halved"></i>
            Coordina la entrega en un punto físico verificado de AEGIS.
        </p>
    </section>
</main>

<script>
(() => {
    const form = document.getElementById('publishForm');
    const title = document.getElementById('titulo');
    const category = document.getElementById('categoria_id');
    const price = document.getElementById('precio');
    const condition = document.getElementById('estado');
    const city = document.getElementById('ciudad');
    const description = document.getElementById('descripcion');
    const imageInput = document.getElementById('imagen_principal');
    const dropzone = document.getElementById('publishDropzone');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewImage = document.getElementById('previewImage');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const previewEmpty = document.getElementById('previewEmpty');
    const photoCount = document.getElementById('photoCount');
    const photoMessage = document.getElementById('photoMessage');
    const removePhoto = document.getElementById('removePhoto');
    let imageUrl = null;

    const setText = (id, value) => {
        document.getElementById(id).textContent = value;
    };

    const updatePreview = () => {
        setText('previewTitle', title.value.trim() || 'Título del producto');
        setText('previewCategory', category.value ? category.selectedOptions[0].textContent : 'Categoría del producto');
        setText('previewPrice', price.value ? new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 2,
        }).format(Number(price.value)) : 'Precio');
        setText('previewConditionBadge', condition.selectedOptions[0].textContent);
        setText('previewCity', city.value.trim() || 'tu ciudad');
        setText('previewDescription', description.value.trim() || 'La descripción aparecerá aquí.');
    };

    const clearImage = () => {
        if (imageUrl) {
            URL.revokeObjectURL(imageUrl);
            imageUrl = null;
        }

        imageInput.value = '';
        uploadPreview.removeAttribute('src');
        previewImage.removeAttribute('src');
        uploadPreview.hidden = true;
        previewImage.hidden = true;
        uploadPlaceholder.hidden = false;
        previewEmpty.hidden = false;
        removePhoto.hidden = true;
        photoCount.textContent = '0/1';
        photoMessage.textContent = 'La foto se mostrará en el anuncio.';
    };

    const setImage = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            clearImage();
            photoMessage.textContent = 'Selecciona un archivo de imagen válido.';
            return;
        }

        if (imageUrl) URL.revokeObjectURL(imageUrl);
        imageUrl = URL.createObjectURL(file);
        uploadPreview.src = imageUrl;
        previewImage.src = imageUrl;
        uploadPreview.hidden = false;
        previewImage.hidden = false;
        uploadPlaceholder.hidden = true;
        previewEmpty.hidden = true;
        removePhoto.hidden = false;
        photoCount.textContent = '1/1';
        photoMessage.textContent = file.name;
    };

    form.addEventListener('input', updatePreview);
    form.addEventListener('change', updatePreview);
    imageInput.addEventListener('change', () => setImage(imageInput.files[0]));
    removePhoto.addEventListener('click', clearImage);

    dropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropzone.classList.add('is-dragging');
    });

    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-dragging'));
    dropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropzone.classList.remove('is-dragging');
        const file = event.dataTransfer.files[0];
        if (!file) return;

        const transfer = new DataTransfer();
        transfer.items.add(file);
        imageInput.files = transfer.files;
        setImage(file);
    });

    updatePreview();
})();
</script>

<?php require_once ROOT_PATH . '/app/layouts/footer.php'; ?>
