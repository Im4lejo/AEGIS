# Incremento 19: integración social/comercial

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `7c7997d3bf0595dbbf8802836d14d9c6fa1bd808`.
- Estado inicial: limpio.
- Tag `6.0.0` no existe localmente.

## Base de datos

- Conexión local: MySQL `127.0.0.1:3306`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento19.sql` (107,619 bytes).
- Migración:
  - `2026_11_23_000020_create_publication_references`

## API

- Crear publicaciones acepta `producto_id`.
- Las referencias se serializan como enlaces dinámicos.
- Feed acepta tab `marketplace`.
- Productos retirados quedan como referencia no disponible.

## React

- Compositor acepta ID de anuncio.
- Feed muestra tarjeta comercial enlazada.
- Perfil conserva pestañas públicas y privadas por audiencia.

## Pruebas

- Referencias: 4 pruebas, 16 aserciones.
- Suite completa y build se documentan tras verificación.
