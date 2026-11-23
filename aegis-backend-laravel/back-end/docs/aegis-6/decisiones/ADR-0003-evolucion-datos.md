# ADR-0003: evolución de datos y media sin DDL en incremento 00

- Estado: Aceptado.
- Fecha: 2026-11-23

## Contexto

El esquema local usa MySQL 8.4.3 en loopback, tiene registros y reside en una instancia compartida con otras bases de desarrollo. Las 17 migraciones ya están aplicadas. `imagenes_producto` guarda URLs pero no `public_id` Cloudinary, a diferencia de imágenes de publicaciones de foro.

## Decisión

No ejecutar DDL ni transformaciones de datos durante auditoría. Toda evolución futura requiere conexión destino confirmada, inventario/backup verificable cuando haya datos que conservar, migración incremental reversible, prueba SQLite y verificación MySQL. Tratar el `public_id` faltante como deuda a resolver en un incremento de media.

## Consecuencias

- Mantener filas y columnas actuales; no reconstruir tablas ni limpiar datos.
- La posible columna `public_id` empieza nullable y no se backfillea si la URL no identifica sin ambigüedad un objeto Cloudinary.
- Cambios de índices se justifican con consulta y medición, no por intuición.
- Las pruebas automatizadas siguen aisladas en SQLite en memoria.
