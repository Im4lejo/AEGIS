# UI-03: superficies sociales

## Matriz de intervención

| Ruta o estado | Problema observado | Intervención |
| --- | --- | --- |
| `/home` | Historia con color heredado en oscuro y visor sin las garantías del diálogo compartido. | Tokens para historias y `Modal` compartido, con nombre accesible y retorno de foco. |
| `/foro` | Superficies, controles y acciones con contrastes dispares; controles del compositor separados del feed; cabecera del autor capturaba clics de edición. | Superficies y controles tematizados, opciones agrupadas en el feed, nombres accesibles, visor compartido y navegación del autor limitada a su botón. La selección de archivo abre el compositor y muestra su vista previa. |
| `/publicacion?id=123` | El grid reservaba columnas para paneles ausentes y comprimía el contenido en desktop. | Una columna con ancho legible; comentario con nombre accesible y estilos comunes del foro. |
| `/comunidades` y detalle | Tarjetas blancas con texto claro en oscuro y controles sin un patrón común; un error de carga también mostraba el estado vacío. | Superficies, formularios y acciones con tokens; se distingue el error de una lista vacía. Membresía y eventos conservan sus acciones existentes. |
| `/perfil` | Paneles blancos y texto claro en oscuro; galería sin diálogo compartido. | Paneles y acciones tematizados, ancho coherente y visor con foco y Escape. Se conserva la información existente de productos y publicaciones. |
| `/perfil/editar` | Valores y controles oscuros poco legibles en el tema oscuro. | Estilos de navegación, formularios, tarjetas y modal armonizados. No se alteró la lógica de edición. |
| `/vendedor?id=987` | La ruta muestra la vista no disponible existente. | Se conserva el comportamiento y se captura el estado; no se activa la vista no conectada. |

## Evidencia y ejecución

- [Antes](../../before/ui-03/) y [después](./): 360, 768, 1280 y 1440 px, temas claro y oscuro, en Chromium. Hay 56 capturas antes y 64 después de los ocho estados de ruta; seis capturas adicionales muestran historia, imagen, compositor, foro vacío y errores. Las ocho capturas anteriores de edición de perfil se retiraron porque mostraban valores personales heredados del código; no se recreó una línea base ficticia. El `results.json` anterior conserva las mediciones de esas ejecuciones, no esas imágenes.
- Se usaron rutas React reales con un usuario, publicaciones, comunidad, evento y respuestas API sintéticas en un contexto aislado de Playwright. Se bloquearon las llamadas no previstas; las escrituras probadas recibieron respuestas interceptadas, sin escribir en la base de datos. Para la edición de perfil se inyectaron valores sintéticos en almacenamiento del contexto.
- Las 64 mediciones posteriores no detectaron desbordamiento horizontal del documento. Los carriles y pestañas pueden tener desplazamiento propio. Los recursos de imagen claros de la fixture pueden verse blancos sobre blanco; no equivalen a una prueba de todos los medios reales.
- El script [ui-03-capture.cjs](../../../../aegis-web/AEGIS-REACT/scripts/ui-03-capture.cjs) realiza las capturas y comprueba, con respuestas interceptadas, abrir visores mediante teclado, Tab/Escape y retorno de foco; selección y envío multipart de imagen; creación de publicación; comentarios y error; apertura de comunidad, participación y salida; comentario en perfil y estado vacío/error. Se ejecuta desde el frontend con `node scripts\ui-03-capture.cjs`; requiere un servidor Vite disponible en `http://127.0.0.1:5173`.
- [accessibility.json](./accessibility.json): axe sobre `main` en seis rutas, a 360 y 1440, ambos temas: 24 análisis, sin violaciones automáticas. Ocho análisis incluyen resultados incompletos (`aria-prohibited-attr`; en dos también `color-contrast`), que requieren revisión manual. No es una certificación WCAG ni cubre cabecera, pie, todos los estados o controles.
- `npm test`: 24 pruebas Vitest y ocho Node aprobadas. `npm run build`: aprobado. ESLint focalizado en las vistas de inicio, foro, publicación y perfil y el script: aprobado; al incluir comunidades falla por `react-hooks/set-state-in-effect` en el `useEffect(load, [])` preexistente. `git diff --check`: aprobado.

## Brechas y límites

- La API contiene operaciones adicionales de comunidad, pero la vista actual no expone todas las interfaces de discusión, moderación, respuestas anidadas, fijados o encuestas. No se han simulado como funciones terminadas.
- Las pestañas de perfil solicitan datos, pero los paneles de publicaciones y productos visibles usan la carga inicial; no se afirma que todas las pestañas presenten sus datos completos.
- El editor combina datos y preferencias de demostración/locales con llamadas API. Contiene valores personales de ejemplo heredados en su código; deben revisarse por separado. Sus capturas posteriores usan datos sintéticos.
- Las pruebas autenticadas usan una sesión simulada y no verifican autenticación, permisos, persistencia, subida real de archivos ni integración Laravel/base de datos. Tampoco cubren todas las acciones, rutas sociales, errores o tamaños de componentes abiertos.
- El modal heredado del editor y otros estilos locales quedan pendientes de una revisión integral de teclado y contraste. El alcance del análisis axe excluye el chrome compartido. No se declara cumplimiento WCAG completo ni aceptación integral UI-03.
- Se conserva la incidencia previa de Marketplace documentada en [layouts.md](../../../layouts.md).
