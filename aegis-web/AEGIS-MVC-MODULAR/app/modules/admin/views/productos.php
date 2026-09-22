<?php require_once ROOT_PATH . '/app/layouts/head.php'; ?>
<?php require_once ROOT_PATH . '/app/layouts/navbar.php'; ?>

<main style="max-width:1100px;margin:30px auto;padding:0 20px;">
    <h1>Productos</h1>
    <table style="width:100%;background:#fff;border-radius:12px;border-collapse:collapse;">
        <thead>
            <tr><th style="text-align:left;padding:10px;">Título</th><th style="text-align:left;padding:10px;">Precio</th><th style="text-align:left;padding:10px;">Ciudad</th><th style="text-align:left;padding:10px;">Estado</th></tr>
        </thead>
        <tbody>
            <?php foreach (($productos ?? []) as $p): ?>
                <tr>
                    <td style="padding:10px;"><?= htmlspecialchars($p['titulo']) ?></td>
                    <td style="padding:10px;">$<?= number_format((float) $p['precio'], 0, ',', '.') ?></td>
                    <td style="padding:10px;"><?= htmlspecialchars($p['ciudad']) ?></td>
                    <td style="padding:10px;"><?= htmlspecialchars($p['estado_publicacion']) ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</main>

<?php require_once ROOT_PATH . '/app/layouts/footer.php'; ?>
