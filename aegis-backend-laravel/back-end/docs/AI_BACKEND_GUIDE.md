# AEGIS Laravel Backend: guía operativa para agentes de IA

## 0. Contrato de lectura para agentes

Este documento describe el backend Laravel que existe en este repositorio. Es una guía de navegación y restricciones, no una especificación que pueda reemplazar el código.

Para cualquier tarea de backend:

1. Confirma el directorio de trabajo: `aegis-backend-laravel/back-end`.
2. Lee esta guía y el `README.md` del backend.
3. Vuelve a leer los archivos fuente de la ruta, controlador, modelo, migración y prueba afectados. El código vigente tiene prioridad si este documento quedó desactualizado.
4. No infieras que una tabla, modelo, relación, endpoint, rol, servicio o flujo existe por su nombre. Comprueba su definición y sus consumidores.
5. Mantén explícito el contrato HTTP: método, URI, autenticación, validación, forma de respuesta y errores.
6. Agrega o cambia una migración solo si la funcionalidad no puede implementarse con el esquema actual. Las migraciones deben ser incrementales y reversibles cuando sea viable.
7. Nunca ejecutes `migrate:fresh`, `migrate:refresh`, `db:wipe` ni operaciones equivalentes contra una base con datos de usuario. Para pruebas, usa el entorno configurado por PHPUnit o una base desechable.
8. No leas, copies, imprimas ni registres valores secretos de `.env`. Documenta los nombres de variables requeridos, nunca sus valores.
9. Si se cambia un contrato, modelo, migración, seeder o flujo de configuración, actualiza este documento y las pruebas relacionadas.
10. No presentes una operación de una tabla como funcionalidad de API hasta que exista una ruta que la exponga.

### Fuentes de verdad

En orden de autoridad para el comportamiento real:

1. `routes/api.php`, `routes/web.php` y `bootstrap/app.php`.
2. Controladores bajo `app/Http/Controllers/Api`.
3. Modelos Eloquent bajo `app/Models` y recursos bajo `app/Http/Resources`.
4. Migraciones bajo `database/migrations`.
5. Configuración de `config/` y variables del entorno local.
6. Pruebas bajo `tests/`.
7. `README.md` y este documento.

## 1. Identidad, alcance y tecnologías

- Proyecto: backend Laravel 12, PHP `^8.2`.
- Contrato principal: API REST JSON bajo el prefijo `/api`.
- Persistencia: Eloquent ORM y Query Builder de Laravel.
- Autenticación API: Laravel Sanctum con tokens Bearer.
- Almacenamiento de imágenes de la API: SDK de Cloudinary llamado directamente desde los controladores de producto y foro.
- Runtime Composer: `laravel/framework` 12, `laravel/sanctum` 4, `cloudinary-labs/cloudinary-laravel` 3 y `laravel/tinker`.
- Herramientas Composer de desarrollo: Faker, Pail, Pint, Sail, Mockery, Collision y PHPUnit.
- Frontend React y MVC PHP: son aplicaciones hermanas, no vistas de este backend. Este repositorio no implementa ni renderiza sus pantallas.
- Único endpoint web definido por la aplicación: `GET /`, que devuelve la vista Laravel `welcome`.
- La ruta de salud configurada por Laravel es `/up`.

No se han añadido capas generales de servicios de dominio, repositorios o DTOs. Las rutas web de autenticación usan un controlador, un recurso de usuario y middleware propio solo para responsabilidades concretas. Los controladores existentes validan y orquestan directamente Eloquent, transacciones y Cloudinary.

## 2. Inicio y ciclo de una petición

### HTTP

```text
Cliente
  -> public/index.php
  -> vendor/autoload.php
  -> bootstrap/app.php
  -> rutas web.php o api.php
  -> middleware de Laravel; auth:sanctum en rutas privadas
  -> controlador API
  -> validación Laravel
  -> Eloquent / Query Builder
  -> MySQL, MariaDB, PostgreSQL, SQL Server o SQLite según configuración
  -> Cloudinary solo en las operaciones de imágenes indicadas
  -> JsonResource o response()->json()
  -> cliente
```

`bootstrap/app.php` registra `routes/web.php`, `routes/api.php`, `routes/console.php`, el health check `/up` y el alias `verified.web`. El prefijo `/api` lo aporta el enrutamiento API de Laravel; no se repite en los paths dentro de `routes/api.php`.

### CLI

```text
artisan
  -> vendor/autoload.php
  -> bootstrap/app.php
  -> comando Artisan
```

Las tareas habituales usan Composer/Artisan. `routes/console.php` solo registra el comando scaffold `inspire`.

## 3. Mapa de archivos y responsabilidades

| Ruta | Responsabilidad actual |
|---|---|
| `artisan` | Entrada de comandos CLI Laravel. |
| `public/index.php` | Entrada HTTP Laravel; captura la petición y la entrega a la aplicación. |
| `bootstrap/app.php` | Registra rutas web/API/console y `/up`; no configura middleware o excepciones propias. |
| `bootstrap/providers.php` | Registra únicamente `AppServiceProvider`. |
| `routes/api.php` | Fuente de verdad de endpoints API y agrupación `auth:sanctum`. |
| `routes/web.php` | Ruta `GET /` a la vista `welcome`. No contiene vistas del marketplace. |
| `routes/console.php` | Comando scaffold `inspire`. |
| `app/Http/Controllers/Api` | Autenticación legacy y web, foro, inicio, perfiles públicos, productos y puntos físicos. |
| `app/Http/Resources` | Serialización de productos públicos y de datos de autenticación AEGIS. |
| `app/Http/Middleware/EnsureWebEmailIsVerified.php` | Exige verificación para escrituras con tokens `aegis-web`, sin cambiar el flujo móvil. |
| `app/Models` | Modelos Eloquent del dominio y modelo scaffold `User`. |
| `app/Providers/AppServiceProvider.php` | Configura URLs firmadas de correo y destino frontend de restablecimiento. |
| `database/migrations` | Esquema de dominio y tablas scaffold de Laravel/Sanctum. |
| `database/seeders` | Categorías y datos de demostración idempotentes. |
| `database/factories/UserFactory.php` | Factory scaffold para `App\Models\User` y la tabla `users`; no para `usuarios`. |
| `config/` | Configuración Laravel, conexiones, CORS, Sanctum, Cloudinary y servicios del framework. |
| `resources/views/welcome.blade.php` | Vista web scaffold servida por `/`. |
| `resources/css`, `resources/js`, `vite.config.js`, `package.json` | Scaffold de Vite/Tailwind del backend; no constituye la UI React de AEGIS. |
| `tests/Feature/PublicApiTest.php` | Pruebas del contrato API. |
| `tests/Feature/DemoDataSeederTest.php` | Idempotencia y conservación de datos existentes al sembrar. |
| `tests/Feature/ExampleTest.php` | Prueba scaffold de `GET /`. |
| `phpunit.xml` | Entorno de pruebas aislado con SQLite en memoria. |

### Controladores API

| Controlador | Rutas |
|---|---|
| `AuthController` | Registro, login, usuario actual y logout. |
| `ProductoController` | Categorías, búsqueda/listado, detalle y creación de productos. |
| `InicioController` | Feed de hasta ocho productos activos. |
| `ForoController` | Feed, crear publicaciones y crear comentarios. |
| `PerfilController` | Perfil público, productos activos y publicaciones del usuario. |
| `PuntoFisicoController` | Listado paginado de puntos físicos activos. |
| `WebAuthController` | Registro, verificación, login, recuperación, cambio de contraseña, sesiones y avisos para React. |

El controlador base `App\Http\Controllers\Controller` está vacío.

## 4. Contrato HTTP existente

Todas las rutas de la tabla son `/api/...`. Laravel serializa excepciones de rutas API como JSON incluso si el cliente omite `Accept`; los clientes deben enviar `Accept: application/json` para declarar explícitamente el formato esperado. Los endpoints protegidos usan `Authorization: Bearer <token>`. Peticiones con archivos deben usar `multipart/form-data`; los payloads sin archivo normalmente usan JSON.

### Rutas públicas

| Método y ruta | Controlador | Entrada y validaciones | Resultado actual |
|---|---|---|---|
| `GET /api/inicio` | `InicioController::__invoke` | Sin parámetros. | Hasta 8 productos con `estado_publicacion=activo`, más recientes primero. Respuesta `ProductoResource::collection`. |
| `GET /api/categorias` | `ProductoController::categorias` | Sin parámetros. | `{"data":[{"id","nombre","descripcion"}]}`, orden por nombre. |
| `GET /api/productos` | `ProductoController::index` | `busqueda`: string, máx. 100; `precio_max`: numérico, mín. 0; `estado`: `todo`, `nuevo`, `usado`, `reacondicionado`; `cat`: string, máx. 100; `sort`: `reciente`, `precio-asc`, `precio-desc`; `per_page`: entero 1–50. | Productos activos, con categoría, vendedor e imágenes. Paginación de Laravel con `data`, `links` y `meta`; `per_page` predeterminado 24. |
| `GET /api/productos/{producto}` | `ProductoController::show` | `{producto}` debe ser numérico. | Solo devuelve productos activos. Recurso `ProductoResource`; no encontrado o no activo: 404. |
| `GET /api/foro` | `ForoController::index` | `per_page`: entero opcional 1–50. | Publicaciones con autor, imágenes, comentarios, autores de comentarios y `comentarios_count`. Orden descendente por `fecha_publicacion`; predeterminado 20. Respuesta propia `data` + `meta`. |
| `GET /api/perfil/{usuario}` | `PerfilController::show` | `{usuario}` numérico. | `{"data":{"perfil":...,"productos":[...],"publicaciones":[...]}}`. Incluye hasta 24 productos activos y 10 publicaciones recientes; no pagina esas listas. Usuario inexistente: 404. |
| `GET /api/puntos-fisicos` | `PuntoFisicoController::index` | `per_page`: entero opcional 1–50. | Solo puntos con `estado=activo`, owner limitado a id/nombre/apellido, por nombre. `data` + `meta`; predeterminado 24. |
| `POST /api/register` | `AuthController::register` | `nombre` requerido string máx. 100; `apellido` requerido string máx. 100; `username` opcional string máx. 50 y único en `usuarios`; `email` requerido email máx. 150 y único; `password` requerido string mín. 8 y confirmado mediante `password_confirmation`. | 201. Crea `Usuario` con `rol=usuario`, `estado=activo`, hash de contraseña y token Sanctum. Devuelve `message`, `usuario` y `token`. |
| `POST /api/login` | `AuthController::login` | `email` requerido con formato email; `password` requerido string. | Credenciales no válidas: ValidationException (422). Cuenta distinta de activa: 403. Éxito: `message`, `usuario` y token Sanctum. |

### Identidad y recuperación web

Las rutas web viven bajo `/api/auth/web`; no sustituyen los endpoints Bearer legacy anteriores:

| Método y ruta | Acceso | Comportamiento |
|---|---|---|
| `POST /api/auth/web/register` | Público, 5/min | Valida y crea `Usuario`; respuesta genérica 202 y notificación de verificación, sin token |
| `POST /api/auth/web/login` | Público, 5/min | Devuelve un token `aegis-web` con expiración a 8 h; cuentas inexistentes, inactivas, no verificadas y credenciales incorrectas reciben el mismo 401 |
| `POST /api/auth/web/email/resend` | Público, 3/min | Reenvía verificación con respuesta genérica 202 |
| `GET /api/auth/web/email/verify/{id}/{hash}` | Firma temporal, 10/min | Marca el correo verificado y redirige a `FRONTEND_URL` |
| `POST /api/auth/web/password/forgot` | Público, 3/min | Usa `Password::broker('usuarios')`; siempre devuelve respuesta genérica 202 |
| `POST /api/auth/web/password/reset` | Público, 5/min | Restablece contraseña validada y revoca todos los tokens de la cuenta |
| `GET /api/auth/web/me` | `auth:sanctum` | Devuelve `UsuarioAuthResource` limitado |
| `POST /api/auth/web/logout` | `auth:sanctum` | Revoca el token Bearer actual |
| `GET /api/auth/web/sessions` | `auth:sanctum` | Lista hasta 50 tokens propios, sin su secreto |
| `DELETE /api/auth/web/sessions/{token}` | `auth:sanctum` | Revoca solo un token perteneciente al usuario actual; otro usuario obtiene 404 |
| `DELETE /api/auth/web/sessions` | `auth:sanctum` | Revoca todos los tokens de la cuenta |
| `GET /api/auth/web/security-notices` | `auth:sanctum` | Lista avisos web recientes, limitados al usuario |
| `PATCH /api/auth/web/password` | `auth:sanctum`, 5/min | Verifica contraseña actual, cambia contraseña y revoca todos los tokens |
| `POST /api/auth/web/email/verification-notification` | `auth:sanctum`, 3/min | Reenvía verificación de la cuenta autenticada |

Los endpoints legacy `/api/register`, `/api/login`, `/api/me` y `/api/logout` conservan la emisión y revocación `aegis-movil` para consumidores existentes. Las operaciones de escritura con token `aegis-web` requieren email verificado; el middleware no bloquea tokens `aegis-movil`.

### Rutas protegidas con `auth:sanctum`

| Método y ruta | Controlador | Entrada y validaciones | Resultado actual |
|---|---|---|---|
| `GET /api/me` | `AuthController::me` | Token autenticado. | `{"usuario": <Usuario autenticado>}`; `password` está oculto por el modelo. |
| `POST /api/logout` | `AuthController::logout` | Token autenticado. | Elimina el token actual y devuelve mensaje de cierre. No revoca otros tokens del usuario. |
| `POST /api/productos` | `ProductoController::store` | `categoria_id` requerido existente; `titulo` requerido string máx. 150; `descripcion` requerida string; `precio` requerido numérico 0–9999999999.99; `estado_producto`: `nuevo`, `usado`, `reacondicionado`; `ciudad` opcional string máx. 100; `imagenes` requerida array 1–5; cada imagen debe ser JPG/JPEG/PNG/WebP y máx. 5120 KB. | 201, mensaje y producto con imágenes. Sube primero a Cloudinary en `productos`; la primera imagen queda como principal. Si falla el proceso, registra el error y trata de borrar los objetos ya subidos; responde error genérico 500. |
| `POST /api/foro` | `ForoController::store` | `titulo` opcional string máx. 200; `contenido` requerido string máx. 5000; `imagenes` opcional array máx. 5; cada imagen requerida, JPG/JPEG/PNG/WebP y máx. 5120 KB. | 201 con publicación, relaciones cargadas y contador. Si el título queda vacío, se deriva de `contenido` limitado a 200 caracteres. Contenido y título se recortan. Las imágenes van a Cloudinary en `foro_imagenes`. Errores de integración/guardado se reportan y devuelven 500 genérico. |
| `POST /api/foro/{publicacion}/comentarios` | `ForoController::storeComment` | `{publicacion}` numérico; `comentario` requerido string máx. 2000. | Busca la publicación o devuelve 404, guarda comentario del usuario autenticado y devuelve 201 con usuario limitado a id/nombre/username/foto. |

### Convenciones de respuesta y errores

- Los códigos exactos de validación se generan con `$request->validate`; para peticiones JSON, Laravel responde 422 con `message` y `errors`.
- Autenticación ausente en rutas protegidas: 401.
- Las excepciones en `/api/*` se renderizan como JSON sin redirigir a una ruta web de login.
- Modelos consultados con `findOrFail`: 404.
- Cuenta inactiva al iniciar sesión: 403.
- Creaciones exitosas: 201.
- El formato no es uniforme en todos los endpoints: se mezclan `JsonResource`, `ResourceCollection` y `response()->json()` con sobres propios. No normalices envelopes sin tratarlo como un cambio de contrato.
- Las respuestas de `Usuario` ocultan `password`, pero no se deben serializar modelos completos de forma indiscriminada. Mantén las selecciones de columnas/relaciones explícitas para evitar exponer campos personales.

## 5. Autenticación, identidad y autorización

### Dos modelos y dos tablas distintas

Este detalle es obligatorio para cualquier cambio de autenticación o persistencia:

- `App\Models\User` corresponde a la tabla scaffold `users`. `config/auth.php` lo establece como modelo del proveedor Eloquent del guard web predeterminado (`AUTH_MODEL`, por defecto `User`). `UserFactory` también genera registros para esta tabla.
- `App\Models\Usuario` corresponde a la tabla AEGIS `usuarios`. Extiende `Authenticatable`, usa `HasApiTokens`, oculta `password`, define `$fillable`, casts y relaciones del dominio.
- Los controladores API de registro/login consultan `Usuario`; no crean cuentas AEGIS en `users`.
- `config/auth.php` mantiene el broker scaffold `passwords.users` ligado al provider `users` y a `App\Models\User`; `passwords.usuarios` usa explícitamente el provider `usuarios` y la tabla independiente `usuario_password_reset_tokens`.
- Los tokens API se crean desde `Usuario` y `auth:sanctum` autentica esas peticiones Bearer.
- `AUTH_USUARIO_PASSWORD_RESET_TOKEN_TABLE` puede cambiar el nombre de la tabla del broker AEGIS; su valor predeterminado es `usuario_password_reset_tokens`. No reutilizar la tabla scaffold.
- No sustituyas uno por otro ni crees una migración de usuario nueva sin identificar primero qué guard, token y contrato consumirán el cambio.

### Flujo del token

1. Registro/login valida la entrada.
2. Contraseña se crea/verifica con `Hash::make` / `Hash::check`.
3. Las rutas legacy emiten tokens `aegis-movil` sin caducidad global configurada; no se cambia su comportamiento para Expo.
4. El login web requiere una cuenta activa y verificada y emite `aegis-web` con expiración individual a ocho horas.
5. React mantiene solo el token web en `sessionStorage` por pestaña, vuelve a validar el usuario con `/api/auth/web/me` y envía `Authorization: Bearer <token>`.
6. El logout web elimina el token actual; cambio/restablecimiento de contraseña revocan todos los tokens. La pantalla de seguridad permite listar y revocar sesiones propias.

El uso de Bearer web evita migrar parcialmente a cookies stateful sin conocer los dominios reales de despliegue. `sessionStorage` reduce persistencia respecto del `localStorage` previo, pero el token sigue expuesto a JavaScript y a XSS. No se implementan refresh tokens, MFA ni passkeys; los dos últimos se muestran como no disponibles.

`config/sanctum.php` deja `expiration=null` (sin caducidad global configurada), usa `guard=['web']` para autenticación stateful compatible, y permite configurar dominios stateful y prefijo del token por entorno. Los tokens `aegis-web` tienen expiración individual; no hay endpoint de refresh token en `routes/api.php`.

### Roles y estados

`usuarios.rol` admite `usuario`, `owner` y `admin`; `usuarios.estado` admite `activo`, `suspendido` y `baneado`. El registro asigna `usuario/activo`. El login rechaza cualquier estado distinto de `activo`.

El rol base no reemplaza la autorización. `AppServiceProvider` registra Gates por cuenta activa, propiedad, visibilidad y capacidades delegadas; `EnsureAccountActive` bloquea escrituras de cuentas suspendidas/baneadas. Los consumidores React reciben un resumen en `UsuarioAuthResource`/`capabilities`, pero el servidor revalida.

Los recursos usan visibilidad `publica`, `privada` o `grupo_privado`. Los productos públicos se filtran por `estado_publicacion=activo`; las publicaciones públicas se filtran por visibilidad pública. Los recursos privados requieren propietario, admin o capacidad `leer` delegada. Los cambios externos usan `PATCH/DELETE` con Gates de propietario/delegación/admin. Los puntos físicos requieren owner del recurso o admin, y las cuentas solo pueden administrarse por admin.

Las acciones administrativas pueden auditarse en `auditoria_accesos`. `permisos_delegados` permite otorgar `leer`, `editar`, `eliminar`, `moderar` o `gestionar` sobre una combinación concreta de tipo e ID de recurso.

### Media y adjuntos

`MediaManager` centraliza MIME, tamaño, dimensiones, carga y compensación. `CloudinaryMediaStorage` conserva Cloudinary como proveedor externo. Los controladores de producto y foro usan las tablas `imagenes_producto` e `imagenes_publicacion_foro`, con metadatos mínimos y `public_id` extensible.

Las rutas de adjuntos son operaciones protegidas y revalidan el Gate del recurso. Las imágenes permiten máximo 5 MB y 5000 x 5000 píxeles; los videos permiten máximo 25 MB y se suben como recurso `video`. Avatar y portada reemplazan IDs anteriores y eliminan de Cloudinary solo después de actualizar la cuenta.

`operaciones_media` contiene eliminaciones remotas pendientes con clave idempotente, estado, intentos y próximo intento. Los registros históricos sin `public_id` se mantienen y no generan borrado remoto.

### Perfiles sociales

El perfil propio se obtiene y modifica con `/api/perfil/me`. El contrato público `/api/perfil/{usuario}` permanece compatible y limita campos a información autorizada. Las pestañas públicas usan `/api/perfil/{usuario}/tabs/{tab}` y paginan por `per_page` con máximo 50.

`usuarios.url_publica`, `ciudad_aprox`, `perfil_privado`, `mostrar_seguidores`, `mostrar_presencia`, `ultima_actividad` y `publicacion_fijada_id` modelan identidad visible y privacidad. `enlaces_perfil` limita enlaces a tipos conocidos y URLs HTTP/HTTPS. `seguimientos` distingue pendiente/aceptado. `bloqueos_usuario` diferencia bloqueo y silencio. `desactivaciones_usuario` conserva una ventana de retención antes de procesar la desactivación.

Los recursos públicos nunca seleccionan email, teléfono ni ciudad exacta. Un perfil privado devuelve `PROFILE_PRIVATE` salvo propietario o seguimiento aceptado. Los bloqueos mutuos devuelven `PROFILE_RESTRICTED`.

### Feed social

`publicaciones_foro` es la entidad canónica del feed. `GET /api/foro` conserva el contrato legado y acepta `tab`, `cursor` y `per_page`.

Las publicaciones pueden estar `publicado`, `borrador`, `programado`, `archivado` o `eliminado`. `programada_para` usa Laravel Queue mediante `PublicarPostProgramado`. El cursor combina fecha e ID y evita saltos por registros con la misma fecha.

Para-ti ordena fijados y `rank_base`, después fecha e ID. Siguiendo limita el resultado a seguidores aceptados. Recientes usa fecha e ID. Los bloqueos excluyen ambos lados de la relación.

Las reacciones usan `reacciones_publicacion` con unicidad por publicación, usuario y tipo. Las menciones usan la tabla pivote `menciones_publicacion`. Las etiquetas mantienen registros normalizados y enlaces seguros HTTP/HTTPS.

### Interacciones sociales

Los comentarios mantienen profundidad máxima de una respuesta sobre el comentario principal. Se editan con `estado=editado` y se eliminan con estado `eliminado`; se conserva el hilo.

`reposts` tiene unicidad actor/publicación. `guardados` usa `recurso_tipo/recurso_id` con unicidad por usuario/recurso y colecciones opcionales propias. `reportes` admite contexto por tipo e ID. Los endpoints revalidan propiedad, visibilidad y bloqueos.

### Comunidades

Las comunidades usan `comunidades`, `membresias_comunidad` y `acciones_comunidad`. Los roles owner/moderador/miembro son exclusivos de una comunidad y no otorgan permisos globales.

`publicaciones_foro.comunidad_id` vincula posts comunitarios sin duplicar la entidad de publicación. Los posts privados usan `grupo_privado` y el controlador exige membresía activa.

Las comunidades privadas no aparecen en el directorio público ni en feeds/enlaces directos sin membresía activa. Las solicitudes usan estado `solicitado`; las invitaciones usan `invitado`.

### Foro avanzado

`publicaciones_foro.tipo` distingue discusión, pregunta, tutorial, encuesta y anuncio. `interaccion_estado` bloquea comentarios al cerrar un hilo.

Las soluciones usan `respuesta_aceptada_id` y el índice `es_solucion`. Solo autor de la pregunta, moderador owner/moderador de comunidad o admin pueden marcar una solución.

Las encuestas usan `encuestas`, `opciones_encuesta` y `votos_encuesta`. Una encuesta simple elimina votos previos del usuario antes de insertar una opción nueva. Las múltiples permiten opciones únicas.

### Marketplace

`productos.estado_publicacion` evoluciona entre borrador, activo, pausado, reservado, vendido, archivado y oculto. Los campos pueden quedar parciales solo para borradores.

`PATCH /api/productos/{id}/estado` aplica transiciones permitidas y registra `historial_producto`. `POST /api/productos/{id}/renovar` activa/renueva un anuncio validable.

Los filtros públicos conservan `GET /api/productos`; `precio_min` y `precio_max` usan comparación numérica, incluyendo precio cero. Las rutas `/api/productos/mis*` son propias del usuario autenticado.

### Descubrimiento de marketplace

`GET /api/productos` combina búsqueda, categoría, estado, precio mínimo/máximo, ubicación, marca, atributos, recencia y orden. Los filtros SQL usan índices por precio/categoría/estado/ubicación.

`GET /api/productos/comparar?ids=1,2` muestra hasta cuatro productos activos públicos y una matriz de atributos JSON. `GET /api/productos/{id}/similares` usa categoría y ±20% de precio sin afirmar ranking de IA.

Las búsquedas se registran en `busquedas_productos`; las comparaciones opcionales en `comparaciones_producto`. React persiste preferencias locales y sincroniza filtros activos en el hash URL.

### Detalle comercial

`GET /api/productos/{id}` devuelve galería, atributos, políticas, entrega, disponibilidad, preguntas respondidas, reseñas elegibles y metadatos SEO. No expone teléfono, email ni dirección exacta.

Las preguntas viven en `preguntas_producto`. Públicamente solo aparecen las `respondida`. El vendedor propietario y administradores pueden responder/moderar. Visitantes pueden preguntar solo en anuncios activos o reservados públicos.

### Tiendas e inventario

`tiendas` separa identidad comercial de `Usuario`. `miembros_tienda` asigna owner/gestor/vendedor dentro de la tienda. `productos.tienda_id` vincula anuncios sin duplicar identidad.

`verificaciones_tienda` conserva solicitudes protegidas y revisiones administrativas. La API pública solo expone el estado aprobado como insignia verificable.

`inventario_producto` controla stock y reservas por producto. `movimientos_inventario` registra entradas, salidas, reservas, liberaciones y ajustes. Las operaciones usan bloqueo transaccional y rechazan stock negativo.

### Mensajería

`conversaciones` contiene DMs/contextos y grupos. `participantes_conversacion` controla acceso, rol, lectura opt-in, archivo y silencio. `mensajes` conserva contenido y cita; `adjuntos_mensaje` referencia el proveedor remoto. `lecturas_mensaje` almacena recibos solo opt-in.

Las DMs usan `contexto_clave` ordenado por participante y producto para evitar duplicados. Los bloqueos impiden abrir o enviar. El backend limita envíos a 30 por minuto por cuenta.

No existe proveedor WebSocket/Reverb/Pusher configurado. React usa polling cada cinco segundos contra `/api/mensajes`; no muestra presencia ni conexión falsamente.

### Ofertas y operaciones comerciales

`ofertas` vincula producto, comprador y vendedor. `historial_oferta` conserva cambios auditados. `reservas_producto` bloquea disponibilidad temporalmente y `operaciones_comerciales` representa el acuerdo sin procesar pagos.

Aceptar una oferta crea reserva y operación pendiente. Completar solo puede hacerlo el vendedor o admin y cambia el anuncio a vendido. Cancelar/disputar conserva el estado de acuerdo y libera la reserva cuando corresponde.

### Puntos físicos y encuentros

Los puntos tienen owner, estado público y estado de revisión. Solo puntos activos/aprobados aparecen en el directorio.

Los encuentros pueden ser propuestos por comprador y confirmados/reprogramados por vendedor. Cancelación y finalización quedan auditadas.

Los QR no contienen datos personales: se genera un token opaco que el servidor no devuelve como texto persistido, salvo hash SHA-256 en `token_hash`. Expiran, se usan una vez y solo owner del punto/admin pueden validar.

### Notificaciones

`notificaciones` admite categoría, tipo, actor, objeto, destino, lectura, archivo y clave dedupe por usuario. `preferencias_notificacion` configura in-app, email y push web por categoría.

Las notificaciones de seguridad nunca quedan silenciadas in-app. Las demás pueden deshabilitarse. Email y push no se consideran activos sin credenciales/proveedor externo configurado.

### Búsqueda unificada

La búsqueda global usa SQL sobre tablas existentes y el valor real de volumen no justifica Elasticsearch/Meilisearch.

`busquedas_guardadas`, `historial_busqueda` y `preferencias_busqueda` conservan búsquedas, alertas, recomendaciones y preferencias. Los perfiles privados, publicaciones privadas y productos privados quedan excluidos.

### Preferencias de usuario

`preferencias_usuario` guarda JSON versionado por identidad AEGIS. Los valores se validan por versión y se combinan con defaults seguros.

Las rutas `/api/preferencias` permiten leer, guardar y restablecer. React usa preview local y persiste servidor. Tema, densidad, contraste y movimiento no deben usar datos de otros usuarios ni alterar valores comerciales canónicos.

### Reseñas elegibles

`calificaciones` requiere encuentro finalizado dentro de treinta días y contexto vendedor/comprador/punto. La unicidad es encuentro, autor y ámbito.

El receptor se determina por el participante correspondiente. Las reseñas de punto usan además `punto_fisico_id`. Los estados activa/editada cuentan en agregados; disputada/anulada no.

`reputacion_agregados` conserva cantidad, promedio y distribución recalculados desde calificaciones válidas.

### Integración cruzada

`referencias_publicacion` vincula explícitamente una publicación con producto, publicación, comunidad o punto. La referencia comercial mantiene solo IDs/FK y consulta el producto original al serializar.

No se copian precio, stock ni estado. Anuncios privados, borradores, archivados, vendidos u ocultos generan una tarjeta no disponible.

## 6. Modelos Eloquent y relaciones

| Modelo | Tabla | Relaciones definidas / comportamiento |
|---|---|---|
| `Usuario` | `usuarios` | hasMany productos, publicaciones, comentarios; hasMany puntos físicos mediante `owner_id`. Usa Sanctum, `$timestamps=false`; `password` oculto. |
| `User` | `users` por convención | Modelo scaffold con factory, `Notifiable`, campos `name/email/password`; separado de AEGIS. |
| `Categoria` | `categorias` | hasMany productos. `$timestamps=false`. |
| `Producto` | `productos` | belongsTo vendedor (`Usuario`) y categoría; hasMany imágenes y encuentros; scope `activo` filtra `estado_publicacion=activo`; `$timestamps=false`. |
| `ImagenProducto` | `imagenes_producto` | belongsTo producto; `principal` casteado a boolean; `$timestamps=false`. |
| `Publicacion` | `publicaciones_foro` | belongsTo usuario; hasMany comentarios e imágenes del foro ordenadas por `orden`; `$timestamps=false`. |
| `Comentario` | `comentarios_foro` | belongsTo publicación y usuario; `$timestamps=false`. |
| `ImagenPublicacionForo` | `imagenes_publicacion_foro` | belongsTo publicación; `public_id` oculto; usa timestamps Eloquent porque la migración tiene `created_at/updated_at`. |
| `PuntoFisico` | `puntos_fisicos` | belongsTo owner (`Usuario`); hasMany encuentros; `$timestamps=false`. |
| `Encuentro` | `encuentros` | belongsTo comprador, vendedor, producto y punto; hasOne QR; hasMany calificaciones; `$timestamps=false`. |
| `CodigoQr` | `codigos_qr` | belongsTo encuentro; `$timestamps=false`. |
| `Calificacion` | `calificaciones` | belongsTo encuentro, autor y receptor; `$timestamps=false`. |
| `Reporte` | `reportes` | belongsTo reportante y reportado; `$timestamps=false`. |
| `Notificacion` | `notificaciones` | belongsTo usuario; `$timestamps=false`. |

Los casts de fechas/reputación/precio están en cada modelo; consulta el modelo antes de cambiar serialización o formato. Las columnas de fecha de dominio tienen nombres propios (`fecha_publicacion`, `fecha_creacion`, etc.); no agregues `created_at/updated_at` por supuesto.

### Serialización de producto

`ProductoResource` emite:

- campos base: `id`, `usuario_id`, `categoria_id`, `titulo`, `descripcion`, `precio`, `estado_producto`, `ciudad`, `estado_publicacion`, `fecha_publicacion`;
- `categoria` solo si fue cargada: id, nombre y descripción;
- `vendedor` solo si fue cargado: id, nombre, apellido, username, `foto_perfil` y reputación;
- `imagenes` solo si fue cargada: id, imagen y principal;
- `imagen_principal`: primera imagen marcada principal, o primera imagen disponible, cuando las imágenes se cargaron.

En la base, la columna canónica del avatar es `usuarios.foto_perfil_url`; los eager loads API la renombran `foto_perfil` para el contrato serializado. No crees ni consultes una columna persistida `foto_perfil` por copiar ese alias.

## 7. Esquema persistente y límites referenciales

El esquema de AEGIS se crea con las migraciones de `database/migrations`. Las migraciones `0001_01_01_*` son tablas scaffold Laravel; las `2026_10_11_*` y posteriores representan el dominio.

### Tablas de dominio

| Tabla | Campos relevantes y estados | Relaciones / efectos |
|---|---|---|
| `usuarios` | nombre, apellido, username nullable unique, email unique, password, teléfono/ciudad, URL/ID de fondo y avatar, descripción, reputación; rol `usuario/owner/admin`; estado `activo/suspendido/baneado`; `fecha_registro`. | Entidad de identidad AEGIS. Otras tablas la referencian. |
| `categorias` | id, nombre, descripción nullable. | Catálogo de categorías de productos. La migración no define unique sobre `nombre`. |
| `productos` | usuario_id, categoria_id, título máx. 150, descripción, precio decimal(12,2), estado_producto `nuevo/usado/reacondicionado`, ciudad nullable, estado_publicacion `activo/vendido/oculto`, fecha_publicacion. | FK vendedor con cascade delete; FK categoría sin cascade explícito. |
| `imagenes_producto` | producto_id, URL/ruta en `imagen`, `principal` boolean. | FK producto cascade delete. No persiste `public_id` de Cloudinary. |
| `publicaciones_foro` | usuario_id, título máx. 200, contenido, fecha_publicacion. | FK usuario cascade delete. |
| `comentarios_foro` | publicacion_id, usuario_id, comentario, fecha_comentario. | FK publicación y usuario; ambos cascade delete. |
| `imagenes_publicacion_foro` | publicacion_id, imagen, `public_id`, orden, timestamps Laravel. | FK publicación cascade delete; `public_id` identifica la imagen remota. |
| `puntos_fisicos` | owner_id, nombre, descripción, dirección, ciudad, teléfono, imagen, reputación, estado `activo/pendiente/suspendido`, fecha_registro. | FK owner cascade delete. |
| `encuentros` | comprador_id, vendedor_id, producto_id, punto_fisico_id, fecha/hora, estado `pendiente/confirmado/cancelado/finalizado`, fecha_creacion. | FKs a usuario, producto y punto; no tienen cascade explícito en esta migración. |
| `codigos_qr` | encuentro_id unique, código, estado `activo/usado/expirado`, fecha_generacion. | Has-one por encuentro; FK encuentro cascade delete. |
| `calificaciones` | encuentro_id, autor_id, receptor_id, puntuación unsigned tinyint, comentario nullable, fecha_calificacion. | FK encuentro cascade delete y FKs de usuarios. |
| `reportes` | usuario_reporta_id, usuario_reportado_id, motivo, descripción, estado `pendiente/revisado/resuelto`, fecha_reporte. | FKs de usuarios. |
| `notificaciones` | usuario_id, título, mensaje, leida boolean, fecha_creacion. | FK usuario cascade delete. |

### Tablas scaffold e infraestructura

- `users`: `id`, `name`, `email` único, `email_verified_at`, `password`, `remember_token`, timestamps. Es el modelo scaffold, no la identidad API AEGIS.
- `password_reset_tokens`: email como PK, token y fecha de creación nullable. Está vinculado al broker scaffold `users`.
- `sessions`: id string PK, user_id nullable/index, IP, user agent, payload y last_activity index.
- `cache`: key PK, value y expiration index. `cache_locks`: key PK, owner y expiration index.
- `jobs`: queue/index, payload, attempts y timestamps Unix de reserva/disponibilidad/creación. `job_batches`: contadores, IDs, options y timestamps Unix. `failed_jobs`: UUID único, conexión, queue, payload, excepción y failed_at.
- `personal_access_tokens`: id, `tokenable_type/tokenable_id` polimórficos, name, hash token único, abilities nullable, last_used_at, expires_at index y timestamps.
- `migrations`: repositorio que registra migración y batch.

La aplicación tiene relaciones Eloquent para calificaciones/reportes/notificaciones aunque actualmente no hay rutas API para gestionarlas.

## 8. Persistencia, conexiones y configuración

### Conexión de base de datos

`config/database.php` selecciona `DB_CONNECTION` (fallback SQLite). Configura SQLite, MySQL, MariaDB, PostgreSQL y SQL Server; las credenciales se obtienen del entorno. Para MySQL/MariaDB se configura `utf8mb4`, prefijo vacío y modo estricto. `DB_URL`, cuando se define, también puede proporcionar la conexión.

Variables que el agente debe conocer por nombre, sin copiar sus valores:

- Aplicación: `APP_NAME`, `APP_ENV`, `APP_DEBUG`, `APP_URL`, `APP_KEY`, `APP_LOCALE`.
- Base de datos: `DB_CONNECTION`, `DB_URL`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, charset/collation y variables específicas del driver.
- CORS/frontend: `FRONTEND_URL`; el frontend puede configurar `VITE_API_URL`.
- Sanctum: `SANCTUM_STATEFUL_DOMAINS`, `SANCTUM_TOKEN_PREFIX`.
- Imágenes: `CLOUDINARY_URL` o `CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET` (con alias `CLOUDINARY_KEY`/`CLOUDINARY_SECRET`) y `CLOUDINARY_CLOUD_NAME`; `CLOUDINARY_NOTIFICATION_URL` es opcional.
- Infraestructura Laravel: variables `SESSION_*`, `CACHE_*`, `QUEUE_*`, `REDIS_*`, `MAIL_*`, `AWS_*`, `LOG_*`.

No se versionan credenciales. `.env.example` es una plantilla, no representa necesariamente la conexión activa de cada máquina. Nunca uses ni publiques `.env` como documento.

La configuración SQLite default apunta a `database/database.sqlite`; el backend también contiene un archivo raíz llamado `aegis` con firma SQLite. No infieras que ese archivo es la base activa: la conexión elegida depende de `DB_CONNECTION` y `DB_DATABASE`.

`config/app.php` fija timezone `UTC`; `APP_LOCALE`/`APP_FALLBACK_LOCALE` usan fallback `en`. La key de aplicación se toma de `APP_KEY`; no es una credencial que deba agregarse a documentación ni a commits.

### CORS y sesiones/token

`config/cors.php` aplica a `api/*`, permite cualquier método y header, y permite el origen indicado por `FRONTEND_URL` más `http://localhost:8081`. `supports_credentials=false`; no diseñes el cliente suponiendo cookies CORS habilitadas.

Sanctum admite dominios stateful desde `SANCTUM_STATEFUL_DOMAINS`; el flujo de cliente documentado por el backend usa tokens Bearer. `config/session.php` tiene driver `SESSION_DRIVER` (fallback database), duración configurable (fallback 120 minutos), cookie `http_only=true`, `same_site=lax`; sesión no equivale al token personal utilizado por los tests/API móvil.

### Cloudinary y archivos

- `config/cloudinary.php` forma `cloud_url` desde `CLOUDINARY_URL` o componentes separados.
- `ProductoController::store` y `ForoController::store` invocan `Cloudinary\Cloudinary` directamente; no usan `Storage::disk()` ni una abstracción propia de almacenamiento.
- Producto: carpeta remota `productos`; guarda `secure_url` en `imagenes_producto.imagen`, marca principal la primera imagen y no guarda el public ID.
- Foro: carpeta remota `foro_imagenes`; guarda URL, `public_id` y orden en `imagenes_publicacion_foro`.
- Ambos ejecutan la escritura DB dentro de una transacción y tratan de destruir objetos subidos si falla la operación dentro del bloque protegido. La transacción SQL no incluye Cloudinary: la compensación remota es manual.
- La construcción del cliente Cloudinary sucede antes del bloque `try` de ambos controladores; un fallo de configuración/construcción no pasa por la respuesta genérica/limpieza de ese `catch` y queda al manejo estándar de excepciones Laravel.
- El disco `public`/S3 de `config/filesystems.php` está disponible para Laravel, pero no es el camino usado por estos dos controladores.
- La configuración Cloudinary real es necesaria para probar una subida satisfactoria; las pruebas existentes no prueban una subida remota real.

## 9. CORS, autenticación y seguridad operacional

- No hay prefijo de versión (`/api/v1`); la ruta contractual actual es `/api/...`.
- No se encontró una capa de autorización por rol, middleware de rol o policy.
- Las rutas de lectura descritas como públicas no requieren token.
- No incluyas `password`, tokens, teléfono u otros datos privados en nuevos recursos sin una decisión explícita de contrato y prueba de exposición.
- `Usuario::$hidden` oculta password en serialización Eloquent. Las respuestas de perfil, vendedores y autores usan selecciones explícitas más estrechas.
- Los errores internos de carga Cloudinary se envían a `report()` y la respuesta API es genérica; no devuelvas mensajes de proveedor, secretos ni stack traces al cliente.
- `APP_DEBUG=true` no debe habilitarse en producción.
- Los seeders de demostración lanzan excepción si `APP_ENV=production`.

## 10. Seeders y datos de prueba

`DatabaseSeeder` llama `DemoDataSeeder`; este ejecuta primero `CategoriaSeeder` y agrega datos de usuarios, productos e imágenes, publicaciones/comentarios e imagen del foro, punto físico, encuentros/QR, calificación, reporte y notificaciones.

- Idempotencia: inserta solo si no encuentra el registro por su clave de identidad del seeder.
- Conservación: no vacía tablas ni actualiza los registros encontrados.
- Guard: no permite ejecutar datos demo con `APP_ENV=production`.
- El comando normal para una base ya migrada es `php artisan db:seed`.
- Para migrar y seedear en una base nueva: `php artisan migrate --seed`.
- No uses `migrate:fresh` en una base de usuario.
- Las cuentas locales de prueba y su contraseña común están documentadas en `README.md`. Nunca se deben tratar como credenciales productivas.

El test `DemoDataSeederTest` corre con `RefreshDatabase` en SQLite en memoria; comprueba repetición y que un usuario preexistente no desaparezca.

## 11. Pruebas, desarrollo y comandos

### Pruebas

`phpunit.xml` fuerza `APP_ENV=testing`, una `APP_KEY` determinista exclusiva de tests, `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`, caché array, cola sync, sesión array y coste bcrypt reducido. Los tests con `RefreshDatabase` no deben operar sobre la base local MySQL.

Cobertura de `PublicApiTest`:

- filtros, paginación, solo productos activos y ausencia de campos privados;
- detalle de productos;
- autenticación requerida y requisito de imagen al crear producto;
- login/token Sanctum, `/me`, logout y revocación;
- registro sobre la tabla/campos `usuarios`;
- feed del foro y campos privados de autores/comentarios;
- creación de publicaciones y comentarios autenticados;
- rechazo de adjuntos no imagen;
- respuesta pública de perfil y puntos activos;
- inicio/categorías y CORS desde el origen React configurado.

No se debe afirmar que la integración Cloudinary remota está probada por esa suite.

Comandos de verificación:

```bash
php artisan route:list --path=api
php artisan test
composer format:check
```

### Instalación y ejecución

El README da como flujo base:

```bash
composer install
php artisan migrate --seed
php artisan serve
```

`composer.json`:

- `setup`: instala Composer, crea `.env` desde ejemplo si falta, genera key, migra con `--force`, instala npm y compila assets; este script no ejecuta `--seed`.
- `dev`: levanta concurrentemente `php artisan serve`, queue listener, Pail y Vite mediante `concurrently`.
- `test`: limpia config y ejecuta `php artisan test`.
- `format`: aplica Laravel Pint al backend.
- `format:check`: verifica el estilo con Pint (`--test`). El baseline actual puede reportar archivos preexistentes; no ejecutar `composer format` sin revisar el diff de los archivos afectados.

Servidor Laravel default: `http://127.0.0.1:8000`; rutas API locales, por ejemplo, `http://127.0.0.1:8000/api/productos`.

## 12. Límites funcionales actuales: no asumir que están implementados

Las migraciones y modelos no garantizan una API. Al inspeccionar `routes/api.php`, solo existen las 14 rutas documentadas.

No hay endpoints API actuales para:

- crear/editar/eliminar productos, ni eliminar imágenes;
- actualizar perfil privado/avatar/fondo;
- crear/administrar puntos físicos;
- solicitar, editar o cambiar estado de encuentros;
- administrar o validar códigos QR;
- crear/consultar calificaciones;
- crear/administrar reportes;
- listar/marcar notificaciones leídas;
- panel administrativo, moderación, gestión de roles o administración de usuarios;
- recuperación de contraseña;
- refresh/revocación de todos los tokens.

El perfil expuesto es público y limitado; no hay un endpoint `/api/me` de escritura ni perfil privado adicional.

### Diferencias de implementación que condicionan cambios

1. El nombre persistido del avatar en `usuarios` es `foto_perfil_url`; `foto_perfil` en algunas consultas es un alias de salida.
2. La tabla `users` scaffold no es `usuarios`. Toda nueva funcionalidad de cuenta AEGIS debe identificar el modelo y guard correcto.
3. El API de productos exige 1–5 imágenes en Cloudinary. El formulario MVC PHP es otro flujo y puede tener requisitos distintos; no uses el comportamiento MVC como contrato del API Laravel.
4. La lista de productos aplica `precio_max` solo cuando PHP evalúa su valor como no vacío; por ello `precio_max=0` no activa actualmente el filtro aunque pase validación.
5. `ProductoResource` es la única serialización API propia; otras rutas serializan modelos/arrays y tienen envelopes distintos.
6. `usuarios.rol` se escribe y devuelve, pero el grupo de rutas no aplica permisos por rol.
7. `imagenes_producto` no persiste `public_id` Cloudinary. No diseñes borrado/actualización de objetos suponiendo que puede recuperar ese identificador de la tabla.
8. No se encontró uso de Jobs, Mail, Notifications Laravel, Cache, Events, Policies o repositorios en `app/`; las tablas/configuraciones del framework disponibles no significan que esos flujos estén conectados a AEGIS.

## 13. Guía de cambios para agentes

### Al agregar o cambiar un endpoint

1. Añade ruta API explícita y decide si es pública o dentro de `auth:sanctum`.
2. Valida todas las entradas en el controlador o en un Form Request nuevo solo si su reutilización/alcance lo justifica.
3. Usa `Usuario` para cuentas AEGIS; comprueba relaciones y nombres de FK en migraciones/modelos.
4. Define y prueba status codes, envelope, campos visibles y errores.
5. Usa transacción SQL cuando una operación crea varias filas relacionadas. Para integraciones externas, agrega compensación/limpieza y registra el error.
6. Si usas Cloudinary, valida env y formatos/resolución de respuesta; nunca registres credenciales ni devuelvas detalles internos.
7. Añade pruebas Feature para autenticación, validación, éxito, errores/404 y campos privados relevantes.
8. Actualiza la tabla de endpoints y cualquier limitación que deje de ser cierta en esta guía y el README.

### Al cambiar el esquema

1. Comprueba primero si el cambio es imprescindible o si basta con las columnas/relaciones actuales.
2. Agrega una nueva migración; no edites una migración ya aplicada para simular una actualización de base.
3. Incluye FK, índice, nulabilidad, default, enum/valores y comportamiento de borrado según la regla solicitada.
4. Actualiza fillable/casts/relaciones/serialización, validaciones y seeders dependientes.
5. Prueba migración en el entorno SQLite de tests y verifica reversión cuando corresponda.
6. No ejecutes comandos destructivos sobre `.env` local ni una conexión persistente.

### Al trabajar con nuevas áreas de dominio

No agregues “capas limpias” por convención. El patrón vigente es Controller → Eloquent/Query Builder → DB y, en dos operaciones, Cloudinary. Introduce servicio, policy, Form Request, recurso o job solo cuando tenga responsabilidad concreta y se use de forma consistente.

## 14. Índice de componentes fuente

### Rutas

- `routes/api.php`
- `routes/web.php`
- `routes/console.php`

### Controladores

- `app/Http/Controllers/Api/AuthController.php`
- `app/Http/Controllers/Api/ForoController.php`
- `app/Http/Controllers/Api/InicioController.php`
- `app/Http/Controllers/Api/PerfilController.php`
- `app/Http/Controllers/Api/ProductoController.php`
- `app/Http/Controllers/Api/PuntoFisicoController.php`
- `app/Http/Controllers/Controller.php`

### Modelos/recurso

- `app/Models/Usuario.php`
- `app/Models/User.php`
- `app/Models/Categoria.php`
- `app/Models/Producto.php`
- `app/Models/ImagenProducto.php`
- `app/Models/Publicacion.php`
- `app/Models/Comentario.php`
- `app/Models/ImagenPublicacionForo.php`
- `app/Models/PuntoFisico.php`
- `app/Models/Encuentro.php`
- `app/Models/CodigoQr.php`
- `app/Models/Calificacion.php`
- `app/Models/Reporte.php`
- `app/Models/Notificacion.php`
- `app/Http/Resources/ProductoResource.php`

### Migraciones AEGIS

- `2026_10_11_000000_create_usuarios_table.php`
- `2026_10_11_000001_create_categorias_table.php`
- `2026_10_11_000002_create_productos_table.php`
- `2026_10_11_000003_create_imagenes_producto_table.php`
- `2026_10_11_000004_create_publicaciones_foro_table.php`
- `2026_10_11_000005_create_comentarios_foro_table.php`
- `2026_10_11_000006_create_puntos_fisicos_table.php`
- `2026_10_11_000007_create_encuentros_table.php`
- `2026_10_11_000008_create_codigos_qr_table.php`
- `2026_10_11_000009_create_calificaciones_table.php`
- `2026_10_11_000010_create_reportes_table.php`
- `2026_10_11_000011_create_notificaciones_table.php`
- `2026_10_12_191725_create_personal_access_tokens_table.php`
- `2026_11_19_000000_create_imagenes_publicacion_foro_table.php`

La migración `personal_access_tokens` es infraestructura Sanctum. Las migraciones scaffold de `users`, cache y jobs se encuentran en `0001_01_01_*`.

### Configuración y pruebas

- Config relevante: `config/app.php`, `auth.php`, `cache.php`, `cloudinary.php`, `cors.php`, `database.php`, `filesystems.php`, `logging.php`, `mail.php`, `queue.php`, `sanctum.php`, `services.php`, `session.php`.
- Bootstrap: `bootstrap/app.php`, `bootstrap/providers.php`.
- Tests: `tests/Feature/PublicApiTest.php`, `tests/Feature/DemoDataSeederTest.php`, `tests/Feature/ExampleTest.php`.
- Seeders: `database/seeders/DatabaseSeeder.php`, `CategoriaSeeder.php`, `DemoDataSeeder.php`.
