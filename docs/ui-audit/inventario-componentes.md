# Inventario de componentes visuales — before

## Conservar

| Componente | Ubicación | Motivo |
|---|---|---|
| Header | `src/components/layouts/Header.jsx` | Navegación funcional, tema y sesión |
| Footer | `src/components/layouts/Footer.jsx` | Reutilizable, pero requiere corrección de contraste |
| Tabs, Card, Button, Input | `src/components/shared/ui/index.jsx` | Base compartida válida |
| ThemeProvider | `src/theme/ThemeProvider.jsx` | Implementa claro/oscuro/sistema |
| ErrorBoundary / EmptyState / LoadingState | `src/components/shared/ApiState.jsx` | Estados funcionales reutilizables |
| Auth forms | `src/components/auth/views/Login.jsx`, `Register.jsx` | Lógica real; necesita semántica/visual |

## Refactorizar

| Componente | Problema | Acción |
|---|---|---|
| Home | Combina historias, composer y feed con CSS local antiguo | Separar secciones y grid; conservar datos |
| Foro | Controlador grande con estilos inline y layout móvil roto | Extraer composer, tabs y cards |
| Ajustes | Sidebar + panel sin límite robusto | Layout compartido y navegación móvil |
| Datos personales | Composición mínima sin main visual consistente | Unificar patrón de dos columnas |
| Mensajes | Layout fijo con overflow potencial | Contenedor viewport y scroll interno |
| Perfil/EditarPerfil | CSS heredado con muchos selectores específicos | Unificar cabecera, tabs y panel |
| Marketplace | Cards y filtros conviven con CSS heredado | Usar grid/card compartido |
| Producto detalle | Galería/acciones con z-index y breakpoints locales | Estabilizar galería y sticky actions |
| Admin | Páginas simples sin sidebar visual independiente | Crear shell admin reutilizable |

## Fusionar

- `PageFrame`, `Header`, `Footer` y layouts por feature se solapan parcialmente.
- `MisProductos`, `Tiendas` y `Admin` pueden compartir tabla/paginación/filtros.
- `Comunidad`, `Tiendas` y Perfil pueden compartir cards de entidad.
- `Notificaciones`, `MisReportes` y Datos personales pueden compartir estados de lista vacía.

## Eliminar solo después de reemplazar

- `productosDemo.js`: aún alimenta perfil/vendedor.
- `carritoDemo.js`: carrito local sin checkout real.
- `mensajesDemo.js`: debe desaparecer de la vista principal una vez se confirme que no se importa.
- `Plantilla.jsx`: no es una página objetivo; reemplazar enlaces por páginas reales o estados deshabilitados.
- `/vendedor`: sustituir por perfil público real.

## Sistemas de estilo coexistentes

- `App.css`: base histórica con estilos globales y header.
- `design-system/tokens.css` y `design-system.css`: sistema nuevo.
- CSS por feature: foro, perfil, producto, auth, comunidad, tienda, mensajes, ajustes.
- Estilos JSX inline en Foro, Perfil, Editar, MisReportes y componentes shared.
- Selectores hardcodeados en hex/rgb y tamaños sin tokens.
