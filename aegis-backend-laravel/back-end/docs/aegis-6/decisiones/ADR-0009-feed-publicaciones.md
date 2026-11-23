# ADR-0009: Feed social sobre publicaciones existentes

## Estado

Aprobada para el Incremento 07.

## Decisión

- `publicaciones_foro` continúa siendo la entidad canónica; no se crea una tabla `posts` duplicada.
- Los registros históricos reciben estado `publicado` por defecto.
- Se extiende el modelo con estado, programación, edición, fijado, ranking inicial, etiquetas, menciones y enlace seguro.
- `/api/foro` conserva su nombre y añade tabs/cursor sin retirar el contrato legado.
- Para-ti usa fijados y `rank_base`, luego fecha e ID; siguiendo usa autores aceptados; recientes usa fecha e ID.
- Los bloqueos excluyen autores del feed.
- Las reacciones usan una tabla mínima por publicación, usuario y tipo.

## Consecuencias

- No se implementa recomendación de IA; el ranking es determinista y visible en la respuesta.
- La programación usa Laravel Queue con un job idempotente.
- Los enlaces deben usar HTTP/HTTPS.
