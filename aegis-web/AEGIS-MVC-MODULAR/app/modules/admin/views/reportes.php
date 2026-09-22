<?php require_once ROOT_PATH . '/app/layouts/head.php'; ?>
<?php require_once ROOT_PATH . '/app/layouts/navbar.php'; ?>

<main style="max-width:1100px;margin:30px auto;padding:0 20px;">
    <h1>Reportes</h1>
    <table style="width:100%;background:#fff;border-radius:12px;border-collapse:collapse;">
        <thead>
            <tr><th style="text-align:left;padding:10px;">Reporta</th><th style="text-align:left;padding:10px;">Reportado</th><th style="text-align:left;padding:10px;">Motivo</th><th style="text-align:left;padding:10px;">Estado</th><th style="padding:10px;">Acción</th></tr>
        </thead>
        <tbody>
            <?php foreach (($reportes ?? []) as $r): ?>
                <tr>
                    <td style="padding:10px;"><?= htmlspecialchars($r['reporta_nombre']) ?></td>
                    <td style="padding:10px;"><?= htmlspecialchars($r['reportado_nombre']) ?></td>
                    <td style="padding:10px;"><?= htmlspecialchars($r['motivo']) ?></td>
                    <td style="padding:10px;"><?= htmlspecialchars($r['estado']) ?></td>
                    <td style="padding:10px;">
                        <form method="POST" action="<?= url('/admin/reporte/estado') ?>">
                            <input type="hidden" name="id" value="<?= (int) $r['id'] ?>">
                            <select name="estado">
                                <option value="pendiente">pendiente</option>
                                <option value="revisado">revisado</option>
                                <option value="resuelto">resuelto</option>
                            </select>
                            <button type="submit">Guardar</button>
                        </form>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</main>

<?php require_once ROOT_PATH . '/app/layouts/footer.php'; ?>
