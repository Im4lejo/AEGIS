# Incremento 25: denuncias, moderación, antifraude y apelaciones

## Alcance y estado

Hecho para el flujo web central: reportes contextualizados, cola administrativa, sanciones proporcionales, apelaciones, reversión, antifraude interpretativo y auditoría encadenada. Los mensajes privados no se exponen al moderador y solo se habilitan procesos mediante reporte.

## Cambios realizados

- `reportes` evoluciona con prioridad, asignación, evidencia, resolución, sanción y fingerprint de deduplicación.
- Nuevas tablas: sanciones, apelaciones, acciones de moderación, señales antifraude y auditoría moderativa.
- API:
  - `POST /api/reportes/contextual`
  - `GET /api/reportes/mis`
  - `POST /api/reportes/{reporte}/apelacion`
  - `GET /api/moderacion/reportes`
  - `PATCH /api/moderacion/reportes/{reporte}/asignar`
  - `PATCH /api/moderacion/reportes/{reporte}/resolver`
  - `GET /api/moderacion/apelaciones`
  - `PATCH /api/moderacion/apelaciones/{apelacion}/resolver`
  - `GET /api/moderacion/antifraude`
  - `POST /api/moderacion/productos/{producto}/antifraude`
- React añadió Reportar en publicaciones, `/mis-reportes` y `/admin/reportes`.
- Mensajes de desconocidos respetan `mensajeria.mensajes_desconocidos`.
- El antifraude crea señales para revisión y nunca cambia estado o culpa automáticamente.

## Migración y respaldo

- Migración: `2026_11_23_000027_create_moderation_appeals.php`.
- Base MySQL local desechable: `127.0.0.1:3306/aegis_db`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento25.sql`, 128976 bytes.
- El campo `reportes.estado` se normalizó a `VARCHAR(20)` en MySQL para admitir revisión/descarte.

## Verificación

| Comando | Resultado |
|---|---|
| `php artisan migrate` | Migración 000027 aplicada. |
| `php artisan test --filter=ModerationAppealTest` | 4 pruebas, 26 aserciones. |
| Suite Laravel completa | 120 pruebas, 581 aserciones aprobadas. |
| Suite React Vitest | 17 pruebas aprobadas. |
| Build React | Build Vite exitoso. |

## Riesgos y pendientes

- Las evidencias aceptadas son URLs HTTP/HTTPS; no se implementó almacenamiento protegido de archivos.
- Las sanciones afectan estado de cuenta, pero expiración automática de suspensión requiere job/consulta posterior.
- El contenido privado no se elimina automáticamente al resolver; debe hacerlo una acción específica posterior.
- La auditoría encadenada es append-only por aplicación, pero no se añadió firma externa ni tabla de claves.
