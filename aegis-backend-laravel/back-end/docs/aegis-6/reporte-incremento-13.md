# Incremento 13: detalle comercial y preguntas

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `bad8cf79049a8b5d8b6090567c8ab0845e2dda6c`.
- Estado inicial: limpio.
- El tag `6.0.0` no existía localmente.
- No se ejecutaron operaciones destructivas ni reconstrucción de historia.

## Base de datos

- Conexión local: MySQL `127.0.0.1:3306`, base `aegis_db`.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento13.sql` (75,031 bytes).
- Migración:
  - `2026_11_23_000014_add_product_questions_and_detail`
- Añade políticas, entrega, encuentro, disponibilidad y preguntas públicas.

## API

- El detalle público añade SEO, confianza, reseñas elegibles y preguntas.
- `GET /api/productos/{id}/preguntas`
- `POST /api/productos/{id}/preguntas`
- `PATCH /api/productos/{id}/preguntas/{pregunta}/respuesta`
- `PATCH /api/productos/{id}/preguntas/{pregunta}/moderacion`

## React

- Preguntas públicas y formulario real.
- Guardado del producto.
- Contactar redirige a mensajes reales o login.
- Metadatos dinámicos y robots.
- Estado y políticas visibles.

## Pruebas

- Laravel completo: 74 pruebas aprobadas, 380 aserciones.
- Detalle comercial: 5 pruebas aprobadas, 24 aserciones.
- React UI: 17 pruebas aprobadas.
- React build: exitoso.
- Bundle supera 500 KB con advertencia existente.

## Estado final

Hecho para ficha completa, preguntas moderables y contexto de confianza real.
