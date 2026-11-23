# ADR-0026: Video bajo demanda y degradación de Live

- **Estado:** Aceptado
- **Fecha:** 2026-11-23
- **Responsable:** Copilot SDK

## Contexto

El proyecto ya usa Cloudinary para imágenes y video. No existen credenciales Live, variables Live ni SDK/configuración de un proveedor que permita probar ingesta y reproducción extremo a extremo.

## Decisión

- Mantener Cloudinary como proveedor VOD reutilizado.
- Rechazar Live honestamente con `503 LIVE_UNAVAILABLE`.
- Limitar video a MP4, WebM y QuickTime; máximo 25 MB.
- Registrar estados `procesando`, `listo` y `error` en adjuntos e historias.
- Usar `<video controls preload="metadata">` y poster; no simular Live.
- Mantener claves de proveedor fuera de base, posts y cliente.

## Alternativas

- HLS adaptativo completo: no se entrega sin configuración Cloudinary confirmada y prueba real.
- Mux: no es una dependencia instalada ni tiene credenciales.
- WebRTC propio: excedería el alcance de web, añadiría infraestructura no probada y posibles costes.

## Consecuencias

- VOD necesita Cloudinary operativo.
- Live queda deshabilitado hasta contar con credenciales, cuotas, ingest y cliente probados.
- Los subtítulos requieren un flujo posterior de carga `.vtt`.
- Las URLs públicas continúan sujetas a la privacidad de las rutas que exponen el post o historia.
