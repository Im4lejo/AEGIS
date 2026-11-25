# Plan de corrección visual — dependencias

## Fase 0 — estabilizar pruebas

1. Confirmar Playwright, servidores y login demo.
2. Congelar rutas y contratos API.
3. Mantener capturas before como referencia.

## Fase 1 — P0

1. Resolver overflow `/foro` y ajustes/datos a 360/1440.
2. Corregir login: idioma, h1, contraste y semántica.
3. Corregir nombres accesibles de cards, carrito y logo.
4. Eliminar vistas demo visibles o etiquetarlas honestamente.

## Fase 2 — shell global

1. Consolidar Header, Footer y navegación móvil.
2. Unificar breakpoints y contenedores.
3. Eliminar !important fuera de motion.
4. Crear una escala de z-index a partir de tokens existentes.

## Fase 3 — semántica y accesibilidad

1. Un h1 por ruta.
2. Heading levels consecutivos.
3. Landmarks principales.
4. Contraste footer/muted/text y foco visible.
5. Labels, nombres visibles y estados aria.

## Fase 4 — composición por feature

1. Marketplace y cards.
2. Foro.
3. Ajustes/perfil.
4. Mensajes.
5. Admin.

## Fase 5 — regresión

1. Repetir 104 combinaciones before.
2. Repetir Axe y medir overflow.
3. Capturar after claro/oscuro.
4. Ejecutar tests backend/React existentes.
5. Auditar rutas protected/403/401.
