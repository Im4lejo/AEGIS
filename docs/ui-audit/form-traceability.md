# Trazabilidad de formularios y cargas

## Resultado principal

No existen dos títulos persistidos independientes en la publicación del foro. Existe un estado que codifica título y cuerpo con saltos de línea y dos representaciones visuales del mismo dato. Sí existen sistemas de carga incompatibles y simultáneos, especialmente al publicar productos.

## Publicación de productos: trazabilidad completa

| Entrada / estado | Componente y manejador | Validación React | API / endpoint | Backend y persistencia | Resultado comprobado |
|---|---|---|---|---|---|
| Título | [`PublicarProducto.jsx`](../../aegis-web/AEGIS-REACT/src/components/productos/views/PublicarProducto.jsx), `datos.titulo`, `cambiarDato` | `required`, 150, `trim`, no vacío | `productApi.create` → `POST /api/productos` | `ProductoController::store` → `Producto` → `productos.titulo` | Solo existe un campo persistido de título. La vista previa no es una segunda entrada. |
| Categoría, condición, ciudad | `datos.categoria_id`, `datos.estado`, `datos.ciudad` | `required` para categoría/condición; lengths HTML | mismo multipart | `ProductoController::store` → `productos` | Carga de categorías desde `GET /api/categorias`. |
| Precio | `datos.precio`, `soloNumeros` | input numérico, mínimo 0; cliente elimina caracteres | mismo multipart | decimal en `productos.precio` | Acepta cero; validar coherencia comercial en el siguiente incremento. |
| Descripción | `datos.descripcion` | `required`, `trim` | mismo multipart | `productos.descripcion` | Se conserva. |
| Fotos nuevas (`MediaDropzone`) | `mediaFiles`, `setMediaFiles`, máximo 5 | Tamaño/tipo implementados en el componente compartido | `api.js` agrega cada archivo como `imagenes[]` | `ProductoController::store`, `ImagenProducto` / `imagenes_producto` | Aceptado por API; no alimenta la vista previa heredada. |
| Fotos escritorio heredadas | `fotoPrincipal`, `fotos`, `archivos`, `elegirFotoPrincipal`, `elegirFotoExtra` | Acepta `image/*`, compresión canvas local | mismas `imagenes[]` | mismas tablas | Sistema paralelo, puede estar visible junto al dropzone. |
| Fotos móvil heredadas | mismos estados; `elegirFotos` | hasta 5 por selección | mismas `imagenes[]` | mismas tablas | Tercera interfaz sobre la misma representación heredada. |
| Texto alternativo | `mediaAltText` | máximo controlado por MediaDropzone/API | campo `alt_text` | aplicado a cada fila `imagenes_producto` | Un texto se replica a todos los archivos; no existe alt individual. |

### Incidencia P0: tres sistemas visuales de media

- [`PublicarProducto.jsx`](../../aegis-web/AEGIS-REACT/src/components/productos/views/PublicarProducto.jsx) monta `MediaDropzone` sin condición, luego un conjunto desktop de una principal + cuatro extra y un conjunto móvil.
- Usa estados incompatibles: `mediaFiles` contra `archivos`, `fotoPrincipal` y `fotos`.
- En submit, `mediaFiles.length ? mediaFiles : archivos.filter(Boolean)` hace que seleccionar en el dropzone descarte silenciosamente cualquier selección heredada.
- La vista previa solo usa `fotoPrincipal/fotos`, por lo que no refleja lo enviado cuando se eligió el dropzone.
- El dropzone anuncia imágenes y video, mientras el endpoint permite únicamente JPG/JPEG/PNG/WebP. Video produce 422.

**Función que debe conservarse:** máximo 5 archivos, imagen principal, orden, responsive desktop/móvil, preview, alt y los mensajes de error backend.

**Solución propuesta:** una sola lista ordenada como fuente de verdad y un único componente reutilizable; separar explícitamente imagen principal de galerías solo mediante UI derivada. Si video debe aceptarse, primero se requiere un endpoint/contrato compatible; no se debe ocultar el rechazo actual.

**Prueba:** selección/reemplazo/remoción, cinco imágenes, sexto rechazado, MIME y tamaño, preview igual al payload, orden/principal, 422, doble submit y ambos breakpoints.

## Publicación del foro: trazabilidad completa

| Entrada / estado | Componente y manejador | Consumidor API | Backend | Persistencia | Comportamiento esperado |
|---|---|---|---|---|---|
| Campo compacto “Crear publicación” | `textoPublicacion`, expandido al focus en [`Foro.jsx`](../../aegis-web/AEGIS-REACT/src/components/foro/views/Foro.jsx) | No envía por sí solo | — | — | Punto de entrada contextual; desaparecer al expandir. |
| “Título de la publicación” | Primera línea de `textoPublicacion` | `forumApi.create` construye multipart | `ForoController::store` | `publicaciones_foro.titulo` | Título independiente y no repetido en cuerpo. |
| “Detalles” | Resto de líneas de `textoPublicacion` | mismo payload como `contenido` | mismo controlador | `publicaciones_foro.contenido` | Cuerpo independiente del título. |
| Tipo | `tipoPost` | `tipo` | validado en `discusion/pregunta/tutorial/encuesta/anuncio` | `publicaciones_foro.tipo` | Debe seguir visible según contexto. |
| Referencia comercial | `productoReferencia` | `producto_id` | creación de referencia/relación | `referencias_publicacion` | Contexto comercial opcional. |
| Archivo único inicial | `archivoNuevo`, `imagenNueva`, `seleccionarImagen` | `imagenes[]` | `ForoController::store` | `ImagenPublicacionForo` / `imagenes_publicacion_foro` | Solo imágenes en creación inicial. |
| Carga posterior de media | `mediaApi` disponible en el servicio | `/foro/{id}/imagenes` | `MediaController` | misma tabla con metadata/video | Flujo separado y capaz de media avanzada. |

### Incidencia P0: título codificado dentro del cuerpo

- `publicar()` extrae la primera línea como `titulo`, pero envía el estado completo como `contenido`.
- El feed y el detalle renderizan `titulo` y `cuerpo`; por eso la misma primera línea se visualiza dos veces.
- El input compacto y el input expandido son representaciones excluyentes del mismo estado, no dos datos persistidos.
- Editar envía solo `contenido` desde `window.prompt`; el cliente cambia un título local, pero el backend conserva el título original. Tras recargar aparece la inconsistencia.

**Función que debe conservarse:** flujo compacto → compositor, título visible, cuerpo multilínea, referencias, tipo, cancelación, preview y edición.

**Solución propuesta:** `titulo` y `contenido` como estados separados. Editar ambos según contrato; el fallback backend debe quedar para clientes existentes, no para simular duplicidad.

### Incidencia P0: video anunciado donde solo se aceptan imágenes

- El `input` inicial acepta MP4/WebM/QuickTime.
- `seleccionarImagen` siempre muestra un `<img>`.
- `forumApi.create` siempre agrega `imagenes[]`.
- La creación inicial valida solo `image` y JPG/JPEG/PNG/WebP.
- Video sí tiene un contrato separado mediante el endpoint posterior de media.

**Función que debe conservarse:** imagen inicial inmediata y media avanzada posterior.

**Solución propuesta:** declarar en UI solo los MIME permitidos por el endpoint inicial o ejecutar un flujo explícito de creación + endpoint de video. No reutilizar `<img>` para video.

### Estructura del compositor

- El compositor del foro no es un `<form>`; depende de clicks.
- La validación HTML `required` del textarea no se usa como validación de submit.
- Debe conservar publicación por botón y añadir semántica de formulario/Enter sin activar acciones por accidente en texto multilínea.

## Inventario del resto de formularios

| Gravedad | Formulario | Flujo comprobado | Observación / prueba |
|---|---|---|---|
| Media | Home search | `Home` → navegación con query → marketplace | Validar Enter, query escapada y búsqueda vacía. |
| Media | Búsqueda global | `Busqueda` → `searchApi.search` → `GET /busqueda` | Conserva mínimo 2 caracteres; probar sugerencias y filtros. |
| Alta | Login/registro/recuperación/verificación | Vistas auth → `WebAuthController` → `usuarios`, tokens/estado | Probar 422, sesión, retorno y cuenta inactiva. |
| Alta | Seguridad de cuenta | `AccountSecurity` → PATCH contraseña/sesiones → WebAuth | Probar revocación y error de confirmación. |
| Alta | Pregunta de producto | `Detalle` → `productApi.ask` → `preguntas_producto` | Trazabilidad válida; probar visitante, dueño y maxlength. |
| Alta | Comentario de publicación | `Publicacion` y feed → `/foro/{id}/comentarios` → `comentarios_foro` | Hay implementaciones paralelas pero misma persistencia; probar consistencia. |
| Media | Oferta | `Detalle` → `/ofertas` → `Ofertas`, historial y operación | No confundir con carrito checkout. Probar buyer/seller. |
| Alta | Comentario en perfil | `Perfil` → API foro; identificador de publicación disponible | Validar perfil ajeno una vez que exista ruta pública. |
| Alta | Mensajes | `Mensajes` → multipart `/mensajes/{id}/mensajes` | Texto o adjunto; probar imagen/video, privacidad y bloqueos. |
| Media | Comunidad y evento | `Comunidades` → endpoints comunidad/evento | Backend valida owner/moderador; probar cada rol. |
| Media | Crear tienda | `Tiendas` → `TiendaController::store` | Validaciones alineadas. |
| Alta | Encuentro | `Encuentros` → `EncuentroController::store` | Faltan rutas/ID degradan uso directo; probar relación comprador-vendedor y punto aprobado. |
| Media | Admin usuarios/configuración | PATCH/PUT admin con backend | Confirmación y autorización deben permanecer. |
| Crítica | `puntosFisicos/Configuracion` | form nativo POST `/puntos-fisicos/guardar` | Componente no registrado y endpoint inexistente; no activar sin cableado API. |

## Perfil: otra trazabilidad incompleta

[`Editar.jsx`](../../aegis-web/AEGIS-REACT/src/components/perfil/views/Editar.jsx) presenta datos de cuenta y los guarda en `localStorage`, aunque Laravel ya expone actualización de perfil en `PerfilController`. La UI puede parecer persistencia real y después volver al valor servidor. Esto debe trazarse como implementación incompleta, no como duplicidad a eliminar.

## Reglas para un siguiente cambio

- No eliminar un uploader hasta que su selección, preview y contrato estén representados por el nuevo único flujo.
- No eliminar inputs según título visible: comprobar estado, validación, payload y persistencia.
- No eliminar media de video sin habilitar su camino de endpoint posterior.
- Mantener mensajes 422 específicos y la protección contra dobles envíos.

