# Catálogo y trazabilidad funcional

## Criterios

- **Existente:** UI web y API ejecutan el flujo funcional y hay evidencia de integración/prueba; el nombre de una tabla por sí solo no cuenta.
- **Parcial:** hay una parte real del flujo y/o una maqueta/local-only, pero faltan operaciones para completar el caso.
- **Ausente:** no se halló un flujo funcional web/API; una vista demo aislada se indica como tal.
- Las siglas `US`, `RS`, `MK`, `FO`, `MS` y `BU` no tienen glosario ni expansión en el repositorio. Se conservan literalmente; las asociaciones conceptuales de esta matriz son operativas y no intentan redefinirlas.

## Matriz

| Área del catálogo | Estado | Evidencia React | Evidencia Laravel / datos | Límites comprobados |
|---|---|---|---|---|
| **US** (sigla no definida; asociación a identidad/usuario) | **Parcial** | `src/components/auth/views/Login.jsx`, `Register.jsx`, `src/auth/AuthProvider.jsx`; UI usa `authApi` | `POST /api/register`, `/login`, `GET /api/me`, `POST /api/logout`; `AuthController`, `Usuario`, Sanctum. Pruebas de registro/login/me/logout en `PublicApiTest` | No hay actualización de cuenta privada, recuperación de contraseña, revocación global ni control por rol |
| **RS** (sigla no definida; reputación/confianza) | **Parcial** | Perfil/detalle muestran reputación/badges; no hay flujos de calificación conectados | `usuarios.reputacion`, `calificaciones`, encuentros/QR existen en modelos/migraciones; no hay rutas de calificación/verificación | Ninguna evaluación crea/lee reputación por API actual |
| **MK** (sigla no definida; marketplace) | **Parcial** | Home, catálogo y detalle llaman API. Publicar producto llama `productApi.create`. Carrito en `carritoDemo.js` | `GET /inicio`, `/categorias`, `/productos`, `/productos/{id}` y `POST /productos`; `ProductoResource`, validación y almacenamiento Cloudinary | Lectura real y escritura parcial. No hay compra, pago, checkout ni carrito persistente/API. La prueba no verifica subida remota satisfactoria |
| **FO** (sigla no definida; foro/comunidad) | **Parcial** | `Foro.jsx` carga, crea publicación y comenta mediante `forumApi`; detalle consulta el feed y comenta | `GET/POST /api/foro`, `POST /api/foro/{id}/comentarios`; tests de feed, crear texto/comentar y adjunto inválido | No hay editar/eliminar/moderar publicaciones o comentarios, reportes desde flujo ni gestión de reacciones. Cloudinary real no está cubierto |
| **MS** (sigla no definida; mensajería) | **Ausente** como funcionalidad conectada; **maqueta presente** | `Mensajes.jsx` opera sobre `CHATS` de `mensajesDemo.js`; enviar y adjuntar cambia memoria/localidad del módulo | No hay entidad/modelo/migración ni ruta/conector de mensajes | No hay persistencia, entrega entre usuarios, historial, permisos ni tiempo real |
| **BU** (sigla no definida; asociación tentativa a punto/owner/negocio) | **Parcial** | `puntosFisicos/views/Index.jsx`, `Encuentros.jsx` y paneles usan fixtures/estado local | `GET /api/puntos-fisicos` lee puntos activos; tablas/modelos de puntos y encuentros existen | Crear/configurar punto, solicitudes/estados de encuentro, dashboard owner y QR no tienen endpoints |
| **Personalización** | **Parcial** | `perfil/views/Editar.jsx` guarda perfil, campos y preferencias en `localStorage`; perfil público sí consulta API | `GET /api/perfil/{id}`; `usuarios` tiene avatar/fondo/descripcion; no hay `PATCH /me` | Cambios no se sincronizan entre dispositivos ni actualizan servidor; ajustes de notificaciones no cambian preferencias backend |
| **Seguridad** | **Parcial** | `AuthProvider` renueva identidad con `/me`, pero persiste bearer en `localStorage`; wrapper solo protege dos rutas | Sanctum, hash de password, validaciones y pruebas; no se encontraron Policies/Gates ni middleware de rol | No dar por autorizados owner/admin por el campo `rol`; falta contrato de exposición mínima para sesión |
| **Notificaciones** | **Parcial** | Preferencia visual de correo en ajustes local-only; no hay bandeja conectada | `Notificacion`/`notificaciones` y datos semilla existen; no hay rutas API de lectura/marcado/envío | Modelado y registros demo no prueban entrega, preferencias ni estado leído |
| **Administración** | **Ausente** como capacidad backend; **prototipo presente** | `App.jsx` expone `/admin`; dashboards/vistas muestran estadísticas y enlaces; no están conectados a API | No hay rutas admin/owner, policies ni consultas administrativas en API actual | No gestiona usuarios, catálogo, reportes o moderación de manera real; `/admin` no tiene guard en wrapper actual |

No hay un dominio completo marcado como “existente” de extremo a extremo. Los cimientos reales más avanzados son identidad básica, lectura/publicación de productos y foro; el alcance de cada uno sigue siendo parcial.

## Trazabilidad de UI y API

| Pantalla React (ruta hash) | Llamada/estado | Verificación | Resultado |
|---|---|---|---|
| Inicio `/` | `productApi.home()`, `productApi.categories()` | API route list, test `home and category endpoints...`; sesión de navegador de lectura | Datos de producto/categoría llegan cuando CORS permite el origen |
| Catálogo `/productos` / `/novedades` | `productApi.categories()`, `productApi.list()` | Tests de filtros, paginación, solo activos | Integración real; `novedades` reutiliza el catálogo, no hay endpoint de novedades |
| Detalle `/productos/detalle?id=…` | `productApi.show(id)` | Test `product details only return active products` | Integración real |
| Publicar `/productos/crear` | `productApi.create(product, token)` multipart | Tests comprueban autenticación y requisito de imagen; no una subida Cloudinary de éxito | Parcial |
| Foro `/foro` y `/publicacion` | `forumApi.list/create/comment` | Tests de feed, publicación/comentario y rechazo de no-imagen | Flujo texto conectado; carga remota de imágenes pendiente de prueba |
| Perfil `/perfil` | `profileApi.show(userId)`; comentarios usan `forumApi.comment` | Test de perfil público | Perfil visible conectado; no hay edición de perfil API |
| Puntos `/puntos-fisicos` | Fixture `PUNTOS` | API de puntos existe y tiene test, pero esta pantalla no usa `api.js` | No es extremo a extremo |
| Chat `/mensajes` | `CHATS` en memoria y `mensajesDemo` | No hay endpoint/modelo | Demo |
| Encuentro `/configurar-encuentro` | `PUNTOS`, `buscarProducto` y estado React | Tablas de encuentro sí existen | Demo; no persiste |
| Ajustes `/perfil/editar` | `localStorage` | Sin endpoint de escritura | Persistencia solo en navegador |
| Admin `/admin` | `stats` con default `{}` y vistas/componentes | Sin endpoints backend | UI maqueta, no administración funcional |
| Carrito | `carritoDemo.js` / `localStorage` según helpers de carrito | Sin API de órdenes/pagos | Estado local |
| Errores HTTP en React | `src/services/api.js` produce `ApiError`; `src/components/shared/ApiState.jsx` representa error, acceso restringido, loading, vacío, feedback y 404 | No altera rutas ni envelopes API existentes | Integración parcial en catálogo y foro; 400/401/403/404/409/422/429/500 y red tienen mensajes centralizados; 429 no implica que exista limitación de tasa server-side |
| Rutas React desconocidas | Comodín de `src/App.jsx` muestra 404; `/plantilla` conserva la plantilla intencional | Sin cambio a las 14 rutas API | Verificado por build; cobertura visual manual pendiente |

## Consumidores y compatibilidad

React consume el backend mediante `src/services/api.js` (fetch nativo; no Axios). El cliente Expo también llama login/registro, categorías, productos, foro, perfil y creación multipart en `aegis-movil/src/models/api/apiClient.jsx`. Por lo tanto, cambios futuros a campos, rutas o envelopes afectan al menos dos clientes activos. No se debe cambiar el contrato existente ni trasladar la UI MVC sin pruebas y plan de compatibilidad.

Para Incremento 01, el cliente React conserva intactos los envelopes de éxito (`ProductoResource`, `response()->json()` y variantes), agrega errores de transporte con `status/errors/Retry-After` y evita exponer mensajes internos de 500. `src/services/api.test.js` verifica que no se normalicen los envelopes. El UI nuevo reutilizable se integra en estados de catálogo y foro sin cambiar la forma de los endpoints.

El MVC PHP mantiene rutas de servidor propias en `AEGIS-MVC-MODULAR/routes/web.php` (34 entradas GET/POST, entre ellas `/productos`, `/foro`, `/perfil`, `/puntos-fisicos` y `/admin`). Su existencia no prueba que sea el frontend del producto nuevo ni que sus escrituras se reflejen en el contrato Laravel.

## Evidencia automatizada disponible

`tests/Feature/PublicApiTest.php` cubre catálogo, autenticación, escritura de foro, perfil/puntos, CORS y privacidad de campos de autor/vendedor. `DemoDataSeederTest.php` verifica seeder repetible en SQLite en memoria. Faltan, como mínimo, tests de autorización por rol/ownership, escritura de preferencias, CRUD/estados de encuentro, notificaciones/admin, persistencia de chat y carga Cloudinary satisfactoria/compensación. Ver el [reporte de pruebas](./reporte-pruebas-arranque.md).
