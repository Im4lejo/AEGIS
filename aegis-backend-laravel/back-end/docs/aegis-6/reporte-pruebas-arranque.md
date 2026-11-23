# Incremento 00/01 — reporte de pruebas, arranque y capturas

## Arranque verificado

### Laravel API

Directorio: `aegis-backend-laravel/back-end/`.

```powershell
composer install
# Configurar .env local de forma privada; no copiarlo ni publicarlo.
php artisan serve
php artisan route:list --path=api
```

La aplicación local responde en `127.0.0.1:8000`; `route:list` enumeró 14 rutas API. La configuración actual del entorno selecciona MySQL local y `aegis_db`, verificado sin leer ni registrar credenciales.

### Web React

Directorio: `aegis-web/AEGIS-REACT/`.

```powershell
npm ci
$env:PATH = 'C:\laragon\bin\nodejs\node-v22;' + $env:PATH # solo necesario en esta sesión Laragon
npm run dev
npm run build
npm run lint
```

La web usa Vite; se debe configurar `VITE_API_URL` y permitir el origen de navegador exacto mediante `FRONTEND_URL`. Para el MVC legado, usar Apache/PHP con `AEGIS-MVC-MODULAR/public/` como raíz pública según su README. La app móvil Expo queda fuera del incremento.

## Pruebas ejecutadas

| Comando / comprobación | Resultado |
|---|---|
| `php artisan route:list --path=api --except-vendor` | Éxito: 14 rutas, incluidas rutas Sanctum |
| `php artisan migrate:status` | Éxito: 17/17 migraciones con `Ran`; solo lectura |
| `php artisan db:show --counts` | Éxito: conexión MySQL local 8.4.3; métricas aproximadas, solo lectura |
| `php artisan db:table usuarios`, `productos`, `imagenes_producto`, `users`, `publicaciones_foro` | Éxito: columnas, índices y FKs verificados |
| Consultas SQL de huérfanos en 7 relaciones | Éxito: 0 huérfanos en cada comprobación; solo lectura |
| `php artisan test` sin `APP_KEY` de proceso | 15 pasaron y 1 falló: `ExampleTest` de `/` requiere clave de cifrado no definida |
| `php artisan test` con `APP_KEY` aleatoria/efímera en el proceso | **16 pasaron, 79 assertions**, 0 fallos; no se escribió la clave a `.env` |
| `npm ci` desde el `package-lock.json` React | Éxito; instaló 149 paquetes. No se editaron manifiestos |
| `npm run build` (Vite 8.3.0) | **Éxito**: build de producción completado |
| `npm run lint` (ESLint 10) | **Falla con 2 errores preexistentes**: `Editar.jsx:191` `react-hooks/set-state-in-effect`; `presentation.js:37` `no-unused-vars` |
| `npm audit --json` | 6 findings: 3 moderate, 3 high, 0 critical; `eslint` y `vite` directas, otras transitivas |
| `npm audit --omit=dev --json` | 0 vulnerabilidades de dependencias de producción |
| Captura manual navegador | Home desktop y menú móvil renderizan; datos API visibles al permitir temporalmente el origen local del navegador |

El primer `npm run build` falló porque `npm` no estaba en el `PATH`; se localizó npm de Laragon, después faltaba Vite en `node_modules`, por lo que se restauró lo declarado por el lockfile. Para build/lint se añadió el directorio Node al `PATH` del proceso. No se aplicaron `npm audit fix` ni actualizaciones.

## Comprobación visual y CORS

Se inició Vite en `http://127.0.0.1:5174/` y Laravel en `http://127.0.0.1:8000`. Primero el navegador bloqueó `/api/inicio` y `/api/categorias` por CORS: el origen 5174 no estaba permitido (config actual: `FRONTEND_URL` o `http://localhost:5173`, más `http://localhost:8081`). Para comprobar el render sin editar configuración versionada, el proceso local de Laravel se reinició con `FRONTEND_URL=http://127.0.0.1:5174`; luego Home mostró productos reales disponibles en la base de desarrollo.

Se capturaron en la sesión:

- Home desktop a 1440 × 1000 con cabecera global, barra de promociones y catálogo.
- Navegación móvil a 390 × 844 con menú desplegable. No aparece barra inferior fija en la UI actual.

Las imágenes se adjuntaron en el resultado de la sesión del navegador y no se copiaron como archivos de producto dentro del repositorio. No se ejecutaron flujos de escritura desde el navegador para evitar modificar datos existentes.

## Base de datos y seguridad operacional

- Conexión runtime real verificada: MySQL 8.4.3, loopback, schema `aegis_db`; sin mostrar usuario/contraseña ni secretos.
- La instancia del servidor es compartida con otros esquemas de desarrollo; no se certificó que sea desechable. El esquema AEGIS contiene datos locales (entre ellos 5 usuarios y 3 productos observados).
- No se hizo backup porque no se realizó ninguna escritura o cambio destructivo. No se aplicaron migraciones, seeders, `migrate:fresh`, ni modificación de tablas/índices/datos.
- PHPUnit configura SQLite en memoria; tests de esquema/feature no tocaron el MySQL local.
- Las pruebas de Cloudinary son insuficientes para demostrar integración remota exitosa; los tests de fotos existentes prueban validación/autenticación, no la operación del proveedor.

## Fallos abiertos y prerrequisitos

1. Recuperar/confirmar la referencia histórica pretendida (`6.0.0` no existe en este clon) antes de presentar un diff histórico.
2. Corregir lint en un cambio funcional separado y dirigido; no se mezcló en auditoría.
3. Revisar advisories de desarrollo con versiones compatibles y pruebas antes de actualizar.
4. Configurar el origen Vite correcto o elegir un puerto permitido en desarrollo.
5. Definir seguridad por roles, DTOs de sesión, privacidad y compatibilidad móvil antes de implementar endpoints owner/admin.
6. Definir estrategia para `public_id` de imágenes de producto antes de operaciones de edición/borrado.

## Incremento 01 — fundaciones y verificación

### Cambios validados

| Comando / comprobación | Resultado |
|---|---|
| `composer test` | **16 tests, 79 assertions, éxito**. PHPUnit ejecuta con SQLite `:memory:` y clave estable solo de testing; no conecta a MySQL local |
| `npm test` en `aegis-web/AEGIS-REACT` | **7 tests, éxito**: envelopes intactos, códigos cliente/autorización, validación, 500 seguro, `Retry-After`, red/abort y multipart/204 |
| `npm run format:check` | **Éxito** para los archivos React modificados por este incremento |
| `npm run build` | **Éxito**, Vite 8.3.0 |
| `npm run lint` | **Éxito**. Se mantuvo la sincronización de sección desde query string en `Editar.jsx` con excepción localizada del hook lint; `avatarUrl` conserva su firma y salida |
| `composer format:check` | **Falla por baseline existente** en `AuthController`, `ProductoController`, modelos, `bootstrap/app.php`, migración, `routes/api.php` y `PublicApiTest.php`. No se ejecutó Pint write para no reformatear cambios previos no relacionados |
| `php artisan route:list --path=api --except-vendor` | **Éxito: siguen las mismas 14 rutas**, sin cambios de endpoint |
| `git diff --check` | Éxito; Git advierte conversión de LF a CRLF al tocar algunos archivos React en Windows |

### Alcance de integración/compatibilidad

- No se añadieron rutas Laravel, controladores, modelos, policies, servicios, jobs, ni migraciones; no hubo cambio de autenticación, permisos, esquema o datos.
- El cliente React sigue devolviendo las formas JSON de éxito sin modificar; errors ahora se representan como `ApiError` con status, errores de validación y `Retry-After`. No se inventó un formato de error global server-side.
- Se añadió un 404 real al comodín de React y una ruta explícita `/plantilla` para mantener los enlaces provisionales existentes.
- `ApiState` se integró en resultados de catálogo y foro. El componente expone estado de loading, error/acceso restringido, vacío y feedback; no se agregó botón de reintento sin una acción real.
- PHPUnit ahora tiene `APP_KEY` determinista únicamente en `phpunit.xml`, aislada por `APP_ENV=testing`; no se cambió `.env`.
- No se ejecutó modificación, migración, seeder, backup o lectura nueva de base de desarrollo en este incremento.
- Smoke manual en navegador Vite (`http://127.0.0.1:5174`): una ruta desconocida mostró título/página 404 y la captura se adjuntó al resultado de la sesión; `/plantilla?origen=centro-ayuda` mantuvo “Página en construcción”.

### Archivos propios de Incremento 01

`aegis-web/AEGIS-REACT/src/services/api.js`, `api.test.js`, `src/App.jsx`, `ApiState.jsx`, `ApiState.css`, componentes de Foro y catálogo, `perfil/views/Editar.jsx`, `shared/presentation.js`, `package.json`, `package-lock.json`, `.prettierrc.json`; `phpunit.xml` y `composer.json`; documentación `docs/aegis-6/`.

El worktree ya contenía cambios de usuario anteriores en README, Composer lock, seeders, MVC y otros archivos. Se conservaron. No se reportan como funcionalidad de Incremento 01.

### Pendientes

1. Reconciliar formato Pint existente mediante un cambio separado y revisión de los archivos PHP afectados.
2. Ejecutar smoke visual de rutas 404 y `plantilla` en navegador.
3. Decidir autenticación web stateful/cookie frente al Bearer actual antes de ampliar operaciones privadas.
4. No aplicar throttle server-side ni afirmar cobertura de 403/409/429 hasta implementar sus casos y pruebas backend.

## Incremento 02 — Design System y responsive

### Cambios

- Se añadieron tokens semánticos, modo claro/oscuro/sistema con preferencia local versionada y componentes React accesibles reutilizables; el alcance se limita a web.
- Se integró un armazón con navegación lateral y panel de contexto en escritorio, y navegación inferior en tamaños compactos. Foro y Mensajes conservan sus layouts internos para evitar columnas duplicadas.
- Inicio ahora consulta el endpoint existente, permite buscar productos y presenta carga, error y vacío. La personalización y el feed de seguidos no se anuncian como funciones disponibles.
- No se modificaron endpoints, contratos, roles, permisos, dependencias backend ni esquema de datos. No hubo lecturas ni escrituras de DB en este incremento.

### Verificación

| Comando / comprobación | Resultado |
|---|---|
| `npm run format` y `npm run format:check` | Éxito |
| `npm test` | Éxito: 13 pruebas de componentes y 7 pruebas del cliente API |
| `npm run lint` | Éxito |
| `npm run build` | Éxito: build de producción Vite |
| Navegador, Inicio, Marketplace, `/perfil` (redirige a login), Comunidad, Mensajes y Ajustes en 360, 768, 1280 y 1440 px | 24 comprobaciones, sin overflow horizontal. Navegación compacta visible en 360/768 y oculta en 1280/1440 |
| Tema | Cambio a oscuro y almacenamiento local comprobados; al volver a Sistema guarda `system` y aplica el tema del sistema operativo |
| API de Inicio en navegador | No disponible en `127.0.0.1:8000` durante esta comprobación; se verificó el estado de error de conexión, no datos reales |
| Capturas de navegador | Inicio desktop 1440 × 1000 y móvil 360 × 800 adjuntas al resultado de la sesión; no se copiaron como archivos del repositorio |

La primera pasada detectó desbordamiento de la cabecera y de las filas de Ajustes a 1280 px. Se ajustaron los breakpoints de la cabecera y la grilla de datos de Ajustes; la matriz completa de 24 comprobaciones pasó después del cambio. La verificación no equivale a una auditoría de contraste/teclado de toda la aplicación. Las pantallas heredadas aún requieren revisión visual dedicada, especialmente en tema oscuro. No se ejecutó backend porque no hubo cambios de backend.

### Archivos propios de Incremento 02

Componentes y tokens en `aegis-web/AEGIS-REACT/src/components/shared/ui/` y `src/design-system/`; proveedor de tema en `src/theme/`; armazón en `src/components/layouts/WorkspaceChrome.jsx`; vista de Inicio y estilos; integración en `src/App.jsx`, `Header.jsx`, `Navbar.jsx` y `ApiState.jsx`; ajustes responsive en `src/design-system/design-system.css` y `src/components/perfil/css/editar.css`; pruebas/configuración frontend y dependencias de desarrollo en `package.json`/lockfile; guía de React y ADR-0005.

Los archivos de MVC PHP marcados como modificados ya estaban en el worktree antes de esta implementación y no fueron modificados para el Incremento 02. Se respetaron sin revertirlos.

### Pendientes

1. Repetir comprobación visual sobre Perfil con sesión autenticada y revisar Comunidad/Mensajes/Ajustes con teclado, contraste y tema oscuro.
2. Levantar API con el origen Vite permitido para revisar datos reales integrados y estados de autorización.

## Incremento 03 — identidad web y seguridad de acceso

### Git y alcance histórico

- Rama activa: `PersonalizacionPerfil`.
- `HEAD`: `04c492920bef07269dc01dc5438722bce4487e40` al inicio del incremento; no se cambió de rama ni se creó commit.
- `git rev-parse '6.0.0^{commit}'` falla porque el tag `6.0.0` no existe en este clon. No se puede afirmar ni reconstruir la relación histórica tag–HEAD.
- Se conservaron los cambios preexistentes del worktree, incluidos cambios previos de React y MVC. No se usaron `checkout`, reset ni limpieza.

### Cambios implementados

- Se conservan las rutas Bearer existentes `/api/register`, `/api/login`, `/api/me` y `/api/logout` para clientes legacy/Expo. React usa `/api/auth/web/*` con `Usuario`/`usuarios`, token `aegis-web` de ocho horas y `sessionStorage` por pestaña.
- El ciclo web incluye registro con mensaje genérico y verificación firmada, login, reenvío de verificación, recovery/reset, sesión actual, logout, gestión/revocación de tokens, avisos de inicio y cambio de contraseña. Password reset y cambio revocan tokens.
- Login responde igual para cuenta desconocida, inactiva, sin verificar o credenciales inválidas. Registro/recovery no enumeran cuentas. Los endpoints sensibles usan throttling.
- Una solicitud privada API sin `Accept` reveló un redirect a la ruta web `login` inexistente. Se configuró serialización JSON para `/api/*` y redirect nulo para visitantes API; ahora devuelve 401 y tiene prueba de regresión.
- Dos migraciones incrementales: `2026_11_23_000001_add_email_verified_at_to_usuarios_table` y `2026_11_23_000002_create_usuario_password_reset_tokens_table`. El broker `usuarios` usa una tabla propia para evitar colisión con el broker scaffold `users`.
- React incluye rutas/pantallas de registro, login, recuperación, restablecimiento, verificación y seguridad; feedback de validación, mostrar/ocultar contraseña y limpieza del token de reset de la URL tras cargarlo. MFA/passkeys se informan como no disponibles.
- Se actualizaron ADR-0004, README y guía backend. No se modificaron endpoints legacy, el guard scaffold `web` ni los envelopes exitosos existentes.

### Persistencia y seguridad operacional

- No se ejecutó ni se leyó `.env`; no se expusieron credenciales.
- No se aplicaron migraciones al MySQL de desarrollo compartido, no se ejecutó seeder, no se alteraron datos ni se creó backup porque no hubo escrituras en esa base.
- `php artisan test` ejecuta las migraciones/features en SQLite en memoria según `phpunit.xml`. Las migraciones nuevas y la separación de brokers se probaron en ese entorno.
- El correo real depende de `FRONTEND_URL`, origen permitido por CORS y un mailer operativo. Las pruebas interceptan las notificaciones; no se envió correo externo ni se realizó flujo manual de email.
- Bearer web en `sessionStorage` sigue expuesto ante XSS; MFA/passkeys y refresh token no están habilitados. Requiere hardening CSP/sanitización antes de despliegue sensible.

### Verificación del incremento

| Comando / comprobación | Resultado |
|---|---|
| `php artisan test` | **27 tests, 147 assertions, éxito**; incluye aislamiento del broker `usuarios`, no enumeración en login y 401 JSON sin `Accept` |
| `npm test` | **17 pruebas Vitest y 8 pruebas Node, éxito** |
| `npm run lint` | **Éxito** |
| `npm run format:check` | **Éxito** |
| `npm run build` | **Éxito**, Vite 8.3.0 |
| `php artisan route:list --path=api --except-vendor` | **Éxito: 28 rutas**, incluidas 14 nuevas rutas web; endpoints legacy siguen listados |
| `git diff --check` | **Éxito**; Git advirtió conversión LF→CRLF esperada por la configuración local de Windows |
| Navegador React ↔ Laravel | **Smoke integrado exitoso** con registro, verificación manual en la DB desechable, login, página de seguridad/sesión, recovery con mensajes iguales y logout con token revocado |
| Navegador responsive y privacidad URL | A 360 px no hubo overflow en login/seguridad; revelar contraseña funcionó; la ruta reset eliminó token y email de la URL. Capturas desktop login y mobile registro adjuntas a la sesión |
| Migraciones de prueba | **19/19 aplicadas** a un SQLite nuevo y aislado dentro del espacio temporal de sesión; el archivo se retiró al finalizar |
| Migración contra base MySQL compartida | No ejecutada intencionalmente |

El smoke registró la cuenta mediante React. Como el mailer de prueba local fue `array` y no se envió correo externo, se marcó verificada manualmente solo en el SQLite efímero para completar login y seguridad; el enlace firmado está cubierto por `WebAuthTest`. Recovery se verificó en navegador por su respuesta genérica para correo existente e inexistente; el restablecimiento real con email se valida en tests backend/UI, no con proveedor SMTP.

### Archivos propios de Incremento 03

Backend: `app/Models/Usuario.php`, `app/Providers/AppServiceProvider.php`, `bootstrap/app.php`, `config/app.php`, `config/auth.php`, `routes/api.php`, `app/Http/Controllers/Api/WebAuthController.php`, `app/Http/Middleware/EnsureWebEmailIsVerified.php`, `app/Http/Resources/UsuarioAuthResource.php`, las migraciones `email_verified_at` y `usuario_password_reset_tokens`, `tests/Feature/WebAuthTest.php`.

React: `src/services/api.js` y `api.test.js`, `src/auth/AuthProvider.jsx`, `src/App.jsx`, `src/components/layouts/Header.jsx`, `src/components/auth/views/Login.jsx` y `Register.jsx`, además de pantallas, componentes, estilos y pruebas bajo `src/components/auth/`.

Los cambios MVC marcados en el worktree se respetaron; no son parte del incremento web.

### Estado y pendientes

**Parcial — código y tests completos; integración de correo real pendiente.** Suites backend/frontend, lint, formato, build y smoke web local pasaron. Falta configurar un mailer operativo y verificar recepción de correo/enlaces de verificación y reset en entorno aprobado. No se aplicaron migraciones a MySQL compartido; antes de hacerlo, revisar y respaldar esa instancia local compartida.
