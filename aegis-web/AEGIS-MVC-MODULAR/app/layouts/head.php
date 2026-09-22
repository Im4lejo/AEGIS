<!DOCTYPE html>
<html lang="es">

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title><?= htmlspecialchars($pageTitle ?? 'AEGIS') ?></title>

    <link rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">

    <link rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">

    <link rel="stylesheet"
          href="<?= asset('Assets/global/global.css') ?>">

    <?php if (!empty($pageStylesheet)): ?>
    <link rel="stylesheet" href="<?= htmlspecialchars($pageStylesheet) ?>">
    <?php endif; ?>

</head>

<body>