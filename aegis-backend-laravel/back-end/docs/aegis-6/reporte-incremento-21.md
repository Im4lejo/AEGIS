# Incremento 21: búsqueda unificada

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `bc2182b912fa1dd7048e84ecb35656c1d4dc8c14`.
- Estado inicial: limpio.
- Tag `6.0.0` no existe localmente.

## Base de datos

- Conexión local: MySQL `127.0.0.1:3306`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento21.sql` (112,556 bytes).
- Migración:
  - `2026_11_23_000022_create_unified_search`
- Crea búsquedas guardadas, historial, preferencias y alertas.

## API

- `GET /api/busqueda`
- `GET /api/busqueda/sugerencias`
- `GET /api/busqueda/tendencias`
- `GET/POST/DELETE /api/busqueda/guardadas`
- `GET /api/busqueda/recentes`
- `POST /api/busqueda/preferencia`
- `GET /api/busqueda/recomendaciones`

## React

- Ruta `/busqueda`.
- Pestañas Todos/Productos/Publicaciones/Personas/Comunidades.
- Autocompletado con debounce.
- Tendencias y criterios explicables.
- Navbar dirige a búsqueda global.

## Pruebas

- Laravel completo: 107 pruebas, 520 aserciones.
- Búsqueda: 4 pruebas, 27 aserciones.
- React UI: 17 pruebas.
- React build: exitoso.

## Estado final

Hecho con SQL. Motor dedicado no agregado sin evidencia de escala.
