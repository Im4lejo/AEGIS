# Incremento 15: mensajería privada

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `4566fba1bb23be4e93d10bed80bcd286367b3b0a`.
- Estado inicial: limpio.
- El tag `6.0.0` no existía localmente.
- No se ejecutaron operaciones destructivas ni reconstrucción de historia.

## Base de datos

- Conexión local: MySQL `127.0.0.1:3306`, base `aegis_db`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento15.sql` (85,875 bytes).
- Migración aplicada:
  - `2026_11_23_000016_create_messaging`
- Crea conversaciones, participantes, mensajes, lecturas, adjuntos y reportes.

## API

- Bandeja y búsqueda paginadas.
- Conversación directa contextual y no duplicada.
- Conversación grupal.
- Enviar, citar, adjuntar, leer, archivar, silenciar, salir y reportar.
- Eliminación por autor.

## React

- Reemplazó los chats demo por API real.
- Polling verificable cada 5 segundos.
- Contexto de producto en conversación directa.
- Sin indicador online falso.

## Pruebas

- Laravel completo: 83 pruebas aprobadas, 419 aserciones.
- Mensajería: 5 pruebas aprobadas, 21 aserciones.
- React UI: 17 pruebas aprobadas.
- React build: exitoso.

## Estado final

Hecho para chat persistente básico y grupos. Pendiente: proveedor WebSocket real, gestión visual avanzada de grupos y notificaciones posteriores.
