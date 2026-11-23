# ADR-0007: Gestión unificada de media

## Estado

Aprobada para el Incremento 05.

## Decisión

- Se conserva Cloudinary como proveedor externo y las tablas separadas de producto y foro por compatibilidad.
- Los controladores usan `MediaManager` y `MediaStorage`; Cloudinary queda aislado en `CloudinaryMediaStorage`.
- Las imágenes aceptan JPEG, PNG y WebP hasta 5 MB y 5000 x 5000 píxeles.
- Los videos admiten MP4, WebM y MOV hasta 25 MB cuando Cloudinary está configurado.
- Las tablas existentes reciben metadatos mínimos, `public_id`, orden, estado y texto alternativo.
- Las eliminaciones remotas fallidas se registran en `operaciones_media` para reintento posterior.
- React usa `MediaDropzone` para previsualización, orden, eliminación local y texto alternativo.

## Consecuencias

- Los registros históricos pueden conservar URL sin `public_id`; no se intenta borrarlos remotamente.
- Las operaciones de media revalidan la propiedad Gate antes de subir, borrar o reordenar.
- Los proveedores remotos se ejecutan fuera de transacciones SQL y pueden compensarse con registros de reintento.
