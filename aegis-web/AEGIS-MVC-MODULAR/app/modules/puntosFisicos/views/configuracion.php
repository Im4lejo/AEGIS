<?php require_once ROOT_PATH . '/app/layouts/head.php'; ?>
<?php require_once ROOT_PATH . '/app/layouts/navbar.php'; ?>

<main style="max-width:820px;margin:30px auto;padding:0 20px;">
    <h1>Configuración de punto físico</h1>
    <form method="POST" action="<?= url('/puntos-fisicos/guardar') ?>" style="background:#fff;border-radius:12px;padding:16px;">
        <label>Nombre del punto</label>
        <input type="text" name="nombre" required value="<?= htmlspecialchars($punto['nombre'] ?? '') ?>" style="width:100%;padding:10px;margin:6px 0 12px;border:1px solid #D1D5DB;border-radius:8px;">

        <label>Dirección</label>
        <input type="text" name="direccion" required value="<?= htmlspecialchars($punto['direccion'] ?? '') ?>" style="width:100%;padding:10px;margin:6px 0 12px;border:1px solid #D1D5DB;border-radius:8px;">

        <label>Ciudad</label>
        <input type="text" name="ciudad" required value="<?= htmlspecialchars($punto['ciudad'] ?? '') ?>" style="width:100%;padding:10px;margin:6px 0 12px;border:1px solid #D1D5DB;border-radius:8px;">

        <label>Teléfono</label>
        <input type="text" name="telefono" value="<?= htmlspecialchars($punto['telefono'] ?? '') ?>" style="width:100%;padding:10px;margin:6px 0 12px;border:1px solid #D1D5DB;border-radius:8px;">

        <label>Descripción</label>
        <textarea name="descripcion" rows="4" style="width:100%;padding:10px;margin:6px 0 12px;border:1px solid #D1D5DB;border-radius:8px;"><?= htmlspecialchars($punto['descripcion'] ?? '') ?></textarea>

        <button type="submit" style="background:#2563EB;color:#fff;border:none;padding:10px 14px;border-radius:8px;">Guardar</button>
    </form>
</main>

<?php require_once ROOT_PATH . '/app/layouts/footer.php'; ?>
