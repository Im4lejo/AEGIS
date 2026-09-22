<?php require_once ROOT_PATH . '/app/layouts/head.php'; ?>
<?php require_once ROOT_PATH . '/app/layouts/navbar.php'; ?>

<main style="max-width:800px;margin:30px auto;padding:0 20px;">
    <h1>Editar perfil</h1>
    <form method="POST" action="<?= url('/perfil/editar') ?>" style="background:#fff;padding:16px;border-radius:12px;">
        <label>Nombre</label>
        <input type="text" value="<?= htmlspecialchars($usuario['nombre'] ?? '') ?>" disabled style="width:100%;padding:10px;margin:6px 0 12px;border:1px solid #D1D5DB;border-radius:8px;">

        <label>Email</label>
        <input type="email" value="<?= htmlspecialchars($usuario['email'] ?? '') ?>" disabled style="width:100%;padding:10px;margin:6px 0 12px;border:1px solid #D1D5DB;border-radius:8px;">

        <label>Descripción</label>
        <textarea name="descripcion" rows="4" style="width:100%;padding:10px;margin:6px 0 12px;border:1px solid #D1D5DB;border-radius:8px;"><?= htmlspecialchars($usuario['descripcion'] ?? '') ?></textarea>

        <label>Ciudad</label>
        <input type="text" name="ciudad" value="<?= htmlspecialchars($usuario['ciudad'] ?? '') ?>" style="width:100%;padding:10px;margin:6px 0 12px;border:1px solid #D1D5DB;border-radius:8px;">

        <label>Teléfono</label>
        <input type="text" name="telefono" value="<?= htmlspecialchars($usuario['telefono'] ?? '') ?>" style="width:100%;padding:10px;margin:6px 0 12px;border:1px solid #D1D5DB;border-radius:8px;">

        <button type="submit" style="background:#2563EB;color:#fff;border:none;padding:10px 14px;border-radius:8px;">Guardar</button>
    </form>
</main>

<?php require_once ROOT_PATH . '/app/layouts/footer.php'; ?>
