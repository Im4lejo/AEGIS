# Incremento 20: notificaciones reales

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `e0ba8d6c0b5c95ffd7412faf509d16a06e1f5dbf`.
- Estado inicial: limpio.
- Tag `6.0.0` no existe localmente.

## Base de datos

- Conexión local: MySQL `127.0.0.1:3306`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento20.sql` (110,146 bytes).
- Migración:
  - `2026_11_23_000021_harden_notifications`
- Crea preferencias y extiende notificaciones con categoría, actor, objeto, destino y dedupe.

## API

- Bandeja filtrable y paginada.
- Contador no leído.
- Leer individual y todas.
- Archivar y descartar.
- Preferencias por categoría/canal.

## React

- Cabecera reemplaza texto próximamente por badge y dropdown.
- Nueva ruta `/notificaciones`.
- Filtros, estados, acciones y preferencias.

## Pruebas

- Laravel completo: 103 pruebas, 493 aserciones.
- Notificaciones: 4 pruebas, 19 aserciones.
- React UI: 17 pruebas.
- React build: exitoso.

## Estado final

Hecho para in-app persistente, preferencias y deduplicación. Email/push quedan pendientes de proveedor externo configurado.
