# ADR-0010: Interacciones sociales y guardados

## Estado

Aprobada para el Incremento 08.

## Decisión

- Comentarios existentes se amplían con un padre opcional; solo se permiten respuestas al comentario principal.
- Reacciones y reposts usan claves únicas actor/recurso/tipo.
- Guardados son tipados y polimórficos por `recurso_tipo/recurso_id`, con colecciones privadas propias.
- Los bloqueos impiden comentarios y compartidos cruzados.
- Seguidores/amigos se mantienen separados; no se añade amistad bidireccional porque el modelo actual ya aporta relaciones y privacidad con seguidores.
- Reportes incluyen tipo e ID de recurso.
- La reputación comercial conserva su origen independiente y no usa likes ni seguidores.

## Consecuencias

- Doble clic o reintento no crea guardado, reacción ni repost duplicado.
- Los comentarios tienen límite temporal de diez por minuto.
- La eliminación conserva el hilo y reemplaza el texto por un marcador.
