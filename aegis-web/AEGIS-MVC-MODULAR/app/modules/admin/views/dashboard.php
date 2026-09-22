<?php require_once ROOT_PATH . '/app/layouts/head.php'; ?>
<?php require_once ROOT_PATH . '/app/layouts/navbar.php'; ?>

<main style="max-width:1100px;margin:30px auto;padding:0 20px;">
    <h1>Panel Admin</h1>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:14px;">
        <div style="background:#fff;border-radius:10px;padding:14px;"><strong>Usuarios</strong><p><?= (int) ($stats['usuarios'] ?? 0) ?></p></div>
        <div style="background:#fff;border-radius:10px;padding:14px;"><strong>Productos activos</strong><p><?= (int) ($stats['productos'] ?? 0) ?></p></div>
        <div style="background:#fff;border-radius:10px;padding:14px;"><strong>Reportes pendientes</strong><p><?= (int) ($stats['reportes'] ?? 0) ?></p></div>
        <div style="background:#fff;border-radius:10px;padding:14px;"><strong>Encuentros pendientes</strong><p><?= (int) ($stats['encuentros'] ?? 0) ?></p></div>
    </div>

    <div style="margin-top:14px;display:flex;gap:10px;">
        <a href="<?= url('/admin/usuarios') ?>" style="background:#2563EB;color:#fff;padding:8px 12px;border-radius:8px;">Usuarios</a>
        <a href="<?= url('/admin/productos') ?>" style="background:#2563EB;color:#fff;padding:8px 12px;border-radius:8px;">Productos</a>
        <a href="<?= url('/admin/reportes') ?>" style="background:#2563EB;color:#fff;padding:8px 12px;border-radius:8px;">Reportes</a>
    </div>
</main>

<?php require_once ROOT_PATH . '/app/layouts/footer.php'; ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Admin - AEGIS</title>
    <link rel="stylesheet" href="<?= asset('Assets/global/global.css') ?>">
    <link rel="stylesheet" href="<?= asset('Assets/css/pages/dashboard.css') ?>">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
</head>
<body>

<div class="dashboard-layout">

    <aside class="sidebar">
        <div class="logo">
            <div class="logo-icon">
                <i class="fa-solid fa-shield-halved" style="color: #4F46E5;"></i>
            </div>
            <span>AEGIS</span>
        </div>

        <div class="physical-point-card">
            <img src="https://via.placeholder.com/290x145?text=Admin" alt="Panel Admin">
            <div class="physical-point-info">
                <h3>Panel Administrativo</h3>
                <div class="point-status">
                    <span class="status-dot"></span>
                    <p>Sistema Activo</p>
                </div>
                <div class="rating">
                    <i class="fa-solid fa-star"></i>
                    <span>100%</span>
                </div>
            </div>
        </div>

        <nav class="sidebar-menu">
            <a href="<?= url('/admin') ?>" class="active">
                <i class="fa-solid fa-house"></i>
                Inicio
            </a>
            <a href="<?= url('/admin/usuarios') ?>">
                <i class="fa-solid fa-users"></i>
                Usuarios
            </a>
            <a href="<?= url('/admin/productos') ?>">
                <i class="fa-solid fa-box"></i>
                Productos
            </a>
            <a href="<?= url('/admin/reportes') ?>">
                <i class="fa-solid fa-flag"></i>
                Reportes
            </a>
        </nav>
    </aside>

    <main class="main-content">
        <header class="custom-navbar"></header>

        <section class="dashboard-content">
            <div class="dashboard-header">
                <div>
                    <h1>¡Bienvenido, Admin!</h1>
                    <p>Aquí tienes un resumen del sistema.</p>
                </div>
                <div class="date-box">
                    <i class="fa-regular fa-calendar"></i>
                    <?php echo date('d \d\e F \d\e Y'); ?>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue">
                        <i class="fa-solid fa-users"></i>
                    </div>
                    <div class="stat-info">
                        <h4>Usuarios Totales</h4>
                        <h2>1,234</h2>
                        <span class="positive">↑ 12% vs mes anterior</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon orange">
                        <i class="fa-solid fa-box"></i>
                    </div>
                    <div class="stat-info">
                        <h4>Productos Activos</h4>
                        <h2>856</h2>
                        <span class="positive">↑ 8% vs mes anterior</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon green">
                        <i class="fa-solid fa-flag"></i>
                    </div>
                    <div class="stat-info">
                        <h4>Reportes Pendientes</h4>
                        <h2>23</h2>
                        <span class="warning">Revisar ahora</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon purple">
                        <i class="fa-solid fa-chart-line"></i>
                    </div>
                    <div class="stat-info">
                        <h4>Transacciones Hoy</h4>
                        <h2>48</h2>
                        <span class="positive">↑ 15% vs ayer</span>
                    </div>
                </div>
            </div>

            <div class="middle-grid">
                <div class="meetings-card">
                    <div class="section-title">
                        <h3>Últimas Transacciones</h3>
                        <a href="<?= url('/admin') ?>">Ver todas</a>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Tipo</th>
                                <th>Monto</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Juan Pérez</td>
                                <td>Compra</td>
                                <td>$150,000</td>
                                <td><span class="badge confirmed">Completada</span></td>
                            </tr>
                            <tr>
                                <td>María López</td>
                                <td>Venta</td>
                                <td>$200,000</td>
                                <td><span class="badge confirmed">Completada</span></td>
                            </tr>
                            <tr>
                                <td>Carlos García</td>
                                <td>Compra</td>
                                <td>$75,000</td>
                                <td><span class="badge pending">Pendiente</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="activity-card">
                    <div class="section-title">
                        <h3>Actividad Reciente</h3>
                        <a href="#">Ver todo</a>
                    </div>
                    <div class="activity-list">
                        <div class="activity-item">
                            <div class="activity-icon success">
                                <i class="fa-solid fa-check"></i>
                            </div>
                            <div>
                                <h4>Usuario registrado</h4>
                                <p>Nuevo usuario: Andrea Martínez</p>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-icon blue-bg">
                                <i class="fa-solid fa-upload"></i>
                            </div>
                            <div>
                                <h4>Producto publicado</h4>
                                <p>Nuevo producto: iPhone 15</p>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-icon orange-bg">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <div>
                                <h4>Reporte nuevo</h4>
                                <p>Usuario #1234 reportado</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>
</div>

</body>
</html>
