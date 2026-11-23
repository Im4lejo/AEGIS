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
