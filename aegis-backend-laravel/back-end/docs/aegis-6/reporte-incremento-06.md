# Incremento 06: perfiles completos y actividad social

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `983ed5a438cbde24096160d1bcf09e4ae`.
- Estado inicial: limpio.
- El tag `6.0.0` no existía localmente; no pudo verificarse relación con HEAD.
- No se usaron comandos de reconstrucción ni modificación de historia.

## Base de datos

- Conexión local: MySQL `127.0.0.1:3306`, base `aegis_db`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento06.sql` (39,870 bytes).
- Migración aplicada:
  - `2026_11_23_000005_create_social_profile_tables`
- Añade URL pública, ciudad aproximada, privacidad, seguimiento de presencia y publicación fijada.
- Crea enlaces, seguimientos, bloqueos/silencios y desactivaciones con retención.

## API

- `GET/PATCH /api/perfil/me`
- `POST /api/perfil/me/desactivar`
- `GET /api/perfil/{usuario}`
- `GET /api/perfil/{usuario}/tabs/{tab}`
- `POST/DELETE /api/perfil/{usuario}/seguir`
- `POST/DELETE /api/perfil/{usuario}/restriccion`

Las pestañas válidas son `publicaciones`, `productos`, `comunidades`, `resenas` e `informacion`.

## React

- Perfil propio carga datos reales y guarda descripción/privacidad.
- Se añadieron pestañas y paginación al perfil público.
- Avatar y portada reutilizan los endpoints de media.
- Diseño móvil conserva acciones y avatar apilados.

## Pruebas

- Laravel completo: 41 pruebas aprobadas, 213 aserciones.
- Perfil social: 5 pruebas aprobadas, 30 aserciones.
- React UI: 17 pruebas aprobadas.
- React build: exitoso.
- Sin captura manual: no había navegador compartido.

## Estado final

Hecho para identidad social/comercial base. Deuda: comunidades reales y reseñas publicables dependen de dominios todavía no implementados.
