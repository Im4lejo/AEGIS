# ADR-0021: Referencias cruzadas canónicas

## Estado

Aprobada para el Incremento 19.

## Decisión

- `publicaciones_foro` conserva la publicación social.
- `referencias_publicacion` enlaza recursos explícitos sin copiar precio/stock.
- Producto es la única fuente comercial mostrada en tarjetas.
- Marketplace en feed acepta solo referencias con anuncio público activo/reservado.
- Productos privados/borrados/archivados/vendidos/ocultos muestran estado no disponible.

## Consecuencias

- Compartir no persiste datos contradictorios.
- El perfil conserva pestañas por identidad y audiencia.
