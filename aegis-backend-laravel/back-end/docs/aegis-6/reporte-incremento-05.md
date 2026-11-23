# Incremento 05: gestión unificada de imágenes, video y archivos

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial del incremento: `89508238e46e000b966461f8a624b557813e4ae`.
- Estado inicial: limpio.
- El tag `6.0.0` no existía en el repositorio local; no pudo verificarse su relación con HEAD.
- No se ejecutaron comandos de reconstrucción ni modificación de historia.

## Base de datos

- Conexión real: MySQL local `127.0.0.1:3306`, base `aegis_db`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento05.sql` (37,459 bytes).
- Migración aplicada:
  - `2026_11_23_000004_extend_media_metadata`
- Cambios: metadatos y orden en imágenes de producto/foro, `public_id` recuperable en producto, estado y tabla `operaciones_media`.
- Migración reversible y compatible con SQLite.

## Implementación

- Nuevo adaptador `MediaStorage` con implementación Cloudinary.
- Nuevo `MediaManager` para validación, dimensiones, variantes, carga y compensación.
- Carga, eliminación y reordenamiento por recurso.
- Reemplazo de avatar y portada por usuario autenticado.
- Dropzone responsive con previsualización, controles accesibles y texto alternativo.
- Reintento remoto tres veces y cola `operaciones_media` ante fallo persistente.

## Rutas API

- `POST/PATCH/DELETE /api/productos/{producto}/imagenes...`
- `POST/PATCH/DELETE /api/foro/{publicacion}/imagenes...`
- `POST /api/perfil/media/avatar`
- `POST /api/perfil/media/portada`

## Pruebas

- Laravel completo: 36 pruebas aprobadas, 183 aserciones.
- Media: 4 pruebas aprobadas, 14 aserciones.
- React UI: 17 pruebas aprobadas.
- React build: compilación exitosa.
- Captura manual no realizada: no había navegador compartido.

## Estado final

Hecho para imágenes, video configurado con Cloudinary y adjuntos de producto/foro. Pendiente: adjuntos persistentes de mensajes, ya que el proyecto no cuenta actualmente con API/modelo de mensajes.
