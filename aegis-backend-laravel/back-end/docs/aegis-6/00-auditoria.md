# AEGIS Web — Incremento 00: auditoría técnica

## Alcance y límites

Auditoría de solo lectura del árbol de trabajo disponible el 2026-11-23. El producto web React está identificado y es el frontend objetivo; el MVC PHP se inventaría como legado separado y no se modifica. `aegis-movil/` es un cliente Expo separado, fuera del alcance de implementación, pero se registra como consumidor del API.

La comparación solicitada desde `6.0.0` no se puede reproducir: no existe un ref/tag `6.0.0` en este clon. La auditoría describe el `HEAD` actual y distingue los cambios locales preexistentes; no atribuye esos cambios al historial confirmado.

## Git: punto de partida y cambios respetados

| Comprobación antes de editar | Resultado |
|---|---|
| Rama | `PersonalizacionPerfil` |
| `HEAD` | `bcca92a90e92f7b1001a01e2763f80ac392026b6`, apuntado también por `v4.3.0`, `master` y `origin/master` |
| Tag exacto `6.0.0` | No existe (`git tag --list 6.0.0` vacío; `git rev-parse '6.0.0^{commit}'` falló por ref desconocido) |
| Ancestro de `HEAD` | Indeterminable: el comando de ancestro falló porque el ref no se resuelve; no se reescribió historia |
| Estado inicial | Cambios locales listados abajo, conservados |

Cambios que ya existían al comenzar:

- Modificados: `aegis-backend-laravel/back-end/README.md`, `composer.lock`, `database/seeders/CategoriaSeeder.php`, `database/seeders/DatabaseSeeder.php`; y, en MVC, `app/modules/foro/models/Comentario.php`, `app/modules/foro/models/Publicacion.php`, `app/modules/foro/views/Foro.php`, `app/modules/productos/views/crear.php`, `config/app.php`, `public/.htaccess`, `public/Assets/css/pages/publish.css`.
- Sin seguimiento: `aegis-backend-laravel/back-end/database/seeders/DemoDataSeeder.php`, `aegis-backend-laravel/back-end/tests/Feature/DemoDataSeederTest.php` y `aegis-backend-laravel/back-end/docs/` (que ya contenía `AI_BACKEND_GUIDE.md`).

No se tocaron funcionalidad, rutas API, esquema ni datos. Este incremento agrega documentación en `docs/aegis-6/` y un enlace de navegación desde el README; los cambios iniciales anteriores permanecen intactos.

## Inventario real y arranque

| Aplicación | Ubicación / tecnologías | Entrada, comandos y configuración |
|---|---|---|
| API Laravel | `aegis-backend-laravel/back-end/`; Laravel 12, PHP 8.2+, Sanctum 4, Cloudinary SDK; `composer.json` y `artisan` | `composer install`; configurar `.env` local sin versionarlo; `php artisan serve` (puerto habitual 8000). `php artisan migrate --seed` instala y siembra; **no se ejecutó** en este entorno. `php artisan route:list --path=api` y `php artisan test`. |
| Web React | `aegis-web/AEGIS-REACT/`; React 19, React Router 7, Vite 8, JavaScript/JSX y CSS convencional. No hay TypeScript ni Tailwind. | `npm ci`; `npm run dev`, `npm run build`, `npm run lint`. API configurable por `VITE_API_URL`, con fallback `http://127.0.0.1:8000/api`. |
| MVC PHP legado | `aegis-web/AEGIS-MVC-MODULAR/`; PHP 8.2, PDO/MySQL, sesiones y router propio, sin framework/ORM ni manifiestos Composer/npm. | `public/index.php` inicia sesión, registra rutas y despacha `routes/web.php`; README describe Apache/XAMPP y URL local `/public/`. `config/database.php` referencia la base local `aegis_db`; no se muestran datos de conexión. |
| Móvil, no implementado aquí | `aegis-movil/`; Expo Router, React Native/Web, Axios | `npm start`, `npm run web`, `npm run android`, `npm run ios`. `src/models/api/apiClient.jsx` consume el mismo API mediante `EXPO_PUBLIC_API_URL`. Se respeta como consumidor existente. |

El README raíz no está presente; la guía vigente del backend está en `back-end/README.md` y `back-end/docs/AI_BACKEND_GUIDE.md`. Para reproducir la web, ejecutar Vite desde `AEGIS-REACT` y Laravel desde `back-end`; configurar `FRONTEND_URL` para el origen exacto de Vite y `VITE_API_URL` para el prefijo del API. No copiar `.env` ni credenciales a documentación.

## Rutas web y mapa actual

`src/main.jsx` monta `App`; `src/App.jsx` usa `HashRouter`, por lo que la navegación web tiene fragmentos `/#/...`. Rutas observadas:

| Ruta React | Pantalla |
|---|---|
| `/`, `/home` | Inicio |
| `/productos`, `/novedades` | Catálogo / novedades |
| `/productos/detalle?id=…` | Detalle de producto |
| `/productos/crear`, `/productos/mis-productos` | Publicar / mis productos |
| `/perfil`, `/perfil/editar`, `/vendedor` | Perfil, edición y vista de vendedor |
| `/foro`, `/publicacion` | Comunidad / publicación |
| `/puntos-fisicos` | Puntos físicos |
| `/mensajes`, `/configurar-encuentro?id=…` | Chat / configuración de encuentro |
| `/admin` | Dashboard administrativo |
| `/login`, `/register` | Acceso / registro |
| cualquier otra ruta | `Plantilla` genérica |

Mapa de navegación real:

```text
Inicio ── búsqueda/categorías ──> Catálogo ──> Detalle ──> carrito local
  ├─ Foro ──> Publicación
  ├─ Puntos físicos
  ├─ Publicar producto / Mis productos
  ├─ Perfil ──> Editar perfil
  ├─ Mensajes ──> Configurar encuentro
  ├─ Novedades
  ├─ Admin
  └─ Login / Registro
```

Cabecera global: logo, navegación, búsqueda, menú de cuenta y carrito. Inicio añade una barra de categorías/promociones; el pie incluye navegación/soporte. Las pantallas añaden su propia estructura (catálogo de dos columnas; conversación con lista y panel de chat; foro con controles y contenido). CSS por componente en `src/components/**/css` y `src/App.css`/`src/index.css`; no se identificó un sistema de estilos o estado global adicional. El estado compartido de autenticación usa Context; el resto es mayoritariamente `useState` local y algunos módulos de datos demo.

En móvil existe un menú desplegable a pantalla completa con enlaces, no una barra inferior persistente. El estado actual no implementa el layout objetivo de tres columnas adaptativas. Capturas visuales de Home desktop y menú móvil se realizaron en esta sesión; la evidencia funcional es solo de lectura.

## Contrato API existente (Laravel)

`php artisan route:list --path=api` confirmó 14 rutas:

| Acceso | Método y ruta | Capacidad existente |
|---|---|---|
| Público | `GET /api/inicio` | Feed de hasta 8 productos activos, recursos con vendedor/categoría/imágenes cargados |
| Público | `GET /api/categorias` | Categorías ordenadas |
| Público | `GET /api/productos` | Catálogo filtrable y paginado (`busqueda`, `precio_max`, `estado`, `cat`, `sort`, `per_page` 1–50) |
| Público | `GET /api/productos/{producto}` | Detalle activo |
| Público | `GET /api/foro` | Publicaciones, autores, imágenes, comentarios y conteo |
| Público | `GET /api/perfil/{usuario}` | Perfil público, hasta 24 productos activos y 10 publicaciones |
| Público | `GET /api/puntos-fisicos` | Puntos activos paginados |
| Público | `POST /api/register`, `POST /api/login` | Cuenta AEGIS en `usuarios`; login/registro devuelven token |
| `auth:sanctum` | `GET /api/me`, `POST /api/logout` | Sesión del token actual |
| `auth:sanctum` | `POST /api/productos` | Alta con 1–5 imágenes, Cloudinary |
| `auth:sanctum` | `POST /api/foro` | Crear publicación, opcionalmente con imágenes |
| `auth:sanctum` | `POST /api/foro/{publicacion}/comentarios` | Crear comentario |

Rutas fuente: `back-end/routes/api.php`; controladores en `back-end/app/Http/Controllers/Api/`. Validaciones usan `$request->validate`; la respuesta no es totalmente uniforme (JSON propio y `ProductoResource`). No se agregó una versión API ni se alteró el contrato.

## Identidad, persistencia, relaciones y serialización

- `App\Models\User` representa el scaffold `users`; `App\Models\Usuario` representa la identidad AEGIS `usuarios`, implementa Sanctum y es el modelo empleado por registro/login. `config/auth.php` deja el provider/broker predeterminado ligado a `User`; no hay recuperación de contraseña AEGIS. No son tablas intercambiables.
- El runtime confirma MySQL 8.4.3 en loopback, base seleccionada `aegis_db` y 17 migraciones aplicadas. Una consulta de solo lectura a `information_schema` contabilizó 23 tablas, unos 704 KB y 32 filas estimadas en este esquema. La instancia del servidor MySQL contiene otros esquemas de desarrollo; no se pudo afirmar que sea desechable.
- En el esquema AEGIS, el recuento aproximado observado fue: `usuarios` 5, `users` 0, categorías 5, productos 3, imágenes de producto 3, publicaciones 2, comentarios 3, imágenes de foro 1, puntos 1, encuentros 2, QR 2, calificaciones 1, reportes 1 y notificaciones 2. Son estimaciones de `db:show --counts`, no un inventario de datos personales.
- `migrate:status` mostró `Ran` para las 17 migraciones versionadas. `db:table` verificó en la conexión activa los índices únicos de `usuarios.email`/`username`, los índices FK de `productos.usuario_id`/`categoria_id`, y FK `imagenes_producto.producto_id` con borrado en cascada. El esquema declara FKs para las tablas de dominio; no se ejecutó DDL.
- Siete consultas de integridad de solo lectura (productos→usuario/categoría, imágenes→producto, publicaciones→usuario, comentarios→publicación/usuario, encuentros→usuario/producto/punto y notificaciones→usuario) devolvieron cero huérfanos en los registros observados.
- `ProductoResource` limita columnas de vendedor, categoría e imágenes. Foro y perfil precargan autores con columnas limitadas; perfil público selecciona explícitamente sus campos. El modelo `Usuario` oculta `password`, pero AuthController serializa el modelo completo en login/registro/`me`; el token protege `me`, pero el contrato aún no define un DTO público propio ni minimiza de forma explícita teléfono/IDs de media en las respuestas de sesión.
- No se observó N+1 evidente en listados principales: productos, inicio, foro, perfil y puntos precargan relaciones. Foro carga los comentarios completos de cada página y perfil comentarios de hasta 10 publicaciones sin paginación interna; el fan-out puede crecer. No se midió con carga ni `EXPLAIN` con un volumen representativo.
- `usuarios.reputacion`, calificaciones, encuentros, QR, reportes y notificaciones están modelados. Las relaciones/tablas no prueban endpoints o flujos disponibles; véase [catálogo de trazabilidad](./catalogo-trazabilidad.md).

## Seguridad, privacidad y deuda observada

1. **Autorización incompleta por rol:** rutas protegidas solo aplican `auth:sanctum`; no hay middleware de rol, Policy o Gate. No existen rutas administrativas backend. En React solo `/productos/crear` y `/perfil` se verifican en el wrapper; `/admin` no tiene esa protección. Los botones/ocultamientos UI no sustituyen autorización server-side.
2. **Token persistente en `localStorage`:** `AuthProvider` guarda `aegisToken`/usuario en el almacenamiento accesible a JavaScript. Un XSS podría robar un bearer token. Sanctum no configura expiración global y no hay renovación; revisar antes de ampliar superficie. No es una prueba de vulnerabilidad XSS.
3. **Serialización de identidad:** `Usuario::$hidden` excluye password, no define una lista de atributos privados. La respuesta autenticada de sesión debe quedar explícita y versionada si se cambia.
4. **Cloudinary en producto:** `ProductoController` persiste URL e indicador `principal`, pero no `public_id` en `imagenes_producto`; tras crear no hay ID fiable para borrar/administrar la imagen remota. En publicación del foro sí se persiste `public_id` y el modelo lo oculta en JSON. La construcción del cliente Cloudinary de producto ocurre antes del `try`, y el éxito real remoto no está cubierto por tests.
5. **Autorización de cuenta:** login rechaza `estado != activo`; registro fija `rol=usuario`. El rol guardado no habilita por sí solo funciones de owner/admin.
6. **Dependencias React:** `npm audit` encontró 6 avisos en el árbol completo (3 moderate, 3 high, 0 critical; `eslint` y `vite` directas, el resto transitivas). `npm audit --omit=dev` reportó 0 vulnerabilidades de dependencias de producción. No se aplicaron upgrades.
7. **Índices:** hay PK, uniques y claves/indexes FK relevantes; no hay índices compuestos dedicados para consultas típicas por estado/fecha/precio. Con 3 productos no se justifica alterar índices; medir planes con volumen real antes de proponer DDL.

## Estado de la base y política aplicada

Se usó la conexión de desarrollo real solo en modo lectura para `db:show --counts`, `migrate:status`, `db:table` y consultas de huérfanos. Host loopback y base local fueron verificados; la instancia contiene otras bases y datos, por lo que **no se considera desechable verificada**. No hubo operación destructiva ni backup; tampoco se aplicaron migraciones, seeders ni `migrate:fresh`. Las pruebas de migración se ejecutaron con la configuración SQLite en memoria de PHPUnit.

## Riesgos y prioridades

| Prioridad | Riesgo / deuda | Recomendación antes de la feature afectada |
|---|---|---|
| P0 | Referencia histórica `6.0.0` inexistente; cambios locales hacen imposible atribuir todo a `HEAD` | Recuperar el tag/ref válido o aclarar la referencia; fijar baseline limpia sin descartar los cambios locales |
| P1 | Sin Policies/roles para admin/owner ni contrato de privacidad de sesión | Definir identidad, DTO de sesión, autorización y pruebas 401/403 antes de endpoints privados |
| P1 | Mensajes, encuentros, personalización, notificaciones y administración no tienen flujos API completos | No venderlos como funcionales ni conectar UI a modelos directamente |
| P1 | `imagenes_producto` no conserva `public_id` Cloudinary | Diseñar migración incremental/backfill compatible, compensación y pruebas de proveedor antes de administrar/borrar imágenes |
| P2 | Fan-out de comentarios; búsquedas simples y sin orden/paginación consistente en todos los recursos | Medir queries y cargas; acotar/paginar hijos con contrato explícito |
| P2 | Lint falla en dos reglas; advisories de dependencias de desarrollo | Resolver de forma separada y con upgrades dirigidos/pruebas |
| P2 | Vite con origen alternativo puede fallar CORS | Configurar `FRONTEND_URL` igual al origen real; no ampliar CORS a comodines |

## Evidencia fuente principal

- React: `aegis-web/AEGIS-REACT/src/App.jsx`, `src/main.jsx`, `src/services/api.js`, `src/auth/AuthProvider.jsx`, componentes bajo `src/components/`.
- Laravel: `aegis-backend-laravel/back-end/routes/api.php`, `app/Http/Controllers/Api/`, `app/Http/Resources/ProductoResource.php`, `app/Models/{User,Usuario}.php`, `database/migrations/`, `tests/Feature/PublicApiTest.php`.
- MVC: `aegis-web/AEGIS-MVC-MODULAR/public/index.php`, `routes/web.php`, `config/database.php`, `app/core/Router.php`.
- Cliente móvil que consume el mismo contrato: `aegis-movil/src/models/api/apiClient.jsx`.

Ver [pruebas y arranque](./reporte-pruebas-arranque.md), [matriz de trazabilidad](./catalogo-trazabilidad.md) y [arquitectura objetivo](./arquitectura-objetivo.md).
