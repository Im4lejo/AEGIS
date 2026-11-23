# ADR-0004: Adaptador HTTP compatible y autenticación web Bearer

- **Estado:** Aceptado
- **Fecha:** 2026-11-23
- **Contexto:** Laravel devuelve envelopes de éxito distintos entre `ProductoResource` y respuestas `response()->json()`. React y Expo son consumidores. La identidad AEGIS está en `Usuario`/`usuarios`, mientras el scaffold Laravel conserva `User`/`users`. No están confirmados los dominios definitivos necesarios para configurar de forma segura una sesión SPA stateful.

## Decisión

Mantener las rutas legacy de Bearer Sanctum para Expo y agregar el flujo de cuenta web bajo `/api/auth/web/*`. La identidad de este flujo es `Usuario`; no cambiar el provider del guard scaffold `web` ni la tabla `users`.

El login web emite un token Sanctum `aegis-web` que vence individualmente a las ocho horas. React conserva el token en `sessionStorage` por pestaña, revalida el usuario en `/me` y revoca el token en logout. Las contraseñas cambiadas/restablecidas revocan todos los tokens. El servidor aplica rate limits a login, registro, verificación y recovery; fallos de login no diferencian entre cuenta desconocida, inactiva, sin verificar o contraseña incorrecta. Recovery y registro tampoco confirman la existencia del correo.

Los brokers `users` y `usuarios` usan tablas distintas (`password_reset_tokens` y `usuario_password_reset_tokens`) para prevenir colisiones si ambas identidades comparten email. El broker AEGIS usa `Usuario`; no se altera `User`.

Mantener sin cambios los envelopes JSON exitosos de contratos existentes. El cliente React normaliza errores de transporte y HTTP a `ApiError` con status, mensaje para usuario, errores de validación y `Retry-After`; para 500 muestra mensaje genérico. No se cambia el mecanismo a cookies stateful sin conocer dominios, CORS y despliegue reales.

Las rutas `/api/*` siempre renderizan excepciones como JSON, incluso cuando falta `Accept: application/json`; una petición privada sin credenciales debe ser 401, no un redirect a una ruta web no definida.

## Consecuencias

- Se preservan endpoints, respuestas y tokens móviles existentes; los endpoints nuevos son web-only.
- Las respuestas de error API no dependen de que un cliente recuerde enviar `Accept` para evitar redirects de autenticación inválidos.
- `sessionStorage` dura mientras viva la pestaña y limita persistencia accidental, pero no protege el Bearer de XSS. Se necesita endurecimiento CSP/sanitización antes de un despliegue sensible.
- `FRONTEND_URL`, CORS y un mailer operativo son prerrequisitos para verificación y recuperación reales; las pruebas interceptan las notificaciones.
- MFA/passkeys no están soportados ni simulados. No hay refresh token.
- No se aplicaron migraciones sobre la base de desarrollo compartida. Las nuevas migraciones son incrementales/reversibles y los tests usan SQLite en memoria.
- 400/401/403/404/409/422/429/500 y red tienen representación cliente; eso no implica que cada estado sea emitido por todos los endpoints.

## Verificación

`WebAuthTest` verifica registro genérico, correo firmado, login y cuentas no enumerables, expiración, bloqueo de escrituras sin verificar, reset/revocación, aislamiento de brokers, privacidad y sesiones propias. `src/services/api.test.js` comprueba envelopes de éxito, statuses, sanitización de 500, validación, red, abort, multipart y 204; `auth-views.test.jsx` cubre formularios del ciclo de cuenta.
