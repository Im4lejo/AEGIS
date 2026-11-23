# ADR-0014: Descubrimiento y comparación de marketplace

## Estado

Aprobada para el Incremento 12.

## Decisión

- Los filtros combinables se ejecutan en SQL.
- Los atributos usan el JSON existente de `productos.atributos`; no se crea EAV.
- La ubicación usa ciudad aproximada y ciudad heredada.
- La URL React sincroniza búsqueda, categoría, estado, precios, ubicación, marca y recencia.
- Comparar acepta 2–4 IDs públicos y muestra N/D para campos no disponibles.
- Similares usa misma categoría y ±20% de precio; no usa IA.
- Las búsquedas se registran por cuenta o clave de sesión.

## Consecuencias

- Los filtros compartibles pueden reproducirse sin estado interno.
- Los índices cubren estado/precio/categoría/ubicación/recencia.
