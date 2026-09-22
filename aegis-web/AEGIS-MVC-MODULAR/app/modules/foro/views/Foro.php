<?php
$pageTitle = 'AEGIS | Foro';
$pageStylesheet = asset('Assets/css/pages/forum.css');
require_once ROOT_PATH . '/app/layouts/head.php';
require_once ROOT_PATH . '/app/layouts/navbar.php';
?>

<main class="forum-page">

    <!-- SIDEBAR IZQUIERDO (simulado) -->
    <aside class="sidebar-left">
        <div class="sidebar-card">
            <div class="sidebar-search">
                <input type="text" placeholder="Buscar conversación" aria-label="Buscar conversación">
                <i class="fa-solid fa-magnifying-glass"></i>
            </div>

            <nav class="side-nav">
                <a class="active" href="<?= url('/foro') ?>"><i class="fa-solid fa-house"></i> Principal</a>
                <a href="<?= url('/foro') ?>"><i class="fa-solid fa-arrow-trend-up"></i> Popular</a>
            </nav>

            <div class="side-section">
                <h4>Temas</h4>
                <a href="<?= url('/productos') ?>">Celulares</a>
                <a href="<?= url('/productos') ?>">Computadores</a>
                <a href="<?= url('/productos') ?>">Televisores</a>
                <a href="<?= url('/productos') ?>">Componentes</a>
                <a href="<?= url('/productos') ?>">Gaming</a>
                <a href="<?= url('/productos') ?>">Más</a>
            </div>

            <div class="side-section">
                <a href="#">Reglas del foro</a>
                <a href="#">Política de privacidad</a>
                <a href="#">Términos y condiciones</a>
                <a href="#">Ayuda</a>
            </div>
        </div>
    </aside>

    <!-- FEED -->
    <section class="feed">

        <?php if (!empty($_SESSION['error'])): ?>
            <div class="auth-alert auth-alert--error">
                <?= htmlspecialchars($_SESSION['error']) ?>
            </div>
            <?php unset($_SESSION['error']); ?>
        <?php endif; ?>

        <?php if (!empty($_SESSION['success'])): ?>
            <div class="auth-alert auth-alert--success">
                <?= htmlspecialchars($_SESSION['success']) ?>
            </div>
            <?php unset($_SESSION['success']); ?>
        <?php endif; ?>

        <?php if (Auth::check()): ?>
            <div class="create-post" id="createPostTrigger">
                <?php
                    $me = Auth::user();
                    $fotoPerfilMe = trim((string) ($me['foto_perfil'] ?? ''));
                    $fotoPathMe = ROOT_PATH . '/public/Assets/uploads/users/' . basename($fotoPerfilMe);
                    $avatarSrcMe = (is_file($fotoPathMe) && $fotoPerfilMe !== '')
                        ? url('/Assets/uploads/users/' . $fotoPerfilMe)
                        : avatar_url($me['username'] ?? $me['email'] ?? 'yo', 100);
                ?>
                <img src="<?= htmlspecialchars($avatarSrcMe) ?>" alt="Tu perfil">
                <input type="text" readonly placeholder="Publica aquí tu pregunta o experiencia..." id="createPostInput">
                <button type="button" id="createPostBtn" aria-label="Nueva publicación">
                    <i class="fa-regular fa-image"></i>
                </button>
            </div>

            <form method="POST" action="<?= url('/foro/publicar') ?>" class="create-post-panel" id="createPostPanel">
                <div>
                    <label for="titulo">Título del anuncio</label>
                    <input type="text" id="titulo" name="titulo" required placeholder="¿Alguien sabe si...?">
                </div>
                <div>
                    <label for="contenido">Contenido</label>
                    <textarea id="contenido" name="contenido" required placeholder="Comparte tu duda o experiencia..."></textarea>
                </div>
                <div class="create-post-actions">
                    <button type="submit" class="btn-primary">Publicar</button>
                    <button type="button" class="btn-secondary" id="cancelCreatePost">Cancelar</button>
                </div>
            </form>
        <?php else: ?>
            <div class="feed-empty">
                <a href="<?= url('/login') ?>" style="color:#4338ca;font-weight:600;">Inicia sesión</a> para publicar y comentar.
            </div>
        <?php endif; ?>

        <?php if (empty($publicaciones)): ?>
            <div class="feed-empty">
                Aún no hay publicaciones. ¡Sé el primero en preguntar!
            </div>
        <?php endif; ?>

        <?php foreach (($publicaciones ?? []) as $post): ?>
            <?php
            $postComentarios = $comentarios[$post['id']] ?? [];
            $totalComentarios = count($postComentarios);
            $autorMostrar = !empty($post['username']) ? $post['username'] : $post['nombre'];
            $avatarSeed = $post['username'] ?? $post['email'] ?? $post['nombre'];
            $fotoPerfilAutor = trim((string) ($post['foto_perfil'] ?? ''));
            $fotoPathAutor = ROOT_PATH . '/public/Assets/uploads/users/' . basename($fotoPerfilAutor);
            $autorAvatarSrc = (is_file($fotoPathAutor) && $fotoPerfilAutor !== '')
                ? url('/Assets/uploads/users/' . $fotoPerfilAutor)
                : avatar_url($avatarSeed, 100);
            $reacciones = reacciones_simuladas((int) $post['id']);
            ?>

            <article class="post">
                <div class="post-header">
                    <img src="<?= htmlspecialchars($autorAvatarSrc) ?>" alt="<?= htmlspecialchars($autorMostrar) ?>">
                    <div>
                        <h3><?= htmlspecialchars($autorMostrar) ?></h3>
                        <span><?= tiempo_relativo($post['fecha_publicacion']) ?> • Foro AEGIS</span>
                    </div>
                    <div class="post-header-actions">
                        <?php if (Auth::check() && (int) $post['usuario_id'] === Auth::id()): ?>
                            <a href="<?= url('/foro/editar?id=' . (int) $post['id']) ?>" class="edit-post-btn" title="Editar publicación">
                                <i class="fa-regular fa-pen-to-square"></i>
                            </a>
                        <?php endif; ?>
                        <button type="button" class="save-btn" aria-label="Guardar publicación">
                            <i class="fa-regular fa-bookmark"></i>
                        </button>
                    </div>
                </div>

                <h2><?= htmlspecialchars($post['titulo']) ?></h2>

                <p class="post-body"><?= nl2br(htmlspecialchars($post['contenido'])) ?></p>

                <div class="post-actions">
                    <button type="button" class="reaction-btn" aria-label="Me gusta">
                        <i class="fa-regular fa-heart"></i> <?= $reacciones ?>
                    </button>
                    <button type="button" class="comment-count-btn" aria-label="Comentarios">
                        <i class="fa-regular fa-comment"></i> <?= $totalComentarios ?>
                    </button>
                    <button type="button" class="share-btn" aria-label="Compartir">
                        <i class="fa-solid fa-share-nodes"></i> Compartir
                    </button>
                </div>

                <?php if ($totalComentarios > 0): ?>
                    <div class="comments">
                        <?php foreach ($postComentarios as $comentario): ?>
                            <?php
                            $nombreComentario = !empty($comentario['username']) ? $comentario['username'] : $comentario['nombre'];
                            $seedComentario = $comentario['username'] ?? $comentario['nombre'];
                            $fotoPerfilComentario = trim((string) ($comentario['foto_perfil'] ?? ''));
                            $fotoPathComentario = ROOT_PATH . '/public/Assets/uploads/users/' . basename($fotoPerfilComentario);
                            $comentarioAvatarSrc = (is_file($fotoPathComentario) && $fotoPerfilComentario !== '')
                                ? url('/Assets/uploads/users/' . $fotoPerfilComentario)
                                : avatar_url($seedComentario, 50);
                            ?>
                            <div class="comment">
                                <img src="<?= htmlspecialchars($comentarioAvatarSrc) ?>" alt="<?= htmlspecialchars($nombreComentario) ?>">
                                <div>
                                    <strong><?= htmlspecialchars($nombreComentario) ?></strong>
                                    <p><?= htmlspecialchars($comentario['comentario']) ?></p>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <?php if (Auth::check()): ?>
                    <form method="POST" action="<?= url('/foro/comentar') ?>" class="create-comment-form">
                        <input type="hidden" name="publicacion_id" value="<?= (int) $post['id'] ?>">
                        <?php
                            $me = Auth::user();
                            $fotoPerfilMe2 = trim((string) ($me['foto_perfil'] ?? ''));
                            $fotoPathMe2 = ROOT_PATH . '/public/Assets/uploads/users/' . basename($fotoPerfilMe2);
                            $avatarSrcMe2 = (is_file($fotoPathMe2) && $fotoPerfilMe2 !== '')
                                ? url('/Assets/uploads/users/' . $fotoPerfilMe2)
                                : avatar_url($me['username'] ?? $me['email'] ?? 'yo', 50);
                        ?>
                        <img src="<?= htmlspecialchars($avatarSrcMe2) ?>" alt="Tu perfil">
                        <input type="text" name="comentario" required placeholder="Escribe un comentario..." maxlength="500">
                        <button type="submit">Publicar</button>
                    </form>
                <?php endif; ?>
            </article>
        <?php endforeach; ?>

    </section>

    <!-- SIDEBAR DERECHO (simulado) -->
    <aside class="sidebar-right">
        <div class="widget">
            <h3>Tendencias</h3>
            <ul>
                <li>#RTX5070</li>
                <li>#Cyberpunk2077</li>
                <li>#Ryzen9000</li>
                <li>#iPhone17</li>
                <li>#Windows12</li>
            </ul>
        </div>

        <div class="widget">
            <h3>Miembros destacados</h3>
            <?php if (!empty($miembrosDestacados)): ?>
                <?php foreach ($miembrosDestacados as $miembro): ?>
                    <?php $nombreMiembro = !empty($miembro['username']) ? $miembro['username'] : $miembro['nombre']; ?>
                    <?php
                        $fotoPerfilMiembro = trim((string) ($miembro['foto_perfil'] ?? ''));
                        $fotoPathMiembro = ROOT_PATH . '/public/Assets/uploads/users/' . basename($fotoPerfilMiembro);
                        $miembroAvatarSrc = (is_file($fotoPathMiembro) && $fotoPerfilMiembro !== '')
                            ? url('/Assets/uploads/users/' . $fotoPerfilMiembro)
                            : avatar_url($miembro['username'] ?? $miembro['nombre'], 60);
                    ?>
                    <div class="member">
                        <img src="<?= htmlspecialchars($miembroAvatarSrc) ?>" alt="<?= htmlspecialchars($nombreMiembro) ?>">
                        <span><?= htmlspecialchars($nombreMiembro) ?></span>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <div class="member">
                    <img src="<?= avatar_url('tech', 60) ?>" alt="TechGuruPro">
                    <span>TechGuruPro</span>
                </div>
                <div class="member">
                    <img src="<?= avatar_url('gpu', 60) ?>" alt="GPUExpert">
                    <span>GPUExpert</span>
                </div>
                <div class="member">
                    <img src="<?= avatar_url('mobile', 60) ?>" alt="MobileReview">
                    <span>MobileReview</span>
                </div>
            <?php endif; ?>
        </div>

        <div class="widget promo">
            <h3>Oferta Especial</h3>
            <p>Hasta 50% de descuento en tecnología seleccionada.</p>
            <button type="button">Comprar ahora</button>
        </div>
    </aside>

</main>

<?php if (Auth::check()): ?>
<script>
(function () {
    const panel = document.getElementById('createPostPanel');
    const trigger = document.getElementById('createPostTrigger');
    const openBtn = document.getElementById('createPostBtn');
    const openInput = document.getElementById('createPostInput');
    const cancelBtn = document.getElementById('cancelCreatePost');

    function openPanel() {
        panel.classList.add('is-open');
        document.getElementById('titulo').focus();
    }

    function closePanel() {
        panel.classList.remove('is-open');
    }

    if (trigger) trigger.addEventListener('click', openPanel);
    if (openBtn) openBtn.addEventListener('click', function (e) { e.stopPropagation(); openPanel(); });
    if (openInput) openInput.addEventListener('click', function (e) { e.stopPropagation(); openPanel(); });
    if (cancelBtn) cancelBtn.addEventListener('click', closePanel);
})();
</script>
<?php endif; ?>

<?php require_once ROOT_PATH . '/app/layouts/footer.php'; ?>
