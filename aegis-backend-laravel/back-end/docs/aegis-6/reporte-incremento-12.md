# Incremento 12: descubrimiento del marketplace

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `0c60f96239fc2c1850fdbc2fdd8097ba0d527c25`.
- Estado inicial: limpio.
- El tag `6.0.0` no existía localmente.
- No se ejecutaron operaciones destructivas ni reconstrucción de historia.

## Base de datos

- Conexión local: MySQL `127.0.0.1:3306`, base `aegis_db`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento12.sql` (72,492 bytes).
- Migración aplicada:
  - `2026_11_23_000013_add_marketplace_discovery`
- Añade búsquedas, comparaciones e índices por ubicación, recencia y precio.

## API

- `GET /api/productos` admite precio mínimo/máximo, ubicación, marca, atributos, recencia y relevancia.
- `GET /api/productos/comparar?ids=1,2`
- `GET /api/productos/{id}/similares`
- Las búsquedas se registran sin contenido sensible.

## React

- Filtros avanzados y chips activos.
- URL hash reproducible con filtros.
- Preferencia local de filtros.
- Selección comparadora 2–4 y tabla responsive.

## Rendimiento

- Dataset controlado de 500 productos en SQLite de pruebas.
- Filtros combinados completaron en menos de 1.5 segundos en el entorno.
- No se sembraron productos permanentes en la base local.

## Pruebas

- Laravel completo anterior: 68 pruebas aprobadas, 352 aserciones.
- Descubrimiento final: 5 pruebas aprobadas, 17 aserciones.
- React UI: 17 pruebas aprobadas.
- React build: exitoso; persiste advertencia de bundle superior a 500 KB.

## Estado final

Hecho para descubrimiento, filtros compartibles, comparación y sugerencias deterministas.
