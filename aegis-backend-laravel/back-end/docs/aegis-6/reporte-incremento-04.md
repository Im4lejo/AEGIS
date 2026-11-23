# Incremento 04: autorización granular

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `bdcf8b3639292b245be3608a0fc7be31b8bf98c3`.
- El tag `6.0.0` no existía en el repositorio local; no pudo verificarse su relación con HEAD.
- Estado inicial: sin cambios pendientes.
- No se usaron comandos de reconstrucción o modificación de historia.

## Base de datos

- Conexión real: MySQL local en `127.0.0.1:3306`, base `aegis_db`, desechable de desarrollo.
- Datos previos: 5 usuarios, 3 productos y 2 publicaciones.
- Respaldo verificable: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento04.sql` (33,210 bytes).
- Migraciones aplicadas:
  - `2026_11_23_000001_add_email_verified_at_to_usuarios_table`
  - `2026_11_23_000002_create_usuario_password_reset_tokens_table`
  - `2026_11_23_000003_add_authorization_privacy_tables`
- La migración nueva añade visibilidad a productos y publicaciones, permisos delegados y auditoría administrativa. Es compatible con SQLite de pruebas y reversible.

## Funcionalidad

- Gates de cuenta, productos, publicaciones, puntos y administración.
- Middleware `account.active` para operaciones protegidas.
- Dueños pueden editar/eliminar recursos propios; administradores tienen control contextual y auditoría.
- Contenido privado bloqueado con `403 PRIVATE_RESOURCE`.
- Publicaciones públicas siguen disponibles en perfiles y foro.
- Usuarios suspendidos/baneados reciben `403 ACCOUNT_NOT_ACTIVE`.
- React recibe capacidades en `/auth/web/me` y protege `/admin` y rutas autenticadas.

## Contrato API

Nuevas o modificadas:

- `GET /api/foro/{publicacion}`
- `PATCH /api/productos/{producto}`
- `DELETE /api/productos/{producto}`
- `PATCH /api/foro/{publicacion}`
- `DELETE /api/foro/{publicacion}`
- `PATCH /api/puntos-fisicos/{punto}`
- `GET /api/admin/usuarios`
- `PATCH /api/admin/usuarios/{usuario}`

Contratos existentes respetados:

- Los listados públicos siguen excluyendo contenido privado.
- Las respuestas de autenticación incorporan `estado` y `capabilities`.
- Los errores JSON usan códigos `ACCOUNT_NOT_ACTIVE`, `PRIVATE_RESOURCE` y `FORBIDDEN_RESOURCE`.

## Archivos relevantes

- Backend: gates, middleware, controladores y migración.
- React: protección de rutas y estados de cuenta restringida/suspendida.
- Pruebas: `tests/Feature/AuthorizationPrivacyTest.php`.

## Verificación

- `php artisan test`: 32 pruebas aprobadas, 169 aserciones.
- React `npm run test:ui`: 2 archivos, 17 pruebas aprobadas.
- React `npm run build`: compilación exitosa.
- Migraciones: batch 2 aplicado en MySQL local.

## Estado final

Hecho para la autorización base web. Pendiente de siguiente incremento: membresías comunitarias persistidas completas, moderación por objeto, edición de imágenes y matrices administrativas visuales.
