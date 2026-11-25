# UI-04 — Comercio y áreas privadas

## Alcance y evidencia

Se armonizaron las superficies existentes con los tokens del sistema de diseño y el AppShell compartido, sin agregar otra librería de UI ni modificar la base de datos. Las capturas son de Playwright en Chromium con fixtures de API aislados; no son imágenes generadas.

- 16 rutas/superficies capturadas en light y dark a 360, 768, 1280 y 1440 px: 128 capturas completas.
- 1 captura adicional de error de carga del Marketplace y 1 captura de una conversación móvil interactiva.
- 0 desbordamientos horizontales en las 128 mediciones.
- 28 análisis Axe sobre Marketplace, detalle, mensajes, tiendas, puntos, ajustes y seguridad, en ambos temas y a 360/1280 px. No hubo violaciones automáticas. Axe dejó comprobaciones incompletas para contraste de color (14 incidencias de revisión manual) y atributos ARIA (4); esos resultados no equivalen a una certificación WCAG ni a fallos confirmados.
- Antes de UI-04 no había un baseline verificable disponible en esta ejecución. No se presentan capturas actuales como “before”.

Las evidencias completas, el detalle de mediciones y las solicitudes interceptadas están en esta carpeta: `results.json`, `accessibility.json` y `api-fixture-results.json`.

## Matriz de rutas

| Ruta/superficie | Estado | Implementación y límites observados |
| --- | --- | --- |
| `/productos` | Parcial | Catálogo, filtros, orden, búsqueda y comparación conservados y probados. El diseño no fuerza la grilla de Marketplace al layout social. |
| `/productos/detalle?id=…` | Parcial | Galería, precio, vendedor, preguntas, guardar, contactar y acciones comerciales existentes. No hay recomendaciones de productos en la vista aunque existe un helper de API. |
| `/productos/crear` | Completa para el flujo existente | Formulario, carga de imagen y envío multipart probados contra fixture. No se verificó persistencia real porque la API no estaba disponible. |
| `/productos/mis-productos` | Parcial | Lista privada presente. No se encontró una experiencia completa de edición masiva/dashboard de vendedor en esta ruta. |
| `/mensajes` | Completa para el flujo existente | Lista/conversación responsive y envío probados con fixture. La actualización existente usa polling; no se anuncia como tiempo real. |
| `/tiendas` | Parcial | Directorio, detalle y creación disponibles. No hay UI completa de inventario, analítica/dashboard ni edición masiva. |
| `/puntos-fisicos` | Parcial | Directorio y filtro por ciudad usan datos de API. El mapa y las rutas no están configurados; se informa explícitamente en vez de inventar ubicaciones o tiempos. |
| `/configurar-encuentro` | Parcial | Producto y puntos se cargan desde API y la propuesta de encuentro se envía. La generación/validación QR no está conectada a este flujo, aunque el backend tiene operaciones relacionadas. |
| `/ajustes` | Completa para las preferencias existentes | Cambio de tema y guardado de preferencias probados contra fixture. |
| `/seguridad` | Completa para la superficie existente | Sesiones y avisos de seguridad representados; evidencia visual en ambos temas y a cuatro anchos. No se validó contra backend real. |
| `/admin` y `/admin/*` | Completa visualmente; protegida | Se capturaron dashboard, reportes, usuarios, auditoría y configuración con fixture admin. Se comprobó que un usuario sin rol admin recibe acceso restringido. |
| `/guardados` | Bloqueada/no disponible | No existe ruta/página de guardados; la navegación la marca “próximamente”. Guardar un producto sí está disponible desde su detalle. |
| `/vendedor?id=…` | Bloqueada/no disponible | La ruta muestra un estado que solicita un identificador de perfil real; no hay una página pública de vendedor operativa en esta ruta. |

## Interacciones verificadas

Todas las llamadas se interceptaron en Playwright. Ninguna escritura llegó a una base de datos:

- Búsqueda `RTX`, selección de productos para comparar y navegación al detalle.
- Guardar producto (`POST /guardados`).
- Publicar producto con imagen de prueba y revisar el envío multipart (`POST /productos`).
- Volver de conversación a la lista, abrir una conversación y enviar un mensaje (`POST /mensajes/{id}/mensajes`).
- Crear una tienda, filtrar el directorio de puntos y proponer un encuentro.
- Cambiar y guardar preferencias (`PUT /preferencias`).
- Estado de error del catálogo y restricción de administración para rol no admin.
- Hora de encuentro: selector con etiquetas de 12 horas y valores de 24 horas compatibles con la validación backend `H:i`; se verificó el envío de `18:00` para la opción `06:00 PM`.

## Checklist responsive y accesibilidad

- [x] Capturas a 360, 768, 1280 y 1440 px, en tema claro y oscuro.
- [x] Sin overflow horizontal en las 128 mediciones.
- [x] Conversación con navegación entre lista y chat en móvil.
- [x] Formularios y controles principales revisados en las capturas; interacciones probadas con Playwright.
- [x] Activación por teclado (Espacio) del control de comparación.
- [ ] Recorrido completo de navegación mediante Tab/foco y verificación manual de foco visible.
- [x] Estados de error y acceso denegado incluidos.
- [x] 28 escaneos Axe sin violaciones automáticas.
- [ ] Revisar manualmente las incidencias `incomplete` de contraste y ARIA de `accessibility.json`; Axe no pudo resolverlas automáticamente.
- [ ] Validar flujos de persistencia y permisos contra un backend autenticado.
- [ ] Capturar un baseline anterior comparable; no estaba disponible al iniciar UI-04.

## Limitaciones de la validación

El frontend estuvo disponible en `http://127.0.0.1:5173/`, pero el backend local `http://127.0.0.1:8000/` rechazó conexiones durante la inspección integrada. Por ello, las capturas con datos y los recorridos funcionales prueban la interfaz y los contratos de solicitud contra fixtures, no la integración con una API activa ni la persistencia de datos. No se alteró la base de datos.

## Muestras de capturas

- [Marketplace móvil, claro](marketplace-light-360.png)
- [Marketplace desktop, oscuro](marketplace-dark-1440.png)
- [Detalle de producto móvil](detalle-producto-light-360.png)
- [Publicación desktop](publicar-producto-light-1280.png)
- [Conversación móvil](mensajes-conversacion-light-360.png)
- [Puntos físicos móvil, oscuro](puntos-fisicos-dark-360.png)
- [Tiendas desktop](tiendas-light-1280.png)
- [Ajustes desktop, oscuro](ajustes-dark-1280.png)
- [Error de Marketplace](marketplace-error-light-360.png)
