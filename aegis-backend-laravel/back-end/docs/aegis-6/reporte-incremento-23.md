# Incremento 23: historias, encuestas, eventos y contenido avanzado

## Alcance y estado

Hecho. Se cerró el flujo backend de historias temporales y eventos comunitarios, se mantuvieron encuestas existentes y se conectó una experiencia web básica de carrusel/eventos.

## Cambios realizados

- Migraciones:
  - `2026_11_23_000024_create_stories_events.php`: historias, visualizaciones, eventos y participaciones.
  - `2026_11_23_000025_add_story_community_context.php`: vincula historias privadas con su comunidad.
- Backend:
  - `GET /api/historias` lista solo historias autorizadas.
  - `GET /api/historias/{historia}` aplica expiración, audiencia, seguimiento, membresía y bloqueos.
  - `POST /api/historias` y `DELETE /api/historias/{historia}` requieren autenticación y cuenta activa.
  - `GET /api/comunidades/{comunidad}/eventos` respeta la visibilidad comunitaria.
  - `POST /api/comunidades/{comunidad}/eventos`, `POST /api/eventos/{evento}/participacion` y `PATCH /api/eventos/{evento}/cancelar`.
  - `ExpirarHistorias` se programa cada cinco minutos; recordatorios activos se procesan con deduplicación.
- React:
  - Carrusel y visor accesible de historias en Inicio.
  - Directorio de comunidades permite crear/consultar eventos y registrar asistencia/interés.
  - API centralizada en `advancedContentApi`.
- Encuestas:
  - Se reutilizó la infraestructura existente `encuestas`/`opciones_encuesta`/`votos_encuesta`; el voto único ya está probado.

## Verificación

| Comando o comprobación | Resultado verificable |
|---|---|
| `php artisan migrate` | Migración 000025 aplicada sobre MySQL local. |
| `php artisan migrate:status` | Migraciones 000024 y 000025 en estado Ran. |
| `php artisan test --filter=AdvancedContentTest` | 4 pruebas, 14 aserciones aprobadas. |
| `php artisan test` | 115 pruebas, 549 aserciones aprobadas. |
| `npx vitest run --config vitest.config.js` | 17 pruebas React aprobadas. |
| `npm run build` | Build Vite exitoso; solo advertencia de chunk superior a 500 KB. |

## Git y esquema

- Rama activa: `PersonalizacionPerfil`.
- HEAD: `bde2a28ca26dd6d0ac2105b1a7df834723fd9a7a`.
- Estado inicial limpio; cambios del incremento mantenidos sin commits ni reconstrucción de historia.
- Tag `6.0.0`: no existe localmente, por lo que no se pudo validar ancestro.
- Conexión: MySQL local `127.0.0.1:3306`, base desechable de desarrollo.
- Respaldo previo: archivo SQL local de 118,060 bytes creado antes del Incremento 23.

## Riesgos y pendientes

- Falta un editor completo de historias y galería multimedia avanzada en Perfil/Comunidad.
- Falta etiquetado/hashtags persistentes y elementos fijados adicionales.
- La cancelación envía cambio de estado; no existe plantilla automática de notificación de cancelación.
- El envío de video depende de Cloudinary configurado; los límites son los existentes (25 MB).
