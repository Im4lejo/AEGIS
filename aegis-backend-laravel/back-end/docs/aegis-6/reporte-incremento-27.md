# Incremento 27: analítica comercial y datos personales

## Alcance y estado

Hecho para analítica de vendedor propia, historial, exportación JSON y solicitudes de privacidad. Live y componentes externos no se usan como fuente de métricas.

## Cambios realizados

- Nueva migración para eventos comerciales minimizados, rollups diarios y solicitudes/exportaciones de privacidad.
- Vista pública activa registra vistas deduplicadas por usuario o sesión/día, excluyendo al propietario.
- Estadísticas de vendedor:
  - vistas válidas
  - contactos distintos asociados a anuncios
  - ofertas recibidas
  - reservas
  - ventas completadas declaradas
  - publicaciones nuevas
- Periodos: 7, 30 y 90 días.
- `GET /api/mi-actividad` combina publicaciones, ofertas, operaciones y reseñas del usuario.
- `POST /api/datos/exportacion` genera JSON interoperable con confirmación y hash SHA-256.
- `POST /api/datos/privacidad` registra desactivación, eliminación o corrección sin borrado físico comercial.
- Desactivación cambia estado y revoca tokens, preservando referencias comerciales.
- React amplía Mis productos y añade `/datos-personales`.

## Migración y respaldo

- Migración: `2026_11_23_000029_create_personal_data_analytics.php`.
- Base local: MySQL `127.0.0.1:3306/aegis_db`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento27.sql`, 142947 bytes.

## Rutas API

- `GET /api/datos-vendedor`
- `GET /api/mi-actividad`
- `POST /api/datos/exportacion`
- `POST /api/datos/privacidad`
- `GET /api/datos/privacidad`

## React

- Mis productos muestra periodo y métricas reales.
- `/datos-personales` permite historial, descarga JSON, desactivación y solicitud de eliminación.

## Verificación

| Comando | Resultado |
|---|---|
| `php artisan migrate` | Migración 000029 aplicada. |
| `php artisan test --filter=PersonalDataTest` | 3 pruebas, 25 aserciones. |
| Suite Laravel completa | 127 pruebas, 635 aserciones. |
| Suite React Vitest | 17 pruebas aprobadas. |
| Build React | Build exitoso; advertencia de chunk superior a 500 KB. |

## Riesgos y pendientes

- Exportación se genera sin almacenamiento temporal descargable posterior.
- Eliminación no se ejecuta automáticamente; conserva operaciones e auditoría según política.
- Los rollups se actualizan sin worker dedicado.
- Jurisdicción y plazos legales deben configurarse con asesoría antes de producción.
