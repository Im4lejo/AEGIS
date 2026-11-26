# Conflictos de tema y estilos

## Arquitectura actual

- Tokens: [`tokens.css`](../../aegis-web/AEGIS-REACT/src/design-system/tokens.css), con paletas claro/oscuro, tipografía, spacing, radios, sombras y z-index.
- Tema: [`ThemeProvider.jsx`](../../aegis-web/AEGIS-REACT/src/theme/ThemeProvider.jsx) aplica `data-theme` según preferencia/sistema.
- Capa global: [`index.css`](../../aegis-web/AEGIS-REACT/src/index.css), [`App.css`](../../aegis-web/AEGIS-REACT/src/App.css) y [`design-system.css`](../../aegis-web/AEGIS-REACT/src/design-system/design-system.css).
- CSS por feature: importado de forma global desde componentes.
- Librería visual: componentes compartidos en `src/components/shared/ui`; no se usa Tailwind, CSS Modules ni CSS-in-JS.

## Hallazgos

| Gravedad | Archivo / causa comprobada | Impacto | Función a conservar | Solución propuesta | Prueba necesaria |
|---|---|---|---|---|---|
| Alta | `index.css` y `design-system.css` declaran root/body/fuente por separado | La importación decide qué baseline gana; valores directos pueden sobrescribir tokens | Tipografía y canvas actuales | Un único baseline canónico; `index.css` debe limitarse a bootstrap/reset o importar orden explícito | Baseline claro/oscuro, login, home, formularios |
| Alta | [`carrito.css`](../../aegis-web/AEGIS-REACT/src/components/carrito/css/carrito.css), [`notificaciones.css`](../../aegis-web/AEGIS-REACT/src/components/notificaciones/css/notificaciones.css), [`busqueda.css`](../../aegis-web/AEGIS-REACT/src/components/busqueda/css/busqueda.css) contienen superficies/colores claros literales | Temas oscuros pueden mostrar paneles aislados con bajo contraste o fondo claro no intencional | Identidad feature y legibilidad | Migrar superficies/texto/bordes semánticos a tokens; documentar acentos intencionales | Carrito, notificaciones y búsqueda en ambos temas |
| Alta | `Publicar Producto`, Foro y layout comparten reglas globales para clases genéricas (`main-content`, `section`, `button`, `.active`) | Los selectors de features no están encapsulados; orden de importación puede cambiar pantallas | Diseño por feature existente | Encapsular bajo roots estables y reducir selector global | Todas las rutas CSS importadas, no solo la editada |
| Media | Paletas literales en `App.css` y feature CSS | Indigo/violeta/azul/negro conviven sin semántica | Acentos contextuales | Centralizar pares semánticos y dejar solo acentos documentados | Token contrast tests + visual regression |
| Media | Breakpoints literales: 480, 520, 700, 900 px entre App, design-system y features | Umbrales superpuestos y cambios de layout inconsistentes | Comportamiento en 360/768/1280/1440 | Adoptar escala de breakpoints única sin rediseñar layouts | Capturas en 360/768/1280/1440 |
| Media | `!important` en reglas globales/responsive | Cascada difícil de trazar; feature override puede crecer | Ocultación responsive y overrides necesarios | Retirar solo con selector scoped equivalente | Buscar reglas `!important`, validar las superficies afectadas |
| Media | Z-index definidos por feature y token | Menús, carrito, modales y sidebar pueden competir | Menús y diálogos sobre contenido | Escala de `--z-*` documentada y usada | Abrir drawer, carrito, toast, modal y lightbox simultáneamente cuando sea posible |
| Baja | Inline styles en `Perfil`, `EditarPerfil` y `MisReportes` | Layout estático mezcla CSS y JSX; fondos dinámicos son razonables inline | Imágenes dinámicas y densidad actual | Mantener inline solo para URLs/data variables; mover layout estático a CSS | Tests visuales de perfil/admin |
| Media | Iconos Unicode y SVG locales no usan paleta explícita única | Color actual depende del contexto/CSS | Iconografía actual | Asegurar currentColor y contraste | Axe y modo oscuro |

## Variables y temas

El sistema de tokens ya define un contrato suficiente (`--color-canvas`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-action`, etc.). El conflicto no es ausencia de tokens sino coexistencia con valores literales.

No se debe crear una segunda librería o framework. La corrección mínima compatible es:

1. Definir orden de importación canónico.
2. Retirar duplicación root/body.
3. Migrar colores semánticos compartidos.
4. Documentar acentos feature intencionales.
5. Encapsular features.
6. Mantener fondos/imágenes dinámicas inline solo cuando los valores vienen de datos.

## Conflictos de especificidad a medir

Antes de modificar reglas, capturar:

- header/drawer/rail/bottom nav juntos;
- composer de foro abierto y lightbox;
- carrito y notificaciones abiertos;
- perfil/editar perfil;
- crear producto y preview;
- tablas admin;
- diálogos de producto/mensajes.

## Pruebas

```text
npm run lint
npm run test:ui
npm run test:visual
```

Agregar comparaciones por tema, screenshots, Axe y métricas de overflow. No considerar completo un cambio que solo pase la suite del feature modificado.

