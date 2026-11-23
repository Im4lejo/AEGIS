# ADR-0006: Autorización granular y privacidad base

## Estado

Aprobada para el Incremento 04.

## Decisión

- `Usuario.rol` identifica el papel base; no reemplaza la autorización por recurso.
- El estado `activo/suspendido/baneado` es una prohibición efectiva independiente del rol.
- Los productos y publicaciones tienen visibilidad `publica`, `privada` o `grupo_privado`.
- La propiedad se determina por `usuario_id` en productos/publicaciones y `owner_id` en puntos físicos.
- `permisos_delegados` representa capacidades específicas por usuario y recurso. Es la base de permisos comunitarios sin crear una tabla general de roles por convención.
- Laravel Gates son la fuente servidor para leer, editar, eliminar, moderar y administrar.
- React recibe un resumen de capacidades únicamente para ergonomía. El servidor revalida todos los cambios.
- Las acciones administrativas relevantes generan entradas en `auditoria_accesos`.

## Consecuencias

- Los valores públicos antiguos reciben visibilidad pública por defecto.
- Las publicaciones privadas requieren dueño, administrador o permiso delegado para lectura.
- Los usuarios suspendidos o baneados pierden operaciones protegidas y se revocan sus sesiones al cambiar su cuenta desde administración.
- La autorización no depende de rutas ocultas en React.
