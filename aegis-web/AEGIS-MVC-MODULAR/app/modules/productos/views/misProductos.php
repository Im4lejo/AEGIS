<?php require_once ROOT_PATH . '/app/layouts/head.php'; ?>
<?php require_once ROOT_PATH . '/app/layouts/navbar.php'; ?>

<main style="max-width:1100px;margin:30px auto;padding:0 20px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h1 style="margin:0;">Mis productos</h1>
        <a href="<?= url('/productos/crear') ?>" style="background:#2563EB;color:#fff;padding:10px 14px;border-radius:8px;">Nuevo</a>
    </div>

    <table style="width:100%;background:#fff;border-radius:12px;padding:10px;border-collapse:collapse;">
        <thead>
            <tr>
                <th style="text-align:left;padding:10px;">Título</th>
                <th style="text-align:left;padding:10px;">Precio</th>
                <th style="text-align:left;padding:10px;">Estado</th>
                <th style="text-align:left;padding:10px;">Acciones</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach (($productos ?? []) as $producto): ?>
                <tr>
                    <td style="padding:10px;"><?= htmlspecialchars($producto['titulo']) ?></td>
                    <td style="padding:10px;">$<?= number_format((float) $producto['precio'], 0, ',', '.') ?></td>
                    <td style="padding:10px;"><?= htmlspecialchars($producto['estado_publicacion']) ?></td>
                    <td style="padding:10px;">
                        <a href="<?= url('/productos/detalle?id=' . (int) $producto['id']) ?>">Ver</a>
                        <form method="POST" action="<?= url('/productos/eliminar') ?>" style="display:inline;">
                            <input type="hidden" name="id" value="<?= (int) $producto['id'] ?>">
                            <button type="submit" style="border:none;background:none;color:#DC2626;cursor:pointer;">Eliminar</button>
                        </form>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</main>

<?php require_once ROOT_PATH . '/app/layouts/footer.php'; ?>
