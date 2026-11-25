# ADR-0030: Optimización progresiva sin cambios contractuales

- **Estado:** Aceptado
- **Fecha:** 2026-11-23
- **Responsable:** Copilot SDK

## Contexto

React cargaba todas las rutas principales en un entry de 565 KB. Laravel tenía índices parciales, caché de database/Redis disponible pero sin caché pública explícita y varias rutas monolíticas.

## Decisión

- Separar rutas por lazy loading.
- Mantener Inicio eager por ser ruta inicial.
- Usar caché pública corta solo para datos no sensibles.
- Invalidar caché en mutaciones públicas explícitas.
- Agregar índices compuestos donde las rutas usan estado, visibilidad y fecha.
- Mantener paginación existente y evitar virtualización sin volumen probado.
- No afirmar Core Web Vitals sin medición navegador.

## Alternativas

- Virtualización global: descartada por complejidad sin listas largas probadas.
- Redis obligatorio: descartado por no estar operativo ni configurado.
- Caché de respuestas privadas: descartado por riesgo de fuga.
- Prefetch global: descartado por coste inicial.

## Consecuencias

- El entry principal disminuyó y las rutas secundarias usan chunks bajo demanda.
- Caché pública puede quedar obsoleta hasta 60 segundos fuera de invalidaciones conocidas.
- Las mejoras SQL deben verificarse con EXPLAIN en volumen representativo.
