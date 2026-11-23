# Incremento 09: comunidades

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `b3fd446f7c250a03517cb355b29e9351f949f4b7`.
- Estado inicial: limpio.
- El tag `6.0.0` no existía localmente.
- No se ejecutaron operaciones destructivas ni reconstrucción de historia.

## Base de datos

- Conexión local: MySQL `127.0.0.1:3306`, base `aegis_db`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento09.sql` (56,139 bytes).
- Migración:
  - `2026_11_23_000008_create_communities`
- Crea comunidades, membresías, acciones y relación comunitaria en publicaciones.

## API

- Directorio, sugerencias y detalle de comunidad.
- Crear, editar y archivar comunidad.
- Solicitar, aceptar, rechazar, expulsar y banear membresía.
- Invitaciones y salida.
- Miembros, solicitudes, posts y auditoría.
- Control de acceso privado en feed y enlace directo.

## React

- Nueva ruta `/comunidades`.
- Directorio con cards.
- Creación, detalle, solicitud/unión y salida.

## Pruebas

- Laravel completo: 54 pruebas aprobadas, 288 aserciones.
- Comunidades: 5 pruebas aprobadas, 24 aserciones.
- React UI: 17 pruebas aprobadas.
- React build: exitoso; persiste advertencia de bundle mayor a 500 KB.

## Estado final

Hecho para ciclo de vida y moderación comunitaria base. Pendientes visuales: panel completo de solicitudes, multimedia comunitaria y fijados individuales.
