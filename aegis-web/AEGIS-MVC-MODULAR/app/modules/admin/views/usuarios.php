<?php require_once ROOT_PATH . '/app/layouts/head.php'; ?>
<?php require_once ROOT_PATH . '/app/layouts/navbar.php'; ?>

<main style="max-width:1100px;margin:30px auto;padding:0 20px;">
    <h1>Usuarios</h1>
    <table style="width:100%;background:#fff;border-radius:12px;border-collapse:collapse;">
        <thead>
            <tr><th style="text-align:left;padding:10px;">Nombre</th><th style="text-align:left;padding:10px;">Email</th><th style="text-align:left;padding:10px;">Rol</th><th style="text-align:left;padding:10px;">Estado</th><th style="padding:10px;">Acción</th></tr>
        </thead>
        <tbody>
            <?php foreach (($usuarios ?? []) as $u): ?>
                <tr>
                    <td style="padding:10px;"><?= htmlspecialchars($u['nombre'] . ' ' . $u['apellido']) ?></td>
                    <td style="padding:10px;"><?= htmlspecialchars($u['email']) ?></td>
                    <td style="padding:10px;"><?= htmlspecialchars($u['rol']) ?></td>
                    <td style="padding:10px;"><?= htmlspecialchars($u['estado']) ?></td>
                    <td style="padding:10px;">
                        <form method="POST" action="<?= url('/admin/usuario/estado') ?>">
                            <input type="hidden" name="id" value="<?= (int) $u['id'] ?>">
                            <select name="estado">
                                <option value="activo">activo</option>
                                <option value="suspendido">suspendido</option>
                                <option value="baneado">baneado</option>
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
