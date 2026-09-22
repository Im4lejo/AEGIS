<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AEGIS - Iniciar Sesión</title>
    <link rel="stylesheet" href="<?= asset('Assets/css/pages/login.css') ?>">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>

    <div class="container">

        <div class="left-panel">

            <div class="security-wrapper">

                <div class="security-icon">

                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M7 11V8C7 5.2 9.2 3 12 3C14.8 3 17 5.2 17 8V11"
                            stroke="#1DD1A1"
                            stroke-width="1.8"
                            stroke-linecap="round"/>

                        <rect x="5" y="11" width="14" height="10" rx="2"
                            stroke="#1DD1A1"
                            stroke-width="1.8"/>
                    </svg>

                </div>

                <h1>Acceso Seguro</h1>

                <p>
                    Tu cuenta está protegida por
                    encriptaciones y múltiples sistemas de
                    seguridad y autenticacion.
                </p>

                <div class="security-card">

                    <h3>Indicadores de Seguridad</h3>

                    <div class="security-item">

                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12"
                                stroke="#1DD1A1"
                                stroke-width="2.4"
                                stroke-linecap="round"
                                stroke-linejoin="round"/>
                        </svg>

                        <span>256-bit SSL encriptación</span>

                    </div>

                    <div class="security-item">

                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12"
                                stroke="#1DD1A1"
                                stroke-width="2.4"
                                stroke-linecap="round"
                                stroke-linejoin="round"/>
                        </svg>

                        <span>Alertas de inicio de sesión</span>

                    </div>

                    <div class="security-item">

                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12"
                                stroke="#1DD1A1"
                                stroke-width="2.4"
                                stroke-linecap="round"
                                stroke-linejoin="round"/>
                        </svg>

                        <span>Monitoreo en sesión activa</span>

                    </div>

                </div>

            </div>

        </div>

        <div class="right-panel">

            <div class="form-container">

                <a href="<?= url('/home') ?>" class="back-home">
                    ← Volver al inicio
                </a>

                <h2>Bienvenido de nuevo</h2>

                <?php if (!empty($_SESSION['error'])): ?>
                    <div class="auth-alert auth-alert--error">
                        <?= htmlspecialchars($_SESSION['error']) ?>
                    </div>
                    <?php unset($_SESSION['error']); ?>
                <?php endif; ?>

                <?php if (!empty($_SESSION['success'])): ?>
                    <div class="auth-alert auth-alert--success">
                        <?= htmlspecialchars($_SESSION['success']) ?>
                    </div>
                    <?php unset($_SESSION['success']); ?>
                <?php endif; ?>

                <form method="POST" action="<?= url('/login') ?>" id="loginForm">

                    <div class="input-group">

                        <label for="email">Correo electronico</label>

                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Alex@gmail.com"
                            required
                        >

                    </div>

                    <div class="input-group">

                        <label for="password">Contraseña</label>

                        <div class="password-wrapper">

                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Contraseña"
                                required
                                minlength="6"
                            >

                            <div class="eye-icon" id="togglePassword" role="button" tabindex="0" aria-label="Mostrar contraseña">

                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M2 12C2 12 5.5 6 12 6C18.5 6 22 12 22 12C22 12 18.5 18 12 18C5.5 18 2 12 2 12Z"
                                        stroke="#7B7B7B"
                                        stroke-width="1.8"/>

                                    <circle cx="12" cy="12" r="3"
                                        stroke="#7B7B7B"
                                        stroke-width="1.8"/>
                                </svg>

                            </div>

                        </div>

                    </div>

                    <button type="submit" class="login-btn">

                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M7 11V8C7 5.2 9.2 3 12 3C14.8 3 17 5.2 17 8V11"
                                stroke="white"
                                stroke-width="2"
                                stroke-linecap="round"/>

                            <rect x="5" y="11" width="14" height="10" rx="2"
                                stroke="white"
                                stroke-width="2"/>
                        </svg>

                        Iniciar Sesión

                    </button>

                </form>

                <p class="register-hint">
                    ¿No tienes cuenta?
                    <a href="<?= url('/register') ?>">Regístrate</a>
                </p>

            </div>

        </div>

    </div>

    <script>
        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');

        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', function () {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
            });
        }
    </script>

</body>
</html>
