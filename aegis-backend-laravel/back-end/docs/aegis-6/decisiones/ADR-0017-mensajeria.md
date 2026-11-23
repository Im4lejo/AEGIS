# ADR-0017: Mensajería privada y grupal

## Estado

Aprobada para el Incremento 15.

## Decisión

- Conversaciones directas/grupales usan participantes AEGIS existentes.
- La clave contextual evita DMs duplicados por vendedor/comprador/anuncio.
- Mensajes y adjuntos usan persistencia SQL; adjuntos siguen el servicio de media.
- Lecturas son opt-in por participante.
- Bloqueos afectan apertura y envío directo.
- El entorno no incluye proveedor WebSocket configurado; React usa polling de 5 segundos.
- Moderadores comunitarios no reciben participación ni permisos adicionales por ese rol.

## Consecuencias

- El realtime no se promete cuando no existe un canal real.
- El historial se pagina hacia atrás por ID/fecha.
- Los mensajes eliminados conservan el hilo sin contenido.
