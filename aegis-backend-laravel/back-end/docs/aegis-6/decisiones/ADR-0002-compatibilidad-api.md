# ADR-0002: compatibilidad del API y clientes existentes

- Estado: Aceptado.
- Fecha: 2026-11-23

## Contexto

El contrato no está versionado y tiene 14 rutas existentes. React usa fetch desde `src/services/api.js`; Expo usa Axios desde `aegis-movil/src/models/api/apiClient.jsx`. Ambos consumen identidad, catálogo, foro y perfil.

## Decisión

Conservar métodos, rutas, parámetros y envelopes actuales. Evolucionar de forma aditiva con validación, DTOs y pruebas de contrato. Toda ruptura requiere identificar consumidores, documentar impacto, presentar versión/adaptador y obtener aprobación en un incremento posterior.

## Consecuencias

- No renombrar campos Eloquent expuestos por simple refactor interno.
- Evitar que React dependa de la estructura de tablas/modelos.
- Los cambios de sesión, paginación y serialización deben probar clientes actuales.
- El MVC PHP tiene rutas web diferentes; no se tratará como consumidor del API sin evidencia de integración.
