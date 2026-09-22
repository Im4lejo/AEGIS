# AEGIS

AEGIS es una plataforma web en PHP puro (MVC modular) para compra y venta segura de tecnología.

## Stack

- PHP 8.2
- PDO
- MySQL
- HTML/CSS/JS básico
- Sesiones PHP

## Estructura

```text
AEGIS/
├── app/
│   ├── core/
│   ├── layouts/
│   └── modules/
├── config/
├── database/
├── public/
└── routes/
```

## Configuración rápida

1. Importa `database/aegis.sql` en phpMyAdmin.
2. Verifica `config/database.php`.
3. Arranca Apache y MySQL en XAMPP.
4. Abre: `http://localhost/AEGIS/public/`

## Usuario administrador inicial

- Email: `admin@aegis.com`
- Password: `password`

## Notas

- Punto de entrada: `public/index.php`
- Rutas: `routes/web.php`
- Sin frameworks, sin ORM, sin Composer.
