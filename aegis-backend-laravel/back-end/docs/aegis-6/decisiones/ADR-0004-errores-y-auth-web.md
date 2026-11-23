# ADR-0004: Adaptador HTTP compatible y autenticación web pendiente

- **Estado:** Aceptado (adaptador de errores); decisión de autenticación aplazada
- **Fecha:** 2026-11-23
- **Contexto:** Laravel devuelve envelopes de éxito distintos entre `ProductoResource` y respuestas `response()->json()`. React y Expo son consumidores; el cliente web anterior manejaba fallos de transporte de forma limitada. El cliente web actualmente usa bearer Sanctum y `localStorage`.

## Decisión

Mantener sin cambios rutas y envelopes de éxito del API. El cliente React normaliza errores de transporte y HTTP a `ApiError` con status, mensaje para usuario, errores de validación y `Retry-After`; para 500 muestra mensaje genérico. Estados accesibles compartidos representan loading, error/restricción, vacío, feedback y 404. `/plantilla` queda explícita y solo el comodín pasa a 404.

No añadir ahora recursos/servicios/policies/job backend sin responsabilidad funcional demostrada. Tampoco convertir autenticación Bearer a cookie/session ni variar la caducidad, CORS o persistencia del token.

## Consecuencias

- Compatible con consumidores actuales mientras el manejo de errores sea una capacidad aditiva del frontend.
- 400/401/403/404/409/422/429/500 y red tienen representación cliente; no todos esos estados se emiten actualmente por las rutas existentes.
- El API no tiene throttle explícito; el mensaje 429 no constituye rate limiting implementado.
- Una decisión futura de auth web requiere ADR que compare Bearer vs stateful cookie, CSRF/XSS, dominios, expiración/revocación y coexistencia con Expo.

## Verificación

`src/services/api.test.js` comprueba envelopes de éxito, statuses, sanitización de 500, validación, red, abort, multipart y 204. `PublicApiTest` conserva la cobertura de auth, validación, rutas y privacidad. El catálogo de rutas Laravel permanece en 14 endpoints.
