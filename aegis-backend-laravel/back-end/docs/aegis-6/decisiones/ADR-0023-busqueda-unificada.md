# ADR-0023: Búsqueda unificada con SQL

## Estado

Aprobada para el Incremento 21.

## Decisión

- La búsqueda inicial usa consultas SQL indexadas sobre tablas existentes.
- No se agrega Elasticsearch/Meilisearch.
- Privados/perfiles privados/posts privados no aparecen.
- Tendencias usan agregados de historial sin identidad.
- Recomendaciones usan categorías interesadas o recientes no silenciadas.
- Alertas se modelan como búsquedas guardadas con frecuencia.

## Consecuencias

- El volumen actual no justifica motor dedicado.
- URLs compartibles conservan término y entidad.
