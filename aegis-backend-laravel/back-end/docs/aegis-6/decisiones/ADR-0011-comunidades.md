# ADR-0011: Comunidades como dominio contextual

## Estado

Aprobada para el Incremento 09.

## Decisión

- Las comunidades reutilizan `Usuario` y `publicaciones_foro`; no crean una identidad paralela.
- Los roles owner/moderador/miembro existen solo dentro de `membresias_comunidad`.
- Visibilidad puede ser pública, privada o por invitación.
- Las solicitudes e invitaciones usan estados de membresía.
- Los posts comunitarios pueden usar el campo `comunidad_id`.
- Acciones de moderación quedan registradas en `acciones_comunidad`.

## Consecuencias

- Un moderador comunitario no recibe permisos globales ni acceso a mensajes privados.
- El directorio público excluye comunidades privadas.
- Los feeds y enlaces directos excluyen contenido privado sin membresía activa.
