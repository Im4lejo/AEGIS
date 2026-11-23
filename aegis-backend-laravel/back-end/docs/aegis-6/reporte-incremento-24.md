# Incremento 24: video bajo demanda y Live honesto

## Alcance y estado

Parcial. Se implementó reproducción real de video bajo demanda para publicaciones e historias, procesamiento asíncrono, posters y estados de procesamiento/error. Live se mantiene explícitamente no disponible porque no hay proveedor ni credenciales Live configurados.

## Cambios realizados

- Reutiliza Cloudinary como proveedor VOD existente.
- Límite de video: 25 MB; formatos MP4, WebM y QuickTime.
- Se agregaron `poster_url`, `playback_url`, `subtitulos_url` y `procesamiento_estado` a adjuntos de foro e historias.
- Se añadieron jobs de procesamiento para adjuntos de foro e historias.
- React usa `<video controls preload="metadata">`, poster y estados Procesando/Error.
- Live devuelve `503 LIVE_UNAVAILABLE` y registra el intento sin crear una sesión real.
- `GET /api/video/capabilities` informa VOD/Live sin exponer secretos.
- No se muestran reproductores ficticios ni botones de Live habilitados.

## Migración y respaldo

- Migración: `2026_11_23_000026_add_video_assets.php`.
- Conexión verificada: MySQL local `127.0.0.1:3306`, base `aegis_db`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento24.sql`, 127201 bytes.
- Estado de migración: Ran.

## API React

- `GET /api/video/capabilities`
- `POST /api/live/sessions` autenticado: 503 cuando Live no está disponible.
- El feed acepta `image/*,video/mp4,video/webm,video/quicktime`.
- El visor de feed y publicación usa reproducción nativa y accesible.

## Verificación

| Comando o comprobación | Resultado |
|---|---|
| `php artisan migrate` | Migración 000026 aplicada. |
| `php artisan test --filter=AdvancedContentTest` | 5 pruebas, 20 aserciones. |
| `php artisan test` | 116 pruebas, 555 aserciones. |
| React Vitest | 17 pruebas aprobadas. |
| React build | Build exitoso; advertencia de chunk superior a 500 KB. |

## Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial del incremento: `5c89df4cf994302c4d11b183980436abbea8d945`.
- Estado inicial limpio.
- Tag `6.0.0`: no existe; no se pudo validar ancestro.

## Riesgos y pendientes

- Live requiere proveedor probado extremo a extremo, credenciales protegidas y cuotas autorizadas.
- No se implementó ingest RTMP/WebRTC, HLS adaptativo ni moderación de señal Live.
- Subtítulos guardan una URL preparada, pero falta flujo de carga/validación de archivos `.vtt`.
- El bloqueo real de URLs privadas dependerá de assets Cloudinary autenticados/firmados; no se publicaron secretos ni URLs firmadas.
