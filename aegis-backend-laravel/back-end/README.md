# AEGIS Backend

Backend Laravel 12 para reemplazar progresivamente el MVC modular PHP de AEGIS. Expone una API REST JSON; no contiene migración de vistas ni código de frontend.

Para agentes que necesiten conocer el flujo de código, API, modelos, esquema, configuración y límites funcionales, consultar la [guía operativa del backend](./docs/AI_BACKEND_GUIDE.md).
La auditoría inicial de React/Laravel, matriz funcional, arquitectura objetivo y verificación de este incremento se encuentra en [docs/aegis-6](./docs/aegis-6/00-auditoria.md).
El reporte de Incremento 01 documenta el adaptador de errores web, pruebas, formato y el estado de compatibilidad: [reporte de pruebas y arranque](./docs/aegis-6/reporte-pruebas-arranque.md).

## Requisitos y configuración

- PHP 8.2+
- Composer
- MySQL/MariaDB (o SQLite para desarrollo/pruebas)

Configura la conexión de base de datos mediante las variables `DB_*` de `.env`. No se versionan credenciales.
Configura `FRONTEND_URL` con el origen exacto del frontend para permitir solicitudes CORS; por defecto se usa `http://localhost:5173` en desarrollo. También se permite `http://localhost:8081` para Expo Web.
En React, `VITE_API_URL` puede definir el prefijo de la API; por defecto es `http://127.0.0.1:8000/api`.

```bash
composer install
php artisan migrate --seed
php artisan serve
```

`php artisan db:seed` agrega categorías y datos de demostración para usuarios, productos, foro, puntos físicos, encuentros, códigos QR, calificaciones, reportes y notificaciones. Es idempotente: reutiliza sus registros de demostración y no elimina ni actualiza los registros existentes.

Para poblar una base ya migrada sin reiniciarla, ejecuta `php artisan db:seed`. No uses `migrate:fresh` si quieres conservar sus datos.
También puedes ejecutar solo los datos de demostración con `php artisan db:seed --class='Database\Seeders\DemoDataSeeder'`.
El seeder rechaza la ejecución cuando `APP_ENV=production`.

Las cuentas de demostración usan la contraseña `password`:

- `admin.demo@aegis.test` (administrador)
- `owner.demo@aegis.test` (propietario de punto físico)
- `ana.demo@aegis.test` (vendedora)
- `carlos.demo@aegis.test` (comprador)

## API pública disponible

Las respuestas usan JSON y están prefijadas por `/api`.

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/inicio` | Ocho productos activos recientes |
| GET | `/api/categorias` | Categorías ordenadas por nombre |
| GET | `/api/productos` | Productos activos paginados y filtrables |
| GET | `/api/productos/{id}` | Detalle de un producto activo |
| GET | `/api/foro` | Publicaciones con autor y comentarios |
| GET | `/api/perfil/{id}` | Perfil público, publicaciones y productos activos |
| GET | `/api/puntos-fisicos` | Puntos físicos activos |

`GET /api/productos` admite `busqueda`, `precio_max`, `estado` (`todo`, `nuevo`, `usado`, `reacondicionado`), `cat`, `sort` (`reciente`, `precio-asc`, `precio-desc`), `page` y `per_page` (1–50). Los listados paginados incluyen `data` y `meta`.

## Autenticación y operaciones protegidas

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/register` | Público | Crea una cuenta en `usuarios` y devuelve un token Sanctum |
| POST | `/api/login` | Público | Verifica email/contraseña contra `usuarios` y devuelve token |
| GET | `/api/me` | Bearer token | Devuelve el usuario de la sesión |
| POST | `/api/logout` | Bearer token | Revoca el token actual |
| POST | `/api/productos` | Bearer token | Publica producto con 1–5 imágenes |
| POST | `/api/foro` | Bearer token | Crea publicación en el foro |
| POST | `/api/foro/{id}/comentarios` | Bearer token | Agrega comentario a una publicación |

El cliente React mantiene el token web en `sessionStorage` por pestaña, el usuario en memoria y revalida la sesión con `/api/auth/web/me`; las operaciones protegidas envían `Authorization: Bearer <token>`. Leer productos, categorías, publicaciones del foro y puntos físicos sigue siendo público.

### Identidad web

React usa el conjunto separado `/api/auth/web/*`, conservando `/api/register`, `/api/login`, `/api/me` y `/api/logout` para clientes existentes como Expo:

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/web/register` | Público | Registro genérico y envío de verificación; no inicia sesión |
| POST | `/api/auth/web/login` | Público | Emite token Bearer web con expiración de ocho horas |
| POST | `/api/auth/web/email/resend` | Público | Reenvío genérico de verificación |
| GET | `/api/auth/web/email/verify/{id}/{hash}` | URL firmada | Verifica el correo y redirige a React |
| POST | `/api/auth/web/password/forgot` | Público | Solicita recuperación sin confirmar si existe la cuenta |
| POST | `/api/auth/web/password/reset` | Público | Restablece contraseña y revoca tokens existentes |
| GET | `/api/auth/web/me` | Bearer web | Revalida la sesión actual |
| POST | `/api/auth/web/logout` | Bearer web | Revoca el token actual |
| GET | `/api/auth/web/sessions` | Bearer web | Lista hasta 50 sesiones sin exponer tokens |
| DELETE | `/api/auth/web/sessions/{token}` | Bearer web | Revoca una sesión propia |
| DELETE | `/api/auth/web/sessions` | Bearer web | Revoca todas las sesiones |
| GET | `/api/auth/web/security-notices` | Bearer web | Lista avisos recientes de inicio |
| PATCH | `/api/auth/web/password` | Bearer web | Cambia contraseña y revoca tokens |
| POST | `/api/auth/web/email/verification-notification` | Bearer web | Reenvía verificación a la cuenta actual |

El token de React se conserva en `sessionStorage` por pestaña; el usuario se vuelve a obtener de `/me`. El servidor aplica una caducidad de ocho horas y limita los intentos de autenticación/recuperación. Los fallos de login no distinguen cuentas desconocidas, inactivas o sin verificar. La estrategia y sus límites están en [ADR-0004](./docs/aegis-6/decisiones/ADR-0004-errores-y-auth-web.md).

La identidad web es `Usuario`/`usuarios`; el scaffold `User`/`users` permanece separado. El broker de recuperación AEGIS usa `usuario_password_reset_tokens`, independiente de `password_reset_tokens`. Configura `FRONTEND_URL`, CORS y un mailer operativo antes de habilitar los flujos de verificación y recuperación en un entorno real. El token Bearer de navegador es accesible para JavaScript y no protege ante XSS; MFA/passkeys no están habilitados.

## Migración de datos y alcance pendiente

Las migraciones Laravel reproducen las tablas AEGIS (`usuarios`, `categorias`, `productos`, imágenes, foro, puntos físicos, encuentros, QR, calificaciones, reportes y notificaciones), conservando nombres de campos y relaciones. Ejecutar las migraciones crea el esquema vacío; no copia registros de `AEGIS-MVC-MODULAR/database/aegis_db.sql`.

La API todavía no expone operaciones completas de encuentros ni perfiles privados más allá de la privacidad base de productos/publicaciones. Las operaciones de owner/admin del Incremento 04 sí están disponibles para puntos y cuentas. Los controladores MVC/HTML y las vistas no se migran.

## Historias y eventos comunitarios

- `GET /api/historias` y `GET /api/historias/{id}` sirven historias temporales autorizadas por audiencia, seguimiento, comunidad y bloqueos.
- `POST /api/historias` crea una historia con imagen/video y expiración configurable; `DELETE /api/historias/{id}` exige propietario/admin.
- `GET /api/comunidades/{id}/eventos` respeta comunidades públicas y privadas.
- `POST /api/comunidades/{id}/eventos` exige owner/moderador comunitario; participación y cancelación tienen permisos propios.
- Las visualizaciones son únicas por historia/usuario y las historias vencidas quedan expuestas solo como estado expirado.
- `ExpirarHistorias` se ejecuta cada cinco minutos desde el scheduler y los recordatorios usan dedupe de notificaciones.
- Encabezado, carrusel React y dirección de comunidad consumen estos endpoints; React no decide permisos.

## Video bajo demanda y Live

- `GET /api/video/capabilities` devuelve disponibilidad real de VOD y Live.
- Los adjuntos de foro e historia aceptan MP4, WebM y QuickTime hasta 25 MB.
- El procesamiento de video es asíncrono e identifica estados `procesando`, `listo` y `error`.
- React reproduce video con controles nativos, poster y carga diferida por metadata.
- Live no está disponible sin credenciales/proveedor probado; `POST /api/live/sessions` responde `503 LIVE_UNAVAILABLE`.
- Las variables Live y Cloudinary deben configurarse fuera de la base y nunca exponerse al cliente.

## Moderación, reportes y apelaciones

- Los reportes admiten usuario, post, comentario, producto, comunidad, mensaje y operación.
- Motivos válidos: spam, estafa, acoso, contenido prohibido y suplantación.
- Solo administradores gestionan la cola global; el reportante puede consultar únicamente sus reportes.
- Sanciones: advertencia, suspensión temporal y baneo, siempre auditados y aplicados por API.
- Solo la persona afectada puede apelar una resolución; aceptar revoca sanción y restaura cuenta activa.
- Antifraude crea señales interpretables para revisión, sin etiquetar automáticamente culpable.
- Mensajes privados no quedan abiertos al moderador; las preferencias controlan mensajes de desconocidos.

## Autorización, propietarios y privacidad

El Incremento 04 aplica autorización en servidor con Laravel Gates y middleware:

- `usuario`, `owner` y `admin` son roles base, no sustituyen la propiedad ni las capacidades por recurso.
- Los estados `activo`, `suspendido` y `baneado` se aplican a todas las operaciones protegidas.
- Productos y publicaciones pueden ser `publica`, `privada` o `grupo_privado`.
- El dueño puede editar/eliminar su producto o publicación.
- El owner gestiona sus puntos físicos; el admin gestiona cuentas y tiene auditoría.
- `permisos_delegados` permite delegar capacidades sobre un recurso concreto sin crear una tabla general de roles.
- Las acciones administrativas quedan registradas en `auditoria_accesos`.
- React recibe `estado` y `capabilities` para ocultar o deshabilitar controles, pero nunca decide autorización.

Las rutas de escritura revalidan autenticación, estado activo y capacidad. Contenido privado responde `403 PRIVATE_RESOURCE`; cuentas suspendidas responden `403 ACCOUNT_NOT_ACTIVE`.

## Gestión de media

Los productos y publicaciones usan Cloudinary mediante `MediaManager` y conservan tablas SQL separadas por compatibilidad:

- Imágenes: JPEG, PNG y WebP, máximo 5 MB y 5000 x 5000 píxeles.
- Video: MP4, WebM y MOV, máximo 25 MB.
- Máximo 5 adjuntos por producto o publicación.
- Las cargas generan metadatos, `public_id`, URL segura, orden y texto alternativo.
- Cambiar orden o eliminar adjuntos exige ser propietario/admin/capacidad delegada.
- Fallos remotos crean operaciones pendientes para reintento; los registros históricos sin `public_id` no se borran remotamente.
- Avatar y portada se reemplazan mediante endpoints propios del usuario autenticado.

## Perfiles sociales

- `GET/PATCH /api/perfil/me` administra el perfil propio y su actividad.
- `GET /api/perfil/{id}` conserva el contrato público anterior.
- `GET /api/perfil/{id}/tabs/{tab}` pagina Publicaciones, Productos, Comunidades, Reseñas e Información.
- `perfil_privado`, seguidores, presencia y publicación fijada tienen reglas persistidas.
- Seguir, bloquear y silenciar tienen endpoints propios.
- Los recursos públicos excluyen email, teléfono, dirección exacta y otros campos privados.
- La desactivación inicia 30 días de retención y revoca tokens.

## Feed social

El foro usa `publicaciones_foro` como entidad canónica y conserva `/api/foro`.

- Tabs: `para-ti`, `siguiendo`, `recientes`.
- Cursor estable por fecha e ID.
- Ranking Para-ti determinista: fijados, `rank_base`, fecha e ID.
- Estados: publicado, borrador, programado, archivado y eliminado.
- Publicaciones, edición, archivo, fijado, etiquetas, menciones y enlaces seguros.
- Reacciones eficientes por publicación, usuario y tipo.
- Feed de bloques excluye usuarios bloqueados.

## Interacciones sociales

- Comentarios admiten respuestas al comentario principal y edición/borrado lógico.
- Reacciones y reposts son idempotentes.
- Guardados soportan posts, productos y discusiones y colecciones personales.
- Seguir mantiene el modelo de seguidores; no se agregó una entidad de amistad redundante.
- Los reportes incluyen recurso contextual.
- Los comentarios tienen límite temporal y los bloqueos impiden interacción cruzada.

## Comunidades

- Directorio público y sugerencias explícitas por categoría.
- Comunidades públicas, privadas y por invitación.
- Membresías contextuales owner/moderador/miembro.
- Solicitudes, invitaciones, aprobación, rechazo, expulsión y baneo.
- Posts comunitarios reutilizan `publicaciones_foro` mediante `comunidad_id`.
- Auditoría local de acciones comunitarias.

## Foro avanzado

- Tipos: discusión, pregunta, tutorial, encuesta y anuncio.
- Preguntas admiten una respuesta aceptada.
- Hilos pueden cerrarse y suscribirse.
- Encuestas permiten opciones, período y voto único simple.
- Feed admite filtros por tipo/comunidad/búsqueda y orden por actividad/popularidad.

## Marketplace

- Conserva `POST/GET /api/productos`.
- Estados: borrador, activo, pausado, reservado, vendido, archivado y oculto.
- Publicar exige campos completos e imágenes.
- Mis productos permite tabs por estado y estadísticas almacenadas básicas.
- `precio_max=0` incluye anuncios gratuitos.
- Filtra por precio, ubicación aproximada, marca, atributos, recencia y categoría.
- Comparar acepta 2–4 productos públicos.
- Similares usa misma categoría y ±20% de precio.

## Detalle comercial

- Ficha pública incluye política, entrega, punto de encuentro, disponibilidad y atributos.
- Preguntas públicas requieren moderación del vendedor.
- Solo reseñas ligadas a encuentros se consideran elegibles.
- Los badges no se inventan a partir de likes o seguidores.
- Productos privados y borradores usan `noindex,nofollow`.

## Tiendas e inventario

- Tiendas particulares, comerciales y establecimientos usan el mismo usuario propietario.
- Roles contextuales: owner, gestor y vendedor.
- La verificación solo muestra badge después de aprobación admin.
- Inventario por producto incluye stock disponible y reservado.
- Ajustes usan transacciones y movimientos auditados.

## Mensajería

- Conversaciones directas/grupales persistidas.
- Conversaciones comerciales vinculadas al anuncio.
- Adjuntos mediante el servicio de media.
- Lecturas opt-in, bloqueo, archivo, silencio y reportes.
- Paginación hacia atrás por ID.
- React usa polling de 5 segundos; no hay WebSocket real configurado.

## Negociación y operaciones

- Las ofertas tienen 48 horas por defecto y estados auditados.
- Aceptar reserva el anuncio y crea una operación acordada pendiente.
- Completar la operación es una acción del vendedor y marca vendido.
- No existe checkout ni pasarela de pagos.

## Puntos físicos y encuentros

- Puntos aprobados se listan por directorio y ciudad.
- Encuentros tienen propuesta, confirmación, reprogramación, cancelación y finalización.
- QR usa token opaco solo una vez y expira.
- Solo owner del punto o administración valida presencialmente.

## Reseñas comerciales

- Solo encuentros finalizados dentro de 30 días admiten reseñas.
- Comprador evalúa vendedor; vendedor evalúa comprador; participantes evalúan punto.
- Duplicados y autorreseñas están bloqueados.
- Editar está limitado a siete días.
- Promedios y distribución provienen de reseñas activas/editadas.

## Integración social-comercial

- Las publicaciones pueden referenciar productos mediante `referencias_publicacion`.
- Las tarjetas leen precio/estado/foto directamente del producto.
- Privados, borrados, archivados, vendidos y ocultos no generan compra.
- El feed admite un tab Marketplace basado en referencias activas/reservadas.

## Notificaciones

- Cabecera muestra contador real y dropdown.
- Bandeja filtra Social, Marketplace, Comunidades, Seguridad y Sistema.
- Se puede leer, marcar todas, archivar y descartar.
- Seguridad crítica conserva notificación in-app aunque el usuario silencie categorías sociales.
- Email y push web permanecen deshabilitados hasta configurar proveedores.

## Búsqueda unificada

- SQL indexado busca productos, publicaciones, personas y comunidades.
- Las entidades privadas no aparecen.
- URL de búsqueda incluye término y entidad.
- Búsquedas guardadas pueden activar alertas diarias/semanales.
- Tendencias son agregados temporales sin identidades.
- Recomendaciones muestran el criterio usado.

## Ajustes y accesibilidad

- `/ajustes` guarda preferencias por cuenta.
- Theme, densidad, contraste, movimiento y acentos tienen defaults seguros.
- Feed, Marketplace, Mensajería, Privacidad y Notificaciones son configurables.
- Reestablecer devuelve el paquete completo de defaults.

## Verificación

```bash
php artisan route:list --path=api
php artisan test
```
