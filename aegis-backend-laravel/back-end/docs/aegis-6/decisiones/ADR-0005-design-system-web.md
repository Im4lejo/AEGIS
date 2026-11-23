# ADR-0005: Design System progresivo para React web

- **Estado:** Aceptado
- **Fecha:** 2026-11-23
- **Contexto:** La interfaz React existente ya tiene rutas, estilos por pantalla y un encabezado compartido, pero carece de tokens, tema y componentes compartidos. El Incremento 02 debe unificar la experiencia sin reescribir pantallas ni simular funcionalidades no implementadas.

## Decisión

Añadir tokens CSS semánticos, patrones compartidos accesibles y un `WorkspaceChrome` que envuelva rutas existentes. Mantener React y el cliente API actuales; no añadir rutas de backend ni cambiar contratos. El tema `system/light/dark` se persiste provisionalmente en almacenamiento local con una clave versionada. Inicio usa el endpoint público existente y comunica explícitamente los estados de carga, error y ausencia de resultados; la personalización por usuario y el feed “Siguiendo” permanecen fuera del alcance.

## Consecuencias

- Las pantallas nuevas pueden adoptar los componentes y tokens de forma incremental.
- La preferencia local es provisional y no se sincroniza con una cuenta.
- Las pantallas heredadas pueden conservar estilos y colores propios; no se afirma consistencia total ni contraste comprobado hasta auditarlas individualmente.
- La navegación compacta es accesible y no sustituye la navegación interna de Foro/Mensajes.
- No hay cambios en base de datos, Laravel, roles, permisos ni API.

## Verificación

`npm test` (13 pruebas de UI y 7 del cliente API), `npm run lint`, `npm run format:check` y `npm run build` pasan. Inicio, Marketplace, Comunidad, Mensajes y Ajustes no presentan overflow horizontal en 360, 768, 1280 y 1440 px. `/perfil` redirige a `/login` sin sesión. Se verificó cambio de tema y persistencia local; la API local no estaba disponible durante la inspección visual. Se adjuntaron capturas desktop y móvil al resultado de la sesión. La verificación integral de teclado/contraste y la ruta de Perfil autenticado quedan pendientes.
