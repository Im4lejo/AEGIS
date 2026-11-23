# ADR-0022: Notificaciones persistentes y preferencias

## Estado

Aprobada para el Incremento 20.

## Decisión

- `notificaciones` incorpora categoría, tipo, actor, objeto, destino y deduplicación.
- Seguridad crítica siempre conserva in-app.
- Social puede deshabilitar in-app, email y push.
- Email/push web no se activan sin proveedor configurado.
- El badge y bandeja consultan el backend.
- La preferencia controla nuevas emisiones, no elimina registros históricos.

## Consecuencias

- Los registros antiguos reciben categorías de sistema o seguridad según migración.
- El envío repetido usa clave dedupe por usuario.
