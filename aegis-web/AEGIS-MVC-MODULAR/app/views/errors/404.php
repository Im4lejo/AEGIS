<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Página No Encontrada</title>
    <link rel="stylesheet" href="<?= asset('Assets/global/global.css') ?>">
    <style>
        .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }

        .error-code {
            font-size: 120px;
            font-weight: 800;
            margin: 0;
            opacity: 0.8;
        }

        .error-message {
            font-size: 32px;
            font-weight: 700;
            margin: 20px 0;
        }

        .error-description {
            font-size: 18px;
            opacity: 0.9;
            margin-bottom: 40px;
            max-width: 500px;
        }

        .error-btn {
            background: white;
            color: #667eea;
            padding: 14px 32px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            transition: 0.3s;
        }

        .error-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1 class="error-code">404</h1>
        <h2 class="error-message">Página No Encontrada</h2>
        <p class="error-description">
            Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <a href="<?= url('/home') ?>" class="error-btn">Volver al Inicio</a>
    </div>
</body>
</html>
