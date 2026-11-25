# Incremento 28: optimización full-stack y Core Web Vitals

## Alcance y estado

Hecho para splitting React, fallback de ruta, caché pública limitada e índices medidos. CWV reales no se afirmaron porque no existía navegador compartido ni Lighthouse/Web Vitals medido en el entorno.

## Cambios realizados

- React:
  - Lazy loading por rutas con `React.lazy`.
  - `Suspense` y fallback accesible con `role=status`.
  - Movimiento desactivado con `prefers-reduced-motion`.
- Laravel:
  - Caché de Inicio por 60 segundos con clave `inicio:productos:v1`.
  - Invalidación explícita al crear o cambiar estado de un producto público.
  - Índices de rutas públicas para productos, feed, mensajes y notificaciones.
- No se cachearon respuestas privadas ni datos de sesión.

## Baseline y después

### Bundle

- Antes: JS inicial 565.17 KB minificado / 163.04 KB gzip.
- Después: entry inicial 239.01 KB minificado / 74.85 KB gzip.
- Reducción del entry medido: 326.16 KB minificados y 88.19 KB gzip.
- Varios chunks menores cargan bajo demanda.

### API local

Hardware/dataset no automatizado; medición en Laragon local, MySQL 8.4.3.

| Ruta | Promedio de 5 muestras |
|---|---|
| `/api/inicio` | 507.8 ms |
| `/api/productos` | 415.8 ms |
| `/api/categorias` | 350.0 ms |

No se usó esta medición como before/after demostrable.

## Migración

- `2026_11_23_000030_add_performance_indexes.php`.
- Migración aplicada sobre MySQL local.
- Índices idempotentes por nombre.
- Respaldo previo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento28.sql`, 149101 bytes.

## Verificación

| Comando | Resultado |
|---|---|
| `php artisan migrate` | Migración 000030 aplicada. |
| `php artisan test` | 127 pruebas, 635 aserciones. |
| React Vitest | 17 pruebas aprobadas. |
| React build con lazy loading | Exitoso; entry reducido a 239.01 KB. |

## Limitaciones

- No hay medición real de LCP, INP o CLS.
- No hay browser Lighthouse compartido ni Playwright visual.
- No se verificaron exactamente 360/768/1280/1440 con Chromium.
- Caché usa el store configurado; Redis no está probado ni requerido.
- No se añadió virtualización: las listas existentes ya usan paginación y no justificaron un paquete adicional.

## Guía reproducible

- Ejecutar `npm run build` y comparar archivos `dist/assets/index-*.js`.
- Ejecutar un servidor y Lighthouse en modo mobile/desktop para Inicio, Marketplace, detalle y Ajustes.
- Registrar LCP, INP, CLS, TTFB y tasa de errores.
- Usar MySQL `EXPLAIN ANALYZE` sobre las consultas públicas antes y después.
- Ejecutar en datasets de 500, 5000 y 50000 productos sin exponer datos reales.
