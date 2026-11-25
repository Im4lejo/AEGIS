# Sistema de diseño web AEGIS

## Alcance y fuentes

React y CSS existentes; no se añade una biblioteca de UI. La fuente de tokens es
[`tokens.css`](../aegis-web/AEGIS-REACT/src/design-system/tokens.css), con
reglas globales en [`design-system.css`](../aegis-web/AEGIS-REACT/src/design-system/design-system.css).
Los componentes están en [`shared/ui`](../aegis-web/AEGIS-REACT/src/components/shared/ui/).
Se conserva el azul de marca del producto, en lugar de sustituirlo por la
paleta inicial propuesta. La adopción en CSS de funcionalidades es gradual.

## Temas y tokens

`ThemeProvider` aplica `data-theme="light"` o `"dark"` en `html`; el selector
ofrece sistema, claro y oscuro y guarda la preferencia localmente. Los tokens
mantienen sus nombres existentes para no romper consumidores:

| Rol semántico | Token | Claro | Oscuro |
|---|---|---|---|
| Fondo | `--color-canvas` | #f3f5f8 | #101927 |
| Superficie | `--color-surface` | #ffffff | #1a2738 |
| Superficie tenue | `--color-surface-muted` | #e9edf3 | #26364a |
| Texto | `--color-text` | #142338 | #f0f4f8 |
| Texto secundario | `--color-text-muted` | #4b5c72 | #c1ccda |
| Borde | `--color-border` / `--color-border-strong` | #d3dbe5 / #9aa9bb | #394b60 / #64788f |
| Acción | `--color-action` / `--color-action-text` | #173a60 / #ffffff | #b7d5ff / #10243b |
| Peligro | `--color-danger` / `--color-danger-action-text` | #a3211a / #ffffff | #ff9a91 / #3b1111 |
| Éxito | `--color-success-text` / `--color-success-soft` | #14532d / #e7f6ec | #c5f2d0 / #1d3b2b |
| Aviso | `--color-warning-text` / `--color-warning-soft` | #6f4a00 / #fff3d6 | #ffe0a0 / #4a3b1e |
| Error tenue | `--color-danger` / `--color-danger-soft` | #a3211a / #ffebe9 | #ff9a91 / #4a2529 |
| Información | `--color-info-text` / `--color-info-soft` | #1d477f / #e8f1ff | #c7e0ff / #203851 |
| Foco | `--color-focus` | #7a3fe0 | #d2afff |
| Velo | `--color-overlay` | rgb(12 23 38 / 58%) | rgb(0 0 0 / 72%) |
| Cabecera y pie | `--color-chrome` / `--color-chrome-muted` | #0b2c4e / #d1d5db | #101f32 / #d1d5db |

Usar colores semánticos únicamente con texto, iconos o estructura que expliquen
el estado; el color nunca es la única indicación. Usar `--color-action-hover`
y `--color-danger-hover` para interacción y las variantes `*-soft` para
mensajes. No usar texto claro de acción primaria sobre el fondo de peligro:
el tema oscuro necesita `--color-danger-action-text`.

Espaciado `--space-1` a `--space-6`: 4, 8, 12, 16, 24 y 32 px.
Radios: pequeño 6 px, controles 10 px, tarjetas 16 px y píldora 999 px.
Elevaciones: `--shadow-card`, `--shadow-raised`, `--shadow-overlay`.
Capas existentes: `--z-menu` 100, `--z-overlay` 1200, `--z-toast` 1400.
No incrementar capas indiscriminadamente; revisar primero el contexto de apilado.

## Criterios de interfaz

- Tipografía principal: Inter cuando está disponible, seguida de fuentes de
  sistema; la marca conserva Orbitron. Escala existente: 12, 14, 16 y 20 px;
  títulos de página adaptables, un `h1` y jerarquía sucesiva. Cuerpo: 1.5;
  títulos: 1.2; texto largo preferiblemente hasta `--content-readable` (70ch).
- Grillas con columnas `minmax(0, 1fr)` y contenedores sin desbordamiento;
  apilar en móvil. Separación con tokens, densidad coherente y áreas táctiles
  apropiadas. La guía usa una grilla adaptable sin breakpoints adicionales.
- `Button`: acción primaria, secundaria, discreta o peligrosa; etiqueta
  explícita, foco visible, hover, activo y disabled. Para carga, deshabilitar y
  cambiar la etiqueta a «Procesando…» cuando corresponda.
- `Input`, `Select`, `Textarea`: etiqueta asociada, ayuda opcional y mensaje
  textual de error vinculado por `aria-describedby`; `aria-invalid` marca error.
  Los placeholders no sustituyen etiquetas.
- `Badge`: texto semántico; `Card`: superficie y borde comunes; `Avatar`:
  imagen identificada o iniciales con nombre accesible.
- `Modal`/`Drawer`: título, foco inicial, ciclo de foco, Escape y restauración
  del foco. `Tabs`: selección y flechas de teclado. `Dropdown`: botón con
  estado expandido, navegación con flechas y Escape.
- `EmptyState`, `LoadingState` y `Toast` anuncian texto; `Skeleton` es
  decorativo y debe acompañarse de texto de carga. El toast puede cerrarse.
- Navegación con enlaces reales, estado actual y foco visible; enlaces con
  texto reconocible y hover distinguible. Tooltips, cuando se incorporen,
  deben activarse por foco y puntero y no ser la única fuente de información;
  no existe un componente compartido de tooltip en esta intervención.
- El foco global usa contorno de 3 px y separación de 3 px. El movimiento se
  reduce según `prefers-reduced-motion`. No se declara conformidad WCAG global
  sin revisar todos los estados, pantallas y tecnologías de asistencia.

## Validación UI-01

Con Vite en desarrollo, abrir `/#/styleguide`. La ruta y su módulo se excluyen
del build de producción mediante `import.meta.env.DEV`. La guía usa componentes
reales y permite probar tema, diálogo, pestañas, menú y toast.

Capturas de referencia de páginas en [`before/`](ui-audit/before/) y guía
previa a la normalización en `before/styleguide-{light|dark}-{360|768|1280|1440}.png`.
El styleguide no existía en UI-00: esas imágenes se hicieron después de crear
la guía, pero antes de modificar los estilos compartidos. Capturas posteriores
y resultados Axe en [`after/ui-01/`](ui-audit/after/ui-01/). Ejecutar desde el
frontend con Vite activo: `node scripts/ui-01-capture.cjs`. Captura inicio,
marketplace, login y guía a 360×800, 768×1024, 1280×800 y 1440×900, claro y
oscuro. Se observaron capturas a móvil y escritorio; 32/32 no presentan
desbordamiento horizontal y Axe no informó violaciones en la guía.

Se calcularon en navegador las relaciones de contraste de texto/superficie,
texto secundario/superficie y fondo, acción normal y hover, peligro normal y
hover, error, éxito, aviso, información y texto del pie: mínimo 6.26:1 claro y
6.48:1 oscuro en esos pares. Foco/superficie: 5.81:1 claro y 8.13:1 oscuro.
Estos cálculos no cubren todos los fondos, estados, bordes o pantallas.
Se probaron diálogo/Escape, pestañas, menú y toast en navegador.

La API local no respondió durante las capturas posteriores: las páginas se
registraron en su estado real sin simular respuestas. Por ello no son una
comparación controlada de datos frente a UI-00 y no se verificaron operaciones
autenticadas ni integración completa. El marketplace permaneció cargando; se
observó que las claves de solicitud y respuesta en `Index.jsx` ordenan los
filtros de forma distinta. Es un problema funcional previo, no corregido en
esta intervención visual.

## Pendientes heredados

- UI-01 registró incidencias automáticas de contraste, nombre accesible del
  carrito y semántica del login móvil. En UI-05 se corrigieron el nombre del
  carrito, el target de búsqueda, el logo móvil y los contrastes señalados;
  44 escaneos Axe en las rutas/temas/tamaños indicados no encontraron
  violaciones. No se cubren todas las páginas ni todos los estados.
- Los estilos por funcionalidad, contrastes de otros estados y temas,
  tamaños de toque, tooltips y controles heredados requieren revisión por
  pantalla. No se han migrado masivamente para evitar regresiones.
- Las tablas del panel de productos propios y Usuarios admin permiten
  desplazamiento horizontal, pero a 360 px parte de las acciones queda fuera
  del primer encuadre. Falta mejorar la señalización y probar su scroll por
  teclado; la matriz UI-05 enlaza capturas.
- El foro y Ajustes ya se midieron en la matriz UI-05 a 360, 768, 1280 y
  1440 px, sin overflow horizontal en las capturas automatizadas. La
  integración autenticada aún requiere validar con una API operativa.
- La revalidación posterior de layout y sus límites se documentan en
  [layouts.md](layouts.md); los estados privados se comprobaron con fixtures.
- `npm run lint` sigue fallando con 11 errores y 8 advertencias preexistentes
  en archivos fuera de los cambios UI-05. El lint focalizado de los archivos
  JavaScript UI-05 pasa.

## Validación UI-05

Playwright en Chromium generó 190 capturas con datos de fixture, en tema claro
y oscuro, a 360, 768, 1280 y 1440 px. La matriz registra cero desbordamientos.
Se hicieron 44 escaneos Axe (11 superficies, dos anchos y dos temas) sin
violaciones automáticas; Axe dejó 56 resultados `incomplete`, que requieren
revisión manual y no se consideran aprobados por el escaneo.

Se verificaron ratios de contraste de los tokens semánticos seleccionados:
el mínimo fue 5.32:1 en claro y 8.07:1 en oscuro, incluidos los pares de foco
con superficie y canvas. Esto no certifica el contraste de todos los estilos
heredados. La evidencia reproducible, las rutas y las limitaciones están en
[reporte-final.md](ui-audit/reporte-final.md) y
[after/ui-05/](ui-audit/after/ui-05/).

La comparación con `toHaveScreenshot()` cubrió Marketplace, detalle y
conversación frente a las capturas UI-04, con actualización automática
deshabilitada. No se usó UI-00 como baseline pixel a pixel: sus capturas no
comparten los fixtures y el backend local no estuvo disponible.
