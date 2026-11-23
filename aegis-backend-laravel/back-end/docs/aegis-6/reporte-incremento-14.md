# Incremento 14: tiendas e inventario

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `986122d94fd754a09e41787c4f714f661b8e17da`.
- Estado inicial: limpio.
- El tag `6.0.0` no existía localmente.
- No se ejecutaron operaciones destructivas ni reconstrucción de historia.

## Base de datos

- Conexión local: MySQL `127.0.0.1:3306`, base `aegis_db`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento14.sql` (77,339 bytes).
- Migración aplicada:
  - `2026_11_23_000015_create_stores_inventory`
- Crea tiendas, membresías, verificaciones, inventario y movimientos.

## API

- Directorio y detalle público de tiendas.
- Creación/edición por propietario o gestor.
- Solicitud y revisión administrativa de verificación.
- Inventario y dashboard por tienda.
- Ajustes con bloqueo transaccional y movimientos auditados.
- Catálogo público excluye borradores.

## React

- Nueva ruta `/tiendas`.
- Directorio con cards.
- Creación y detalle real.
- Solo se muestra verificada tras aprobación.

## Pruebas

- Laravel completo: 78 pruebas aprobadas, 398 aserciones.
- Tiendas e inventario: 4 pruebas aprobadas, 18 aserciones.
- React UI: 17 pruebas aprobadas.
- React build: exitoso.
- Advertencia persistente de bundle superior a 500 KB.

## Estado final

Hecho para tiendas, roles contextuales, verificación e inventario transaccional.
