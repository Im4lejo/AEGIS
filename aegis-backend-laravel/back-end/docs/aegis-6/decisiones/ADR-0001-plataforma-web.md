# ADR-0001: React web y Laravel API como destino

- Estado: Aceptado para orientar incrementos; no implica migración ejecutada.
- Fecha: 2026-11-23

## Contexto

El repositorio contiene una aplicación React/Vite separada, un backend Laravel 12 con API JSON y un MVC PHP modular independiente. El MVC tiene pantallas y 34 rutas server-side; no es el frontend web React. También existe un cliente Expo que usa parte del API.

## Decisión

La evolución web se implementa en React + Laravel API. Mantener MVC y Expo intactos. No retirar ni sincronizar código PHP por simple duplicidad; cada flujo se considera migrado solo al demostrar equivalencia React/API y resolver compatibilidad/datos.

## Consecuencias

- Las futuras pantallas React consumen DTOs a través de un cliente HTTP centralizado; no acceden directamente a Eloquent/PDO.
- Laravel contiene validaciones, reglas de aplicación, autenticación/autorización y persistencia.
- El MVC queda como legado hasta una decisión explícita de retirada.
- Cambios del API deben tener en cuenta React y Expo como consumidores.

## Alternativas descartadas

- Tratar el MVC PHP como frontend objetivo: contradice la presencia del cliente React y mantiene responsabilidades duplicadas.
- Migrar/retirar todas las vistas en este incremento: carece de trazabilidad y pruebas de paridad.
