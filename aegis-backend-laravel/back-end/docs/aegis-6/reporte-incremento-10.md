# Incremento 10: foro avanzado

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `e2e1ca4601a39f32f953b14a5f63a727ecafd6b6`.
- Estado inicial: limpio.
- El tag `6.0.0` no existía localmente.
- No se ejecutaron operaciones destructivas ni reconstrucción de historia.

## Base de datos

- Conexión local: MySQL `127.0.0.1:3306`, base `aegis_db`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento10.sql` (61,500 bytes).
- Migración aplicada:
  - `2026_11_23_000009_add_advanced_threads`
- Añade tipos, estado de interacción, soluciones, actividad, encuestas, votos, suscripciones e historial.

## API

- Creación simple conserva compatibilidad y acepta `tipo`.
- Feed acepta `tipo`, `comunidad_id`, `busqueda` y `orden`.
- Solución: `PATCH /api/foro/{id}/solucion`.
- Cierre: `PATCH /api/foro/{id}/hilo`.
- Suscripción: `POST/DELETE /api/foro/{id}/suscripcion`.
- Encuesta: `PUT /api/foro/{id}/encuesta` y `POST /api/foro/{id}/encuesta/voto`.

## React

- Selector de tipo en el compositor.
- Detalle muestra tipo y estado cerrado.
- Suscripción y cierre desde el hilo.
- Autor puede marcar soluciones.

## Pruebas

- Suite avanzada dirigida aprobada.
- Suite completa, UI y build se ejecutarán en la comprobación final.

## Estado final

Hecho para tipos, solución, cierre, suscripciones y encuestas base.
