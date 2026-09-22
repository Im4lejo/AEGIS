<?php require_once ROOT_PATH . '/app/layouts/head.php'; ?>
<?php require_once ROOT_PATH . '/app/layouts/navbar.php'; ?>

<main style="max-width:1100px;margin:30px auto;padding:0 20px;">
    <h1>Puntos físicos verificados</h1>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;">
        <?php foreach (($puntos ?? []) as $punto): ?>
            <article style="background:#fff;border-radius:12px;padding:14px;">
                <h3 style="margin:0 0 6px;"><?= htmlspecialchars($punto['nombre']) ?></h3>
                <p style="margin:0 0 6px;color:#6B7280;"><?= htmlspecialchars($punto['ciudad']) ?></p>
                <p style="margin:0;"><?= htmlspecialchars($punto['direccion']) ?></p>
            </article>
        <?php endforeach; ?>
    </div>
</main>

<?php require_once ROOT_PATH . '/app/layouts/footer.php'; ?>
