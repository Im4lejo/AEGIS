# ADR-0025: Historias temporales y eventos comunitarios

- **Estado:** Aceptado
- **Fecha:** 2026-11-23
- **Responsable:** Copilot SDK

## Contexto

AEGIS ya tenía publicaciones permanentes, encuestas persistentes y comunidades con membresías/privacidad. El Incremento 23 requería formatos temporales y eventos sin convertirlos en nuevas entidades duplicadas ni exponer contenido privado.

## Decisión

- Reutilizar `publicaciones_foro` y su infraestructura de encuestas como base permanente; no crear otro sistema de encuestas.
- Modelar historias como registros temporales con audiencia, expiración, media y visualizaciones únicas.
- Vincular historias privadas a una comunidad mediante `comunidad_id`.
- Modelar eventos comunitarios con cupo, estado y participaciones únicas por usuario.
- Aplicar membresía, rol contextual, bloqueos y cuenta activa en el servidor.
- Programar expiración cada cinco minutos y recordatorios con dedupe en notificaciones.
- Mantener React como consumidor de API; controles React no sustituyen autorización.

## Alternativas

- Fulltext o motor dedicado: no corresponde al volumen probado; se descartó por SQL indexado existente.
- Hacer grupo privado dependiente de un arreglo de IDs: descartado por falta de trazabilidad y permisos independientes.
- Crear otro modelo de encuesta: descartado por reutilizar el dominio existente.

## Consecuencias

- La migración agrega contexto comunitario sin alterar las tablas públicas existentes.
- La privacidad exige membresía activa para audiencias privadas.
- Los eventos privados siguen el filtro de visibilidad de su comunidad.
- Expiración y recordatorios dependen del scheduler/worker operativo.

## Verificación

- Suite backend completa: 115 pruebas, 549 aserciones.
- Suite React: 17 pruebas.
- Cuatro pruebas nuevas de historias/eventos cubren expiración, privacidad, visualización única, permisos y suspensión.
