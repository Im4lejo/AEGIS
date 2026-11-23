# ADR-0012: Foro avanzado sobre publicaciones existentes

## Estado

Aprobada para el Incremento 10.

## Decisión

- `publicaciones_foro` se extiende con tipos: discusión, pregunta, tutorial, encuesta y anuncio.
- Las respuestas conservan `comentarios_foro` y ganan solución/votos útiles.
- Los hilos pueden cerrarse y suscribirse.
- Las encuestas usan tablas normalizadas y votación única por usuario para elección simple.
- La popularidad es determinista mediante `actividad_score`; no se usa IA.
- Los registros y comentarios mantienen compatibilidad con las rutas anteriores.

## Consecuencias

- Solo autor, moderador comunitario o admin puede marcar solución/cerrar según contexto.
- Un hilo cerrado bloquea comentarios y votos.
- Los resultados de encuesta son agregados reales desde `votos_encuesta`.
