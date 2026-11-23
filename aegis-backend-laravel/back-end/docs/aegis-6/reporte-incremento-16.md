# Incremento 16: ofertas y transacciones

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `53b2861ddf1406fa9477f78800717a5ea2f74ee3`.
- Estado inicial: limpio.
- El tag `6.0.0` no existía localmente.

## Base de datos

- Conexión local: MySQL `127.0.0.1:3306`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento16.sql` (94,770 bytes).
- Migración:
  - `2026_11_23_000017_create_offers_transactions`
- Crea ofertas, historial, reservas y operaciones.

## API

- `GET /api/negociacion`
- `POST /api/ofertas`
- `PATCH /api/ofertas/{id}/contraoferta`
- `PATCH /api/ofertas/{id}/decision`
- `PATCH /api/operaciones/{id}`

## React

- Ficha reemplaza `Comprar Ahora` por `Proponer precio`.
- Modal de oferta.
- Nueva ruta `/negociacion` con panel de ofertas y operaciones.

## Pruebas

- Laravel completo: 87 pruebas, 431 aserciones.
- Ofertas: 4 pruebas, 12 aserciones.
- React UI: 17 pruebas.
- React build: exitoso.

## Estado final

Hecho para negociación, reserva y ciclo sin pasarela de pagos.
