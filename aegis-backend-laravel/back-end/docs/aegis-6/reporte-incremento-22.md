# Incremento 22: personalización avanzada

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `bc29472168ca7370be01a77f751fab9d42847741`.
- Estado inicial: limpio.
- Tag `6.0.0` no existe localmente.

## Base de datos

- Conexión local: MySQL `127.0.0.1:3306`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento22.sql` (116,776 bytes).
- Migración:
  - `2026_11_23_000023_create_user_preferences`

## API

- `GET /api/preferencias/defaults`
- `GET /api/preferencias`
- `PUT /api/preferencias`
- `POST /api/preferencias/restablecer`

## React

- Nueva ruta `/ajustes`.
- Categorías Apariencia, Feed, Marketplace, Mensajería, Privacidad, Notificaciones, Seguridad, Accesibilidad y Datos.
- Guardado real y restablecimiento.
- Preferencias OS y vistas compactas de CSS.

## Pruebas

- Laravel completo: 111 pruebas, 535 aserciones.
- Preferencias: 4 pruebas, 15 aserciones.
- React UI: 17 pruebas.
- React build: exitoso.

## Estado final

Hecho para persistencia y validación. Pendiente: sincronización en tiempo real multi-pestaña y auditoría visual completa AA.
