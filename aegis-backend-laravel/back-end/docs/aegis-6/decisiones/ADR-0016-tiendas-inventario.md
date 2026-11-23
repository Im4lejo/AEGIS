# ADR-0016: Tiendas comerciales e inventario

## Estado

Aprobada para el Incremento 14.

## Decisión

- Tienda es una entidad comercial vinculada a `Usuario.owner_id`, no una cuenta separada.
- Los miembros usan roles contextuales owner/gestor/vendedor.
- Puntos físicos siguen siendo establecimientos independientes.
- Inventario se registra por producto y usa transacciones con bloqueo.
- Las verificaciones requieren solicitud, revisión admin y aprobación efectiva.
- Un badge público solo aparece con `estado_verificacion=aprobada`.

## Consecuencias

- El stock no puede quedar negativo.
- Reservar exige disponibilidad.
- La lista pública excluye borradores y estados no activos.
- Los documentos de verificación permanecen protegidos y no se exponen públicamente.
