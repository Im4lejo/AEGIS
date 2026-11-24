# Incremento 26: administración central

## Alcance y estado

Hecho para el panel web administrativo central. Se añadieron KPIs medidos, usuarios filtrables, categorías, avisos, configuración versionada, auditoría, exportación controlada y permisos operativos delegables.

## Cambios realizados

- Migración `2026_11_23_000028_create_admin_center.php`.
- Nuevas tablas: `permisos_operacion`, `configuracion_global`, `avisos_sistema`.
- Categorías reciben `estado` y `orden`.
- Dashboard con periodos 24h, 7d y 30d.
- Cambios críticos de cuenta exigen confirmación `CONFIR`.
- Exportación CSV registra la acción en auditoría encadenada.
- Permisos operativos específicos para dashboard, usuarios, categorías, avisos, configuración, auditoría y exportación.

## Rutas API

- `GET /api/admin/dashboard`
- `GET/PATCH /api/admin/users`
- `GET/POST/PATCH /api/admin/categorias`
- `GET/POST /api/admin/avisos`
- `GET/PUT /api/admin/configuracion`
- `GET /api/admin/auditoria`
- `GET /api/admin/auditoria/exportar`
- `GET/POST /api/admin/permisos`
- `DELETE /api/admin/permisos/{permiso}`

## React

- Dashboard administrativo con KPIs y periodos.
- Usuarios con filtros y acciones confirmadas.
- Auditoría con timeline básico y exportación.
- Configuración central con versión optimista.
- Navegación responsive `/admin`, `/admin/usuarios`, `/admin/reportes`, `/admin/auditoria` y `/admin/configuracion`.

## Git y respaldo

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `5408d43d5b3572262d5fadd5effd6ba11bef93f9`.
- Tag `6.0.0`: no existe localmente.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento26.sql`, 138462 bytes.

## Verificación

| Comando | Resultado |
|---|---|
| `php artisan migrate` | Migración 000028 aplicada. |
| `php artisan test --filter=AdminCenterTest` | 4 pruebas, 29 aserciones. |
| React Vitest | 17 pruebas aprobadas. |
| React build | Build exitoso; advertencia preexistente de chunk grande. |
| Suite Laravel completa | 124 pruebas, 610 aserciones aprobadas. |

## Riesgos y pendientes

- Falta UI completa de CRUD de categorías y avisos.
- El CSV limita exportación a 10,000 registros.
- Los permisos delegados no tienen vigencia ni caducidad.
- El rollout requiere definir al menos una persona administradora y separar soportes operativos.
