# Incremento 11: marketplace completo

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `67938775e3c9edaf42e8f17436b9a3be4f469e18`.
- Estado inicial: limpio.
- El tag `6.0.0` no existía localmente.
- No se ejecutaron operaciones destructivas ni reconstrucción de historia.

## Base de datos

- Conexión local: MySQL `127.0.0.1:3306`, base `aegis_db`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento11.sql` (70,257 bytes).
- Migraciones:
  - `2026_11_23_000010_extend_marketplace_lifecycle`
  - `2026_11_23_000011_normalize_product_state_column`
  - `2026_11_23_000012_allow_partial_marketplace_drafts`
- Añade atributos, ubicación aproximada, fechas de estado/renovación, estadísticas almacenadas e historial.

## API

- Conservados `GET /api/productos` y `POST /api/productos`.
- `precio_max=0` ya filtra correctamente.
- `GET /api/productos/mis`
- `GET /api/productos/mis/estadisticas`
- `PATCH /api/productos/{id}/estado`
- `POST /api/productos/{id}/renovar`

## React

- Mis productos incluye tabs por estado y resumen básico.
- Publicación protege doble envío y permite precio cero.
- Vista previa, atributos e imágenes permanecen integrados en el formulario existente.

## Pruebas

- Laravel completo: 64 pruebas aprobadas, 339 aserciones.
- Marketplace: 6 pruebas aprobadas, 31 aserciones.
- React UI: 17 pruebas aprobadas.
- React build: exitoso; persiste advertencia de bundle superior a 500 KB.

## Estado final

Hecho para CRUD de anuncios, borradores y estados. Pendientes: edición masiva avanzada y métricas externas reales.
