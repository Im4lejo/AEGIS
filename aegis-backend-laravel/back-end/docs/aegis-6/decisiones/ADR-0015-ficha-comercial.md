# ADR-0015: Ficha comercial y preguntas públicas

## Estado

Aprobada para el Incremento 13.

## Decisión

- La ficha pública reutiliza `ProductoResource` y agrega políticas, entrega, disponibilidad y contexto de seguridad.
- Las preguntas usan `preguntas_producto`, con moderación por vendedor/admin.
- Solo preguntas respondidas aparecen públicamente.
- Las reseñas visibles proceden de calificaciones vinculadas a encuentros.
- No se crean badges de vendedor a partir de likes o seguidores.
- Los metadatos SEO usan indexación según estado público y visibilidad.

## Consecuencias

- Productos vendidos/ocultos/borradores no deben indexarse.
- El dueño puede ver su borrador; visitantes reciben 404 en estados no visibles.
- Comprar enlaza al flujo de mensajes existente, no a checkout ficticio.
