# ADR-0013: Ciclo de vida de anuncios

## Estado

Aprobada para el Incremento 11.

## Decisión

- `productos` conserva `/api/productos` y añade estados aditivos.
- Estados: borrador, activo, pausado, reservado, vendido, archivado y oculto.
- Solo el propietario o admin puede cambiar el estado.
- Publicar exige categoría, título, descripción, precio, condición e imagen.
- Los borradores pueden tener campos parciales.
- Las transiciones se registran en `historial_producto`.
- Las renovaciones mantienen compatibilidad con activos existentes.

## Consecuencias

- `precio_max=0` incluye anuncios gratuitos.
- Los estados históricos `activo/vendido/oculto` siguen siendo válidos.
- La API ya no usa `estado_publicacion` como enum cerrado.
