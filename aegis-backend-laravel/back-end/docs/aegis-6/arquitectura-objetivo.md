# Arquitectura objetivo y evolución web

## Base de diseño

Este diseño es una dirección modular derivada del código actual, no una implementación ni un cambio de contrato. El frontend web confirmado es `aegis-web/AEGIS-REACT`; Laravel es el API objetivo. El MVC modular PHP continúa como sistema legado, y Expo es un consumidor adicional del API. Ninguno se elimina o reescribe en este incremento.

## Arquitectura actual observada

```text
Navegador React (HashRouter, JSX/CSS, AuthContext)
   ├─ componentes con llamadas a servicios/api.js (fetch)
   └─ pantallas/estado local o fixtures/localStorage
              │ HTTP JSON + Bearer / multipart
              ▼
Laravel API (/api, 14 rutas)
   ├─ controllers + validación inline + ProductoResource
   ├─ Eloquent: usuarios / productos / foro / puntos / tablas aún sin API
   └─ MySQL local ─────────────── Cloudinary (subidas en producto/foro)

Expo móvil ─ Axios ───────────────┘

MVC PHP aparte: Apache/PHP → Router/Controllers/Models PDO → MySQL
```

Puntos de acoplamiento relevantes:

- El contrato de `services/api.js` está duplicado en un cliente Axios de Expo; no hay cliente único compartido.
- `Vista` pasa `auth`, navegación, query params y estado a componentes con props convencionales; algunas páginas saltan a fixtures.
- Controladores mezclan validación, reglas de aplicación y Eloquent. En productos/foro la llamada a Cloudinary está dentro del controlador.
- MVC y Laravel comparten conceptos y tablas, pero tienen routers, autenticación, persistencia/serialización y pantallas distintas. No se documentó un proceso de sincronización/migración de datos entre ambas implementaciones.
- El campo de rol está en DB, pero su semántica no se materializa en permisos API.

## Dirección objetivo: módulos y límites

| Módulo lógico | Propiedad principal | Dependencias permitidas |
|---|---|---|
| `app` (React) | Enrutado, composición de layout, sesión de UI y manejo de errores de navegación | Features, shared e infraestructura HTTP; no Eloquent/DB |
| `features/identity` | Login, registro, estado de sesión y cuenta propia | API identity, infraestructura de tokens |
| `features/social` | Relaciones e interacciones entre usuarios cuando se implementen | API social, identity |
| `features/marketplace` | Home, búsqueda, producto, publicación y listado propio | API marketplace, identity para escrituras, media |
| `features/community` | Publicaciones, comentarios y moderación UI | API community, identity |
| `features/messaging` | Conversaciones y adjuntos | API messaging, identity y contexto de marketplace |
| `features/trust` | Puntos, encuentros, QR, reputación y reportes | API trust, identity y marketplace |
| `features/search` | Interacción de búsqueda, filtros y estado de consulta | API de búsqueda o listados existentes; no acceso directo a tablas |
| `features/notification` | Bandeja, preferencias y feedback de notificaciones | API notification, identity |
| `features/settings` | Perfil privado y preferencias | API identity/preferences |
| `features/admin` | Operaciones de moderación/administración | API admin con permisos server-side; nunca datos autorizados solo por UI |
| `shared` (React) | Componentes y utilidades demostrablemente reutilizados | Sin reglas específicas de negocio |
| `infrastructure/api` (React) | Cliente HTTP central, base URL, bearer, errores y serialización multipart | Transporte HTTP; respuesta API estable, sin filtrar Eloquent a UI |
| Dominios Laravel | Rutas/API, validación de entrada, autorización, casos de aplicación y recursos/DTO por dominio | Eloquent y servicios de infraestructura concretos |
| Persistencia | Esquema MySQL y migraciones incrementales | Contratos internos de datos; no consumidos directamente por React |
| Media | Adaptador de almacenamiento Cloudinary y compensación de fallos | Productos/comunidad; nunca credenciales al frontend |

No se prescribe una capa Repository/Service por cada CRUD. Extraer servicio de aplicación donde haya una regla reutilizable o transacción/efecto externo verificable; mantener validación en Form Requests solo cuando reduzca duplicación. Las Policies deben ser el control de autorización de recursos; el frontend solo refleja permisos.

Los límites anteriores son objetivos de organización, no evidencia de módulos ya implementados. En Laravel se crearán Form Requests, Resources, Policies, servicios o jobs solo ante una responsabilidad concreta y con pruebas; esta entrega no añade capas ni rutas backend.

## Contrato de fallos y estados web

El cliente React centraliza el transporte en `src/services/api.js` y mantiene intactos los envelopes de éxito actuales (`data`, `usuario`, o formatos de recursos ya consumidos). `ApiError` expone `status`, `message`, errores de validación y `Retry-After`; abortar una solicitud sigue siendo cancelación y no un error de red. Los mensajes de 500 se sustituyen por un texto genérico y nunca se presenta el mensaje interno del servidor.

| HTTP | Uso esperado | Representación en web | Estado actual |
|---|---|---|---|
| 400 | Solicitud mal formada | Mensaje general y corrección de datos | Mapeado por el cliente; el endpoint puede no emitirlo hoy |
| 401 | Falta token o token inválido | Solicitar inicio de sesión | Mapeado; login/me/logout tienen cobertura de integración |
| 403 | Usuario identificado sin permiso | Estado de acceso restringido | Mapeado en adaptador/estado compartido; no hay Policies/rutas actuales que acrediten autorización de recurso |
| 404 | Recurso/ruta inexistente o no visible | Página/estado no encontrado | Mapeado; detalle de producto inactivo se prueba como 404 |
| 409 | Conflicto de estado/duplicado | Explicar que debe actualizarse/reintentarse | Mapeado por cliente; no hay caso API actual acreditado |
| 422 | Validación de campos | Mensaje y errores por campo | Se conservan `errors`; hay pruebas de validación existentes |
| 429 | Límite de solicitudes | Aviso temporal; conservar `Retry-After` | Mapeado por cliente; las rutas existentes no declaran throttle explícito |
| 500 | Error inesperado del servidor | Mensaje genérico, sin detalle interno | El cliente oculta el contenido del servidor; la representación API depende del manejador Laravel |

`ApiState.jsx` ofrece loading, error/acceso restringido, vacío, feedback y 404 con roles ARIA. Catálogo y foro usan loading/error/empty; los estados no activan reintentos falsos. El comodín de React es ahora 404; `/plantilla` conserva el uso anterior para contenido intencionalmente provisional. La serialización de éxitos no se normaliza en el servidor para preservar compatibilidad con Expo y otros consumidores.

## Normas de evolución de código y datos

- **Módulos/código:** cada cambio debe tener responsabilidad clara dentro de un dominio; evitar duplicar clientes HTTP. Controllers reciben/derivan el request y responden, mientras requests/resources/policies/servicios/jobs se agregan cuando una validación, serialización, autorización, regla reusable o efecto asíncrono verificable lo justifica.
- **Identidad/ownership:** `usuarios` y el modelo `Usuario` son la identidad existente. Las operaciones de dueño deben derivar el actor autenticado desde Sanctum y validar ownership en servidor; no aceptar `usuario_id` del cliente como autorización. No renombrar `usuarios` ni `User` por conveniencia.
- **Estados:** conservar valores persistidos y rutas actuales durante compatibilidad. Documentar estados/transiciones permitidos cerca de la feature y probar transiciones inválidas. Usar enum PHP backed cuando el conjunto de valores esté cerrado y se consuma en más de un punto; no usar enum nativo de base de datos que dificulte SQLite o evolución aditiva.
- **Tiempos históricos:** `fecha_publicacion`, `fecha_comentario` y otros timestamps de dominio existentes forman parte del contrato de datos; no reemplazarlos automáticamente por `created_at`/`updated_at`. Definir zona horaria y fallback de lectura antes de migrar una tabla.
- **Referencias:** respetar las FKs verificadas y el patrón relacional actual; nuevas relaciones requieren índice/FK, comportamiento de borrado explícito y pruebas SQLite/MySQL. No inferir cardinalidad ni borrar huérfanos sin medición y copia cuando proceda.
- **Migraciones:** incrementales, con `down()` útil cuando sea posible; evitar renombrados/borrados y backfills ambiguos en una sola operación. Antes de DDL, identificar conexión y conservar copia verificable de los datos que haya que retener. Ninguna migración se aplicó en Incremento 01.
- **Tests:** toda prueba de esquema/feature usa SQLite `:memory:` vía PHPUnit y no usa la conexión de desarrollo. `APP_KEY` de PHPUnit es una cadena determinista exclusiva del entorno de pruebas; nunca copiarla a `.env` o producción.
- **Herramientas:** backend `composer test`, `composer format:check` / `composer format`; frontend `npm test`, `npm run lint`, `npm run format:check` / `npm run format`, `npm run build`. Pint informa de formato preexistente en backend; revisar esos archivos antes de ejecutar el comando de escritura.

### Decisión de autenticación web pendiente

La app actual utiliza token Sanctum Bearer y `localStorage`; no se convierte aquí a cookies stateful ni se altera caducidad, rotación, almacenamiento, CORS o CSRF. Antes de ampliar las operaciones privadas, una ADR deberá decidir entre mantener Bearer web o adoptar sesión stateful/cookie, documentar XSS/CSRF, dominios y puertos, expiración/revocación, migración gradual y compatibilidad Expo. Mantener la decisión abierta evita una ruptura no autorizada del contrato de autenticación.

## Dependencias propuestas de incrementos

Secuencia orientativa; las features que solo requieren identidad pueden avanzar en paralelo una vez aprobado el contrato.

| Incremento | Entrega lógica | Prerrequisitos |
|---|---|---|
| **00 — auditoría** | Estado, trazabilidad, riesgos y dirección objetivo | Identificar React y consumidores reales (completado; el tag indicado falta) |
| **01 — contrato y shell web** | API/DTOs aprobados y navegación React web preparada para el contrato, sin reemplazar aún pantallas existentes | Confirmar baseline histórico, glosario US/RS/MK/FO/MS/BU y casos prioritarios |
| **02 — identidad/autorización** | Cuenta, sesión/token, privacidad y roles/policies | Contrato 01; compatibilidad móvil |
| **03 — marketplace** | Catálogo, filtros, detalle y publicación; media gestionada | Identidad para escritura; migración/backfill de `public_id` aprobados |
| **04 — comunidad** | Feed, publicación, comentarios, moderación | Identidad y contrato; medias reutilizan infraestructura |
| **05 — confianza** | Puntos/owners, encuentros, QR, calificaciones y reportes | Identidad + marketplace; reglas de estado y autorización |
| **06 — mensajería** | Conversaciones persistentes vinculadas a usuarios/productos | Identidad + permisos; política de adjuntos y límites |
| **07 — búsqueda y personalización** | Filtros, orden, preferencias y perfil privado | Marketplace e identidad; no acoplar React a tablas |
| **08 — notificaciones/admin** | Entrega/preferencias y operaciones administrativas | Identity/policies + dominios de eventos/estado |

No empezar un flujo protegido hasta tener decisión sobre token, caducidad, roles y respuesta `me`; no introducir rutas de administración que se autoricen solo en React.

## Compatibilidad del contrato

- Conservar las 14 rutas `/api/...` existentes y sus formas actuales mientras React y Expo las consumen.
- Nuevas operaciones se agregan de forma aditiva, con validación/request/response/códigos y pruebas de contrato. Evitar renombrar claves o cambiar envelopes ya usados.
- Si una ruptura es imprescindible, diseñar versión/adaptador en una decisión separada, demostrar consumidores y periodo de convivencia; no migrar simultáneamente al MVC sin inventariar sus rutas/sesiones.
- React transforma DTOs a sus modelos de vista dentro de la feature; nunca depende de tablas, nombres Eloquent o internals Laravel.
- No cambiar ni retirar comportamiento MVC hasta demostrar reemplazo React + API y aceptar plan de migración de sus datos.

## Esquema, media y datos

- No hacer limpieza estructural por estética. Las 17 migraciones aplicadas y el esquema con datos de desarrollo se conservan.
- `imagenes_producto.public_id` es deuda funcional concreta. Si se prioriza, migración futura debe ser aditiva (columna nullable inicialmente), asegurar rollback/downgrade operable, probar MySQL y SQLite, actualizar subida/borrado y backfill solo URLs Cloudinary que se puedan identificar inequívocamente. Filas ambiguas quedan intactas hasta resolución; no inferir IDs destructivamente.
- Índices nuevos solo tras `EXPLAIN` y medición de consultas representativas. Los volúmenes observados (tres productos) no son base suficiente.
- Nunca ejecutar migraciones destructivas sobre la conexión local actual sin confirmar destino y copia verificable; este incremento no hizo DDL ni backup porque solo usó lecturas.

## Seguridad y privacidad objetivo

1. Backend valida cada entrada; limita tamaño/paginación, tipo de archivos y operaciones por recurso.
2. Policies verifican rol, ownership, estados y transiciones en el servidor; pruebas positivas/401/403/404 cubren cada operación.
3. Recursos/DTOs usan allowlists de atributos. Mantener separado perfil público de sesión privada; no devolver IDs internos de almacenamiento o teléfono salvo necesidad/consentimiento.
4. Documentar expiración, revocación y almacenamiento de tokens antes de ampliar sesión; minimizar bearer en `localStorage` según estrategia web aprobada.
5. CORS lista solo orígenes reales del frontend, sin wildcard; no usar secretos de Cloudinary en el browser.
6. Integraciones externas tienen límites, mensajes genéricos al cliente, logs sin credenciales y estrategia de compensación.
7. Moderación, reportes y administración quedan protegidos por autorización API; no confiar en menús/guards de navegación.

## Mapa visual objetivo (no implementado)

Desktop: cabecera global fija/consistente con marca, búsqueda, navegación principal, cuenta y avisos. Bajo ella, composición adaptable de **tres columnas**:

```text
┌──────────────────── cabecera global ────────────────────┐
│ navegación / filtros │ contenido de la pantalla │ acciones/contexto │
│ categorías, perfil  │ feed, catálogo, detalle,  │ seguridad, vendedor,│
│ o herramientas      │ comunidad o conversación │ confianza, relacionados│
└──────────────────── pie / contenido auxiliar ───────────┘
```

Las tres columnas son adaptativas: sidebars se colapsan o pasan a paneles cuando el viewport no las permite. No es una imposición de tres paneles en cada ruta: detalle puede usar centro + contexto; chat puede dividir la zona principal. Priorizar accesibilidad, teclado, lectura y estados vacíos.

Web móvil: cabecera compacta, contenido de una columna, filtros/acciones en paneles y **barra inferior persistente** para Inicio, Buscar/Marketplace, Publicar, Comunidad y Perfil; Chat/Ajustes/Admin se acceden desde navegación contextual según permiso. Esta barra inferior no existe en la UI actual.

| Página objetivo | Composición mínima |
|---|---|
| Inicio | Feed de productos/comunidad personalizado, accesos al catálogo y estado de sesión |
| Marketplace | Búsqueda, filtros aplicados, orden, paginación y catálogo |
| Producto | Galería, descripción, vendedor y acciones autorizadas; sin compra simulada |
| Perfil | Datos públicos separados de preferencias privadas; productos, actividad y reputación con permisos |
| Comunidad | Feed paginado, crear/comentar/reportar según permisos |
| Chat | Lista de conversaciones, mensajes persistentes, adjuntos validados, estado/entrega |
| Ajustes | Datos de cuenta, perfil privado, preferencias, privacidad y sesión |
| Administración | Módulos de usuarios/productos/reportes con acciones autorizadas y auditables |

## ADR

Decisiones registradas:

- [ADR-0001: React web y Laravel API como destino; MVC preservado](./decisiones/ADR-0001-plataforma-web.md)
- [ADR-0002: compatibilidad del contrato y clientes existentes](./decisiones/ADR-0002-compatibilidad-api.md)
- [ADR-0003: evolución de datos y Cloudinary sin DDL en incremento 00](./decisiones/ADR-0003-evolucion-datos.md)
- [ADR-0004: adaptador HTTP compatible, fallos visuales y autenticación pendiente](./decisiones/ADR-0004-errores-y-auth-web.md)
- [Plantilla breve de ADR](./plantillas/ADR.md)
- [Plantilla de reporte de incremento](./plantillas/reporte-incremento.md)

## Riesgos para el siguiente incremento

- Falta tag `6.0.0` o ref alternativo confirmado.
- Falta glosario de las seis siglas del catálogo.
- El README React es el template de Vite y no documenta el producto; agregar guía de producto solo cuando las instrucciones reales de arranque/contrato cambien.
- Auth/roles y matriz de privacidad no aprobadas; no conectar la maqueta de Admin o editar perfil a endpoints improvisados.
- `public_id` ausente en fotos de producto; las subidas remotas no están verificadas por test.
