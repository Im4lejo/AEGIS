# Incremento 18: reseñas elegibles

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `de563de95527fdd476040d1aa9ea6235dc8b4e94`.
- Estado inicial: limpio.
- Tag `6.0.0` no existe localmente.

## Base de datos

- Conexión local: MySQL `127.0.0.1:3306`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento18.sql` (105,324 bytes).
- Migración:
  - `2026_11_23_000019_harden_reviews`
- Añade ámbitos, estados, respuesta, edición, punto y agregados.

## API

- `GET /api/resenas/elegibles`
- `POST /api/resenas`
- `GET /api/resenas/{ambito}/{id}`
- `GET /api/resenas/{ambito}/{id}/resumen`
- `PATCH /api/resenas/{id}/editar`
- `PATCH /api/resenas/{id}/respuesta`
- `POST /api/resenas/{id}/disputa`

## React

- Pestaña Reseñas usa resumen comercial real.
- Cantidad/promedio no se infieren de redes sociales.

## Pruebas

- Laravel completo: 95 pruebas, 458 aserciones.
- Reseñas: 4 pruebas, 16 aserciones.
- React UI: 17 pruebas.
- React build: exitoso.

## Estado final

Hecho para elegibilidad, duplicación, edición, disputa y agregados.
