# ADR-0029: Analítica comercial propia y privacidad

- **Estado:** Aceptado
- **Fecha:** 2026-11-23
- **Responsable:** Copilot SDK

## Contexto

Mis productos solo mostraba cantidades por estado y no existían vistas reales, métricas comerciales comparables ni exportación/solicitud de privacidad.

## Decisión

- Usar tablas existentes de productos, ofertas, reservas, operaciones y mensajes como fuentes.
- Registrar vistas minimizadas con deduplicación y rollups diarios.
- Excluir vistas del propietario y no almacenar IP/UA completos.
- Medir periodos mediante fechas reales almacenadas.
- Exportar JSON con confirmación y hash, limitado a datos del usuario autenticado.
- Separar desactivación de eliminación y conservar referencias comerciales/auditoría retenibles.

## Alternativas

- Vistas infladas por cada carga: descartado por fraude y duplicación.
- Conteos SQL ad hoc ilimitados: descartado por costes; se mantienen rollups/índices.
- Borrado físico inmediato: descartado por integridad comercial e investigaciones.

## Consecuencias

- Las métricas son exactas dentro de AEGIS, no muestran tráfico externo.
- Exportación no mantiene un enlace persistente con el archivo.
- Eliminación requiere revisión humana y política legal explícita.
