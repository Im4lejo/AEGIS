# Diagnóstico forense de interfaz — before

## Alcance y método

Auditoría realizada sobre el React real en `aegis-web/AEGIS-REACT`, con Vite en `127.0.0.1:5173`, API Laravel en `127.0.0.1:8000`, Playwright Chromium y Axe.

Capturas: 104 PNG, además de `layout-metrics.jsonl` y `axe-results.jsonl`.
Viewports: 360×800, 768×1024, 1280×800 y 1440×900.
Temas: claro y oscuro.
Sesiones: pública y autenticada con cuenta demo.

No se modificaron estilos, componentes, migraciones ni datos.

## Hallazgos principales

| Severidad | Ruta / evidencia | Problema | Causa técnica | Archivo responsable | Plan |
|---|---|---|---|---|---|
| P0 | `/foro` a 360 px | Scroll horizontal: scrollWidth 386 frente a 360 px | Layout móvil heredado y controles/rail que exceden el contenedor | `src/components/foro/css/foro.css`, `src/design-system/design-system.css` | Primero retirar reglas duplicadas y contener rail/composer dentro de 100% |
| P0 | `/ajustes` y `/datos-personales` a 1440 | Scroll horizontal; ajustes 1445/1280, datos 1484/1440 | Dos columnas y paneles laterales sin límite `min-width:0` | `src/components/ajustes/css/ajustes.css`, `src/components/ajustes/views/Ajustes.jsx`, `src/components/ajustes/views/DatosPersonales.jsx` | Medir columnas y grid, aplicar `min-width:0`, convertir a stack antes del desborde |
| P0 | `/login` | Lenguaje mixto, falta h1 real y contraste insuficiente | Vista cuenta solo con `h2` y CSS auth hardcodeado | `src/components/auth/views/Login.jsx`, `src/components/auth/css/auth.css` | Normalizar español/título h1 y reemplazar colores heredados por tokens |
| P0 | Inicio / marketplace / producto | Enlaces/cards exponen nombres accesibles que no contienen el texto visible completo | `aria-label` reemplaza texto visible en cards y carro | `src/components/shared/ui/index.jsx`, `src/components/home/views/Home.jsx`, `src/components/layouts/Header.jsx` | Nombrar por contenido visible o añadir etiquetas no superpuestas |
| P0 | `/foro` público/anónimo | Compositor permite controles cuyo resultado necesita sesión sin estado claro | Compositor visible fuera de estado autenticado | `src/components/foro/views/Foro.jsx` | Bloquear y explicar acción o redirigir a login antes de mostrar composición |
| P1 | Inicio, marketplace, tiendas, comunidades | Footer usa texto gris sobre azul con contraste insuficiente | Colores hardcodeados en footer y App.css | `src/App.css`, `src/components/layouts/css/layouts.css` | Definir pares texto/fondo con tokens de contraste |
| P1 | Home | Texto “No hay historias” con contraste 4.42:1 | Color `#6b7280` sobre `#f3f5f8` | `src/components/home/css/home.css:...` | Elevar texto muted al menos 4.5:1 |
| P1 | Login, búsquedas, foro | Falta h1 o jerarquía heading incorrecta | Páginas usan h2/h3 como primera cabecera o footer h4 sin contexto | `src/components/auth/views/Login.jsx`, `src/components/shared/ApiState.jsx`, `src/App.jsx` | Un h1 semántico por pantalla y h2/h3 consecutivos |
| P1 | Header/footer | Logo duplicado con texto, imagen redundante | `alt="AEGIS"` junto al texto AEGIS | `src/components/layouts/Header.jsx`, `src/components/layouts/Footer.jsx` | Logo decorativo con alt vacío o vínculo con nombre único |
| P1 | Foro | Contenido fuera de landmarks | Bloques del compositor fuera de `<main>/<nav>/<aside>` semánticos | `src/components/foro/views/Foro.jsx` | Encerrar composición en `main`/`section` con labels |
| P1 | Ajustes | Layout de 360 px alarga mucho y separa categorías en grid; controles sin continuidad visual | Categorías y contenido usan reglas distintas a feature CSS | `src/components/ajustes/css/ajustes.css`, `src/components/ajustes/views/Ajustes.jsx` | Adoptar un layout único y una sola escala |
| P1 | Mensajes | Vista autenticada ocupa 800 px sin estado vacío claro en algunos viewports | Layout fijo/altura del chat sin estado visual | `src/components/mensajes/css/mensajes.css`, `src/components/mensajes/views/Mensajes.jsx` | `min-height`, vacío y mensajes con scroll interno |
| P1 | Marketplace | Dos sistemas de cards y columnas | Cards compartidos mezclados con estilos feature | `src/components/shared/ui/index.jsx`, `src/components/productos/css/index.css` | Unificar card y grid |
| P1 | Header | Estructura compacta distinta por breakpoint; menu/carrito/notificaciones se comprimen | Breakpoints locales y gaps hardcodeados | `src/App.css`, `src/components/layouts/css/layouts.css` | Extraer navbar responsive |
| P2 | Global | 1658 reglas coincidentes/CSS, sin métrica única de estilo | CSS por feature + `App.css` + design-system | `src/**/*.css` | Consolidar tokens y eliminar overrides |
| P2 | Global | 43 !important encontrados; varios para layout oculto | Cascada incrementada por pantalla | `src/App.css`, `src/design-system/design-system.css`, `src/components/**/*.css` | Eliminar !important fuera de reduced-motion |
| P2 | Foro/perfil | Estilos inline reales en JSX | Mejora rápida pero evita reutilización | `src/components/foro/views/Foro.jsx`, `src/components/perfil/views/Editar.jsx`, `src/components/perfil/views/Perfil.jsx` | Mover a clases CSS |
| P2 | Global | Z-index duplicado hasta 190/300/400/900/1000/1300 | Cada feature inventa un nuevo stacking order | `src/App.css`, feature CSS | Documentar escala del token `--z-*` |
| P2 | Global | Hardcodes de hex/rgb y fuentes no centralizadas | Sistema de tokens parcial convive con CSS directos | `src/components/**/*.css`, `src/App.css` | Migración gradual a tokens |

## Resultados cuantitativos

- 104/104 combinaciones capturadas como PNG o JSON.
- 10 reportes presentan desbordamiento horizontal.
- 360 px: 2 desbordamientos (vista Foro confirmada).
- 1440 px: 8 desbordamientos, concentrados en ajustes/datos personales y vistas relacionadas.
- Axe reportó 104 páginas/combinaciones.
- 92 reportes de contraste.
- 86 reportes de nombres visibles vs aria labels.
- 86 reportes de imágenes redundantes.
- 74 reportes de orden heading.
- 26 reportes de falta de h1.

## Evidencia visual

- Mobile Home: [public-light-360-home.png](../../../docs/ui-audit/before/public-light-360-home.png)
- Desktop Home: [public-light-1280-home.png](../../../docs/ui-audit/before/public-light-1280-home.png)
- Mobile Foro: [public-light-360-foro.png](../../../docs/ui-audit/before/public-light-360-foro.png)
- Mobile Ajustes: [auth-light-360-ajustes.png](../../../docs/ui-audit/before/auth-light-360-ajustes.png)
- Desktop Ajustes: [auth-light-1440-ajustes.png](../../../docs/ui-audit/before/auth-light-1440-ajustes.png)
- Mobile Login: [public-light-360-login.png](../../../docs/ui-audit/before/public-light-360-login.png)

## Regresiones superficiales observadas

- Botón Checkout muestra aviso real, no compra simulada.
- Foro público muestra compositor; algunos controles no deben funcionar sin sesión.
- Footer ofrece elementos “próximamente” como texto deshabilitado.
- `/vendedor` degradado a mensaje de identificador real.
- Home tiene tab Siguiendo deshabilitado con explicación.
- Home muestra datos de demostración marcados como DEMO en productos reales.
- Perfil puede no tener título h1 detectado en capturas autenticadas.
