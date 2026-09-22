<?php require_once ROOT_PATH . '/app/layouts/head.php'; ?>
<?php require_once ROOT_PATH . '/app/layouts/navbar.php'; ?>

<main style="max-width:1100px;margin:30px auto;padding:0 20px;">
    <h1>Dashboard punto físico</h1>
    <?php if (!$punto): ?>
        <p>No tienes punto físico configurado todavía.</p>
        <a href="<?= url('/puntos-fisicos/configuracion') ?>" style="background:#2563EB;color:#fff;padding:8px 12px;border-radius:8px;">Configurar ahora</a>
    <?php else: ?>
        <section style="background:#fff;border-radius:12px;padding:14px;margin-bottom:14px;">
            <h2 style="margin-top:0;"><?= htmlspecialchars($punto['nombre']) ?></h2>
            <p><?= htmlspecialchars($punto['direccion']) ?> - <?= htmlspecialchars($punto['ciudad']) ?></p>
            <p>Estado: <strong><?= htmlspecialchars($punto['estado']) ?></strong></p>
        </section>

        <section style="background:#fff;border-radius:12px;padding:14px;">
            <h3>Próximos encuentros</h3>
            <?php foreach (($encuentros ?? []) as $e): ?>
                <div style="border-top:1px solid #E5E7EB;padding-top:8px;margin-top:8px;">
                    <strong><?= htmlspecialchars($e['producto_titulo']) ?></strong>
                    <p style="margin:4px 0;">Comprador: <?= htmlspecialchars($e['comprador_nombre']) ?> · Vendedor: <?= htmlspecialchars($e['vendedor_nombre']) ?></p>
                    <p style="margin:4px 0;"><?= htmlspecialchars($e['fecha_encuentro']) ?> <?= htmlspecialchars($e['hora_encuentro']) ?> · <?= htmlspecialchars($e['estado']) ?></p>
                </div>
            <?php endforeach; ?>
            <a href="<?= url('/puntos-fisicos/encuentros') ?>">Ver todos</a>
        </section>
    <?php endif; ?>
</main>

<?php require_once ROOT_PATH . '/app/layouts/footer.php'; ?>
