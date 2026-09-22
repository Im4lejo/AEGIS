<?php require_once ROOT_PATH . '/app/layouts/head.php'; ?>
<?php require_once ROOT_PATH . '/app/layouts/navbar.php'; ?>

<main style="max-width:1100px;margin:30px auto;padding:0 20px;">
    <h1>Encuentros del punto físico</h1>
    <table style="width:100%;background:#fff;border-radius:12px;border-collapse:collapse;">
        <thead>
            <tr><th style="text-align:left;padding:10px;">Producto</th><th style="text-align:left;padding:10px;">Fecha</th><th style="text-align:left;padding:10px;">Participantes</th><th style="text-align:left;padding:10px;">Estado</th><th style="text-align:left;padding:10px;">Acción</th></tr>
        </thead>
        <tbody>
            <?php foreach (($encuentros ?? []) as $e): ?>
                <tr>
                    <td style="padding:10px;"><?= htmlspecialchars($e['producto_titulo']) ?></td>
                    <td style="padding:10px;"><?= htmlspecialchars($e['fecha_encuentro']) ?> <?= htmlspecialchars($e['hora_encuentro']) ?></td>
                    <td style="padding:10px;"><?= htmlspecialchars($e['comprador_nombre']) ?> / <?= htmlspecialchars($e['vendedor_nombre']) ?></td>
                    <td style="padding:10px;"><?= htmlspecialchars($e['estado']) ?></td>
                    <td style="padding:10px;">
                        <form method="POST" action="<?= url('/puntos-fisicos/encuentro/estado') ?>">
                            <input type="hidden" name="id" value="<?= (int) $e['id'] ?>">
                            <select name="estado">
                                <option value="pendiente">pendiente</option>
                                <option value="confirmado">confirmado</option>
                                <option value="cancelado">cancelado</option>
                                <option value="finalizado">finalizado</option>
                            </select>
                            <button type="submit">Guardar</button>
                        </form>
                        <a href="<?= url('/puntos-fisicos/qr?encuentro=' . (int) $e['id']) ?>">QR</a>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</main>

<?php require_once ROOT_PATH . '/app/layouts/footer.php'; ?>
