# Incremento 17: puntos físicos y QR

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `a50119801d21cb54a9dad4c030a8dc562a0b3023`.
- Estado inicial: limpio.
- Tag `6.0.0` no existe localmente.

## Base de datos

- Conexión local: MySQL `127.0.0.1:3306`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento17.sql` (102,458 bytes).
- Migración:
  - `2026_11_23_000018_extend_points_meetings_qr`

## API

- `GET /api/puntos-fisicos/directorio`
- `POST/PATCH /api/puntos-fisicos...`
- `GET/POST/PATCH /api/encuentros`
- `POST /api/encuentros/{id}/qr`
- `POST /api/encuentros/qr/validar`

## React

- Directorio consume puntos reales.
- Encuentro puede cargar puntos aprobados y crear solicitud.
- Flujo describe límites de seguridad.

## Pruebas

- Laravel completo: 91 pruebas, 442 aserciones.
- Puntos/QR: 4 pruebas, 11 aserciones.
- React UI: 17 pruebas.
- React build: exitoso.

## Estado final

Hecho para encuentros y QR con replay prevention.
