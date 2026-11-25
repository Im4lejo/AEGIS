# UI-05 — Informe final de auditoría visual

## Resultado

La matriz UI-05 pasó en Chromium con fixtures aislados. Se generaron 190
capturas para invitados, usuarios, vendedor (usuario con anuncio propio),
moderador de comunidad y administrador, a 360, 768, 1280 y 1440 px, en temas
claro y oscuro. Las 176 mediciones del ancho total del documento no encontraron
overflow horizontal. Las tablas de Mis productos y Usuarios admin tienen scroll
horizontal propio, indicación para móvil y operación con flechas izquierda/derecha;
las acciones que no caben inicialmente se alcanzan desplazando esa región. No se
modificó la base de datos ni se crearon commits.

- [Matriz de rutas](./after/ui-05/matriz-rutas.md)
- [Checklist de regresión](./after/ui-05/checklist-regresion.md)
- [Resultados Playwright](./after/ui-05/route-results.json)
- [Resultados Axe](./after/ui-05/accessibility.json)
- [Contraste calculado de tokens](./after/ui-05/token-contrast.json)
- [Consola y solicitudes interceptadas](./after/ui-05/api-console-results.json)
- [Capturas UI-05](./after/ui-05/)
- [Sistema de diseño actualizado](../design-system.md)

## Cambios realizados

- Header: el botón del carrito anuncia su cantidad y separa el icono/badge
  decorativo del nombre accesible.
- Header: el botón de búsqueda alcanza el target mínimo 24×24 px.
- Login: el logo móvil usa texto alternativo en la imagen, el contraste de los
  enlaces secundarios se ajustó y el control Mostrar/Ocultar contraseña
  alcanza 24 px de alto.
- Tablas de Mis productos y Usuarios admin: regiones de scroll con nombre,
  indicación móvil, navegación por teclado y nombres accesibles para los
  selectores de rol y estado de cada usuario.
- Playwright: suite con fixtures aislados, límites de acción, checks de
  `toHaveScreenshot()` sin actualización automática, Axe, ratios de tokens,
  overflow, flujos y foco/teclado de navegación móvil y tablas.
- No se modificó el comportamiento de publicación, contrato API, permisos,
  rutas ni datos de producción.

## Validación ejecutada

| Verificación | Resultado |
| --- | --- |
| UI-05 Playwright | 5 pruebas pasan; 190 capturas, 52 escaneos Axe y cero violaciones automáticas en los escaneos. |
| Overflow | Cero desbordamientos en 176 capturas de ruta a los cuatro anchos y dos temas. |
| Contraste de tokens | Pares seleccionados: mínimo 5.32:1 en claro y 8.07:1 en oscuro. No cubre todos los estilos locales. |
| Frontend `npm test` | 24 Vitest + 8 Node pasan. |
| Frontend `npm run build` | Pasa. |
| ESLint focalizado | Falla en Mis productos: variable `meta` no usada y regla `set-state-in-effect`; además, avisos de dependencias de hooks en ambas vistas. |
| ESLint global | Falla con 11 errores y 8 advertencias; no se repararon problemas fuera del alcance. |
| Backend `php artisan test` | 127 pruebas y 635 assertions pasan con `FRONTEND_URL=http://localhost:5173` solo en el proceso. |
| Backend con `.env` local | 126 pasan y 1 falla porque la prueba espera `localhost` y el entorno responde con `127.0.0.1`. |
| Typecheck | No existe script configurado. |
| API HTTP local | No disponible; `127.0.0.1:8000` rechaza conexión. |

El navegador integrado mostró errores reales de conexión en `/api/inicio` y
`/api/historias`. En contraste, la corrida Playwright interceptó 855 llamadas
API, sin errores de consola ni errores de página; esos resultados solo
demuestran la interfaz y los contratos usados contra fixtures, no integración
real ni persistencia.

## Capturas y baseline

Las imágenes fueron capturadas por Playwright/Chromium. Se inspeccionaron
[Inicio móvil](./after/ui-05/home-guest-light-360.png),
[Login móvil](./after/ui-05/login-guest-light-360.png),
[Marketplace oscuro](./after/ui-05/marketplace-guest-dark-1440.png) y
[navegación móvil abierta](./after/ui-05/mobile-navigation-open-dark-guest-dark-360.png).
También se inspeccionaron las [tablas de Mis productos](./after/ui-05/seller-products-seller-light-360.png)
y [Usuarios admin](./after/ui-05/admin-users-admin-light-360.png) a 360 px:
el hint queda visible y el desplazamiento horizontal permite alcanzar las
columnas fuera del encuadre inicial.
Tres comparaciones `toHaveScreenshot()` cubrieron Marketplace, detalle y
Mensajes contra snapshots de UI-04; se mantuvo bloqueada la actualización
automática.

UI-00 tiene capturas históricas en [before](./before/), pero no se declararon
comparaciones pixel a pixel: las capturas no comparten datos/fixtures y el
backend local no respondió durante esta auditoría. Los screenshots UI-05
muestran datos de prueba, incluidos recursos visuales de fixture, y no deben
confundirse con contenido de producción.

## Accesibilidad y limitaciones

Los 52 escaneos cubren 13 superficies seleccionadas a 360 y 1280 px, ambos
temas. Axe no reportó violaciones automáticas en esa selección, pero produjo
64 resultados `incomplete` que requieren valoración manual. También se probó
el menú móvil con teclado: apertura por Enter, foco dentro del diálogo,
cierre por Escape y restauración del foco. No es una certificación WCAG 2.2 AA
ni una prueba completa con lector de pantalla.

No se midió una comparación de bundle antes/después. El build de producción
contiene 41 chunks JavaScript y 21 CSS: 573.4 kB JavaScript / 190.1 kB gzip
y 179.4 kB CSS / 41.7 kB gzip, sumando los tamaños por archivo en `dist`.
El punto de entrada es 239.6 kB JavaScript / 75.04 kB gzip; el chunk `Header`
es 61.9 kB / 21.08 kB gzip y las rutas se dividen en chunks, por ejemplo Foro
22.2 kB y Perfil 19.0 kB. Son medidas del build actual, no metas ni una
comparación histórica.

## Riesgos y pendientes de despliegue

1. Levantar una API local disponible y repetir autenticación, permisos,
   persistencia, peticiones fallidas y consola con cuentas aisladas.
2. Revisar los 64 resultados Axe `incomplete`, contraste de estilos heredados,
   lectores de pantalla y los estados no incluidos en las 13 superficies.
3. Resolver o alinear `FRONTEND_URL` de `.env` con el hostname que espera
   `WebAuthTest`; no se cambió su configuración porque no es una corrección
   visual.
4. Corregir los hallazgos globales de ESLint en una tarea dedicada; no se
   amplió el alcance para resolver problemas no relacionados.
5. Revisar visualmente con lectores de pantalla la indicación y las acciones
   de las tablas desplazables de Mis productos y Usuarios admin a 360 px; el
   scroll táctil y con flechas fue verificado. Ver capturas en la
   [matriz de rutas UI-05](./after/ui-05/matriz-rutas.md).
6. `/guardados` no tiene página, `/vendedor?id=…` sigue parcial y mapa/QR no
   están integrados con servicios verificados; ver el detalle previo en
   [matriz UI-04](./after/ui-04/matriz.md).

## Control de versiones y alcance

La rama activa verificada fue `PersonalizacionPerfil`; el tag local `6.0.0`
no está presente. El árbol ya tenía numerosos cambios sin confirmar al iniciar
esta intervención. No se cambiaron de rama ni se descartaron esos cambios.
Los cambios UI-05 se limitaron a los ajustes de accesibilidad descritos, la
suite/evidencia de auditoría y esta documentación.
