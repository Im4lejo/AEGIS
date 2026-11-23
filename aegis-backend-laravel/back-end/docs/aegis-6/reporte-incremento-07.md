# Incremento 07: feed social y publicaciones multimedia

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `a9e5b07aff15f457516146a7692fcced6a3489b5`.
- Estado inicial: limpio.
- El tag `6.0.0` no existía localmente; no pudo verificarse relación con HEAD.
- No se usaron comandos destructivos ni reconstrucción de historia.

## Base de datos

- Conexión local: MySQL `127.0.0.1:3306`, base `aegis_db`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento07.sql` (45,829 bytes).
- Migración aplicada:
  - `2026_11_23_000006_extend_social_feed`
- Se extendió `publicaciones_foro` y se añadieron reacciones, menciones y etiquetas.

## API

- Conservado: `GET/POST/PATCH/DELETE /api/foro...`.
- Feed acepta `tab=para-ti|siguiendo|recientes`, `cursor` y `per_page`.
- Nuevas rutas:
  - `PATCH /api/foro/{id}/archivar`
  - `POST/DELETE /api/foro/{id}/reacciones`
- Soporta borradores, programación, fijado, edición, etiquetas, menciones y enlaces seguros.

## React

- Tabs del feed y carga incremental.
- Compositor conectado al backend.
- Acciones de editar y archivar confirmadas para el dueño.
- Reacciones y recuperación de errores accesible.

## Pruebas

- Laravel completo: 45 pruebas aprobadas, 238 aserciones.
- Feed social: 4 pruebas aprobadas, 25 aserciones.
- React UI: 17 pruebas aprobadas.
- React build: exitoso, con advertencia de tamaño de bundle.
- Sin captura manual: no había navegador compartido.

## Estado final

Hecho para feed social básico sobre la entidad existente. Pendiente: encuestas, preguntas y preview remota enriquecida requieren nuevas integraciones.
