<?php
$pageTitle = 'AEGIS | Editar Publicación';
$pageStylesheet = asset('Assets/css/pages/forum.css');
require_once ROOT_PATH . '/app/layouts/head.php';
require_once ROOT_PATH . '/app/layouts/navbar.php';
?>

<main class="forum-edit-page">

    <?php if (!empty($_SESSION['error'])): ?>
        <div class="auth-alert auth-alert--error">
            <?= htmlspecialchars($_SESSION['error']) ?>
        </div>
        <?php unset($_SESSION['error']); ?>
    <?php endif; ?>

    <div class="publish-header">
        <div class="publish-title">
            <a href="<?= url('/foro') ?>" aria-label="Volver al foro">
                <i class="fa-solid fa-arrow-left"></i>
            </a>
            <h1>Editar publicación</h1>
        </div>
        <button type="submit" form="editarForm" class="publish-btn">
            Guardar cambios
        </button>
    </div>

    <form id="editarForm" method="POST" action="<?= url('/foro/actualizar') ?>" class="edit-card">
        <input type="hidden" name="id" value="<?= (int) ($publicacion['id'] ?? 0) ?>">

        <div>
            <label for="titulo">Título del anuncio</label>
            <input
                type="text"
                id="titulo"
                name="titulo"
                value="<?= htmlspecialchars($publicacion['titulo'] ?? '') ?>"
                required
                placeholder="Título de tu pregunta o tema..."
            >
        </div>

        <div>
            <label for="contenido">Contenido</label>
            <textarea
                id="contenido"
                name="contenido"
                required
                placeholder="Comparte tu duda o experiencia..."
            ><?= htmlspecialchars($publicacion['contenido'] ?? '') ?></textarea>
        </div>
    </form>

</main>

<?php require_once ROOT_PATH . '/app/layouts/footer.php'; ?>
