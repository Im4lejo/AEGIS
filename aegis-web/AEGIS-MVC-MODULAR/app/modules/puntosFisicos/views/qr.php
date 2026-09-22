<?php require_once ROOT_PATH . '/app/layouts/head.php'; ?>
<?php require_once ROOT_PATH . '/app/layouts/navbar.php'; ?>

<main style="max-width:760px;margin:30px auto;padding:0 20px;">
    <h1>Código QR de encuentro</h1>
    <section style="background:#fff;border-radius:12px;padding:16px;">
        <p><strong>Producto:</strong> <?= htmlspecialchars($encuentro['producto_titulo']) ?></p>
        <p><strong>Punto:</strong> <?= htmlspecialchars($encuentro['punto_nombre']) ?></p>
        <p><strong>Fecha:</strong> <?= htmlspecialchars($encuentro['fecha_encuentro']) ?> <?= htmlspecialchars($encuentro['hora_encuentro']) ?></p>
        <p><strong>Estado encuentro:</strong> <?= htmlspecialchars($encuentro['estado']) ?></p>

        <?php if ($qr): ?>
            <div style="margin-top:14px;padding:12px;background:#F3F4F6;border-radius:8px;">
                <p style="margin:0 0 8px;"><strong>Token QR</strong></p>
                <code style="word-break:break-all;"><?= htmlspecialchars($qr['codigo']) ?></code>
                <p style="margin:8px 0 0;">Estado QR: <?= htmlspecialchars($qr['estado']) ?></p>
            </div>
        <?php else: ?>
            <p style="color:#B45309;">Este encuentro aún no tiene QR activo. Debe estar confirmado.</p>
        <?php endif; ?>
    </section>
</main>

<?php require_once ROOT_PATH . '/app/layouts/footer.php'; ?>
