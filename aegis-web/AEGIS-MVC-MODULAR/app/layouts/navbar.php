<header class="navbar">
    <div class="nav-left">
        <div class="logo">
            <div class="logo-icon">
                <i class="fa-solid fa-shield-halved"></i>
            </div>
            <span>AEGIS</span>
        </div>

        <nav class="nav-links">
            <a href="<?= url('/home') ?>">Inicio</a>
            <a href="<?= url('/productos') ?>">Productos</a>
            <a href="<?= url('/foro') ?>">Foro</a>
            <?php if (Auth::check()): ?>
                <a href="<?= url('/productos/crear') ?>">Publicar</a>
                <a href="<?= url('/puntos-fisicos') ?>">Puntos físicos</a>
            <?php endif; ?>
        </nav>
    </div>

    <div class="nav-right">
        <?php if (Auth::check()): ?>
            <div class="profile-dropdown">
                <button class="profile-btn">
                    <?php
                        $user = Auth::user();
                        $fotoPerfil = trim((string) ($user['foto_perfil'] ?? ''));
                        $fotoPath = ROOT_PATH . '/public/Assets/uploads/users/' . basename($fotoPerfil);
                        $avatarSrc = (is_file($fotoPath) && $fotoPerfil !== '')
                            ? url('/Assets/uploads/users/' . $fotoPerfil)
                            : avatar_url($user['username'] ?? $user['email'] ?? 'aegis', 100);
                    ?>
                    <img src="<?= htmlspecialchars($avatarSrc) ?>" alt="Usuario">
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
                <div class="dropdown-menu">
                    <a href="<?= url('/perfil') ?>"><i class="fa-regular fa-user"></i> Mi perfil</a>
                    <?php if (Auth::isAdmin()): ?>
                        <a href="<?= url('/admin') ?>"><i class="fa-solid fa-shield"></i> Panel admin</a>
                    <?php endif; ?>
                    <a href="<?= url('/logout') ?>" class="logout"><i class="fa-solid fa-right-from-bracket"></i> Salir</a>
                </div>
            </div>
        <?php else: ?>
            <a href="<?= url('/login') ?>" style="margin-right:12px;">Iniciar sesión</a>
            <a href="<?= url('/register') ?>">Registro</a>
        <?php endif; ?>
    </div>
</header>