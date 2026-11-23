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

El frontend guarda token y usuario en el contexto de autenticación; las operaciones protegidas envían `Authorization: Bearer <token>`. Leer productos, categorías, publicaciones del foro y puntos físicos sigue siendo público.

## Migración de datos y alcance pendiente

Las migraciones Laravel reproducen las tablas AEGIS (`usuarios`, `categorias`, `productos`, imágenes, foro, puntos físicos, encuentros, QR, calificaciones, reportes y notificaciones), conservando nombres de campos y relaciones. Ejecutar las migraciones crea el esquema vacío; no copia registros de `AEGIS-MVC-MODULAR/database/aegis_db.sql`.

La API todavía no expone operaciones de encuentros, perfiles privados ni operaciones de owner/admin. Los controladores MVC/HTML y las vistas no se migran.

## Verificación

```bash
php artisan route:list --path=api
php artisan test
```
