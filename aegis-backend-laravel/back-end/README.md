# AEGIS Backend

Backend Laravel 12 para reemplazar progresivamente el MVC modular PHP de AEGIS. Expone una API REST JSON; no contiene migración de vistas ni código de frontend.

## Requisitos y configuración

- PHP 8.2+
- Composer
- MySQL/MariaDB (o SQLite para desarrollo/pruebas)

Configura la conexión de base de datos mediante las variables `DB_*` de `.env`. No se versionan credenciales.
Configura `FRONTEND_URL` con el origen exacto del frontend para permitir solicitudes CORS; por defecto se usa `http://localhost:5173` en desarrollo. También se permite `http://localhost:8081` para Expo Web.

```bash
composer install
php artisan migrate --seed
php artisan serve
```

El seeder instala las cinco categorías iniciales. No crea cuentas de administrador ni importa datos personales de la base legada.

## API pública disponible

Las respuestas usan JSON y están prefijadas por `/api`.

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/inicio` | Ocho productos activos recientes |
| GET | `/api/categorias` | Categorías ordenadas por nombre |
| GET | `/api/productos` | Productos activos paginados y filtrables |
| GET | `/api/productos/{id}` | Detalle de un producto activo |
| GET | `/api/foro` | Publicaciones con autor y comentarios |
| GET | `/api/perfiles/{id}` | Perfil público, publicaciones y productos activos |
| GET | `/api/puntos-fisicos` | Puntos físicos activos |

`GET /api/productos` admite `busqueda`, `precio_max`, `estado` (`todo`, `nuevo`, `usado`, `reacondicionado`), `cat`, `sort` (`reciente`, `precio-asc`, `precio-desc`), `page` y `per_page` (1–50). Los listados paginados incluyen `data` y `meta`.

## Migración de datos y alcance pendiente

Las migraciones Laravel reproducen las tablas AEGIS (`usuarios`, `categorias`, `productos`, imágenes, foro, puntos físicos, encuentros, QR, calificaciones, reportes y notificaciones), conservando nombres de campos y relaciones. Ejecutar las migraciones crea el esquema vacío; no copia registros de `AEGIS-MVC-MODULAR/database/aegis_db.sql`.

Por decisión de alcance, la API aún no expone registro/inicio de sesión, escrituras, encuentros, perfiles privados ni operaciones de owner/admin. Esas rutas deberán añadirse junto con autenticación y autorización antes de hacerlas accesibles. Los controladores MVC/HTML y las vistas no se migran.

## Verificación

```bash
php artisan route:list --path=api
php artisan test
```
