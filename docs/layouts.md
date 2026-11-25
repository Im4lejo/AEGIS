# UI-02: layouts y navegación web

## Alcance e inventario

La rama de trabajo es `PersonalizacionPerfil`; no se encontró el tag `6.0.0`
local ni remoto al iniciar. Había cambios sin confirmar anteriores a UI-02.
No se cambió de rama, no se creó ningún commit y no se modificó la base de datos.

La auditoría inicial está en [UI-00](ui-audit/diagnostico.md); sus capturas
están en [before](ui-audit/before/) y los tokens y antecedentes de UI-01 en
[design-system.md](design-system.md). Antes, el header insertaba raíles fijos
y reglas globales desplazaban los elementos `main` mediante márgenes. Eso
acoplaba la posición del contenido al tipo de página y al ancho de pantalla.
El foro y mensajes, además, tenían distribuciones propias; `PageFrame` servía
varias páginas administrativas y de cuenta.

## Composición actual

- `Header` conserva búsqueda, perfil, notificaciones, carrito, selector de tema
  y accesos de catálogo. El header participa en el flujo normal: no es sticky.
- `WorkspaceChrome` contiene el rail principal, la sección de contenido y,
  solo en Inicio y Comunidades cuando hay espacio, una columna contextual.
  La misma lista de destinos alimenta el rail y el menú principal móvil.
- `PageFrame` integra esta composición para las páginas que ya lo utilizaban;
  las demás conservan sus componentes y contenido dentro del mismo shell.
  Los estados de sesión, acceso restringido y los errores/cargas de Ajustes,
  Perfil y Detalle también conservan navegación.
- Marketplace mantiene su catálogo propio. El foro conserva sus filtros y
  sidebar por sección; sus pestañas pueden desplazarse horizontalmente dentro
  de su contenedor y las acciones de las publicaciones se envuelven.
- Mensajes conserva el scroll interno de conversación y lista. El shell ocupa
  la altura disponible y reserva espacio para la barra inferior móvil.
- El footer sigue fuera de la grilla. El acceso a Mensajes duplicado en el
  navbar de escritorio se eliminó: permanece en el rail y en las acciones del
  header cuando hay espacio.

## Breakpoints y capas

| Ancho | Comportamiento |
| --- | --- |
| Hasta 700 px | Una columna, rail oculto, barra inferior fija y espacio inferior reservado; filtros del foro en drawer. |
| 701–1199 px | Rail de 64 px con etiquetas accesibles visualmente ocultas; contenido flexible. |
| Desde 1200 px | Rail de 224 px; Inicio y Comunidades agregan contexto de 240 px. Ancho máximo del shell: 1440 px. |
| Hasta 900 px | Header compacto y menú principal a pantalla completa. |

El documento desplaza normalmente; los raíles tienen `position: sticky` y
scroll propio si no caben. La barra inferior usa la capa 50; el overlay del foro
usa 1001 y el menú principal existente 1000. No se ocultó el desbordamiento
horizontal globalmente. El menú principal y el drawer del foro bloquean el
scroll del body mientras están abiertos, capturan Tab/Shift+Tab, cierran con
Escape y devuelven el foco al control que los abrió. La comprobación fue con
teclado en Chromium, no sustituye pruebas con lectores de pantalla.

## Navegación y permisos

Se mantienen las rutas existentes de Inicio, Marketplace, Comunidades, Foro,
Mensajes, Perfil, Ajustes y Puntos verificados. Publicar permanece en el header,
menú y navegación inferior según el espacio. Guardados figura como no disponible:
no existe una página de listado equivalente. Administración solo se ofrece si
el estado existente indica `isAdmin`; la restricción de ruta sigue en `App`.
No se alteraron los contratos API ni la autorización del servidor.

## Evidencia y comparación

Las [capturas UI-02](ui-audit/after/ui-02/) y
[mediciones](ui-audit/after/ui-02/results.json) se generaron con Chromium y
el script [ui-02-capture.cjs](../aegis-web/AEGIS-REACT/scripts/ui-02-capture.cjs).
Para reproducirlo, con Vite disponible y las dependencias instaladas:

```powershell
cd aegis-web\AEGIS-REACT
node scripts\ui-02-capture.cjs
```

Se registraron 63 capturas a 360×800, 768×1024, 1280×800 y 1440×900. Los
archivos `real-*` muestran la aplicación y respuestas públicas reales, incluida
la redirección de invitado; la API local volvió a responder durante esta fase
y los datos públicos visibles estaban identificados como DEMO. Los archivos
`fixture-*` usan sesiones y respuestas sintéticas interceptadas en contextos
aislados, incluyendo un PATCH simulado de lectura de mensajes. No demuestran
integración autenticada real ni persistencia en el servidor. Las peticiones
fixture no previstas se bloquean y registran, no se convierten en éxito.

Frente a [UI-00](ui-audit/before/) y [UI-01](ui-audit/after/ui-01/), se
observan un rail dentro de la grilla, navegación inferior y menú de pantalla
completa, y el foro ya no desborda al cargar publicaciones. Las capturas previas
y posteriores no usan siempre los mismos datos ni disponibilidad de API, por
lo que la comparación es visual, no una comparación de píxeles controlada.

## Checklist de regresión

- [x] Build y pruebas existentes; pruebas focalizadas del rail, roles y menú.
- [x] Inicio, Marketplace, Foro y Comunidades públicos y redirección de
  Mensajes para invitados a los cuatro anchos, sin overflow horizontal medido.
- [x] Inicio vacío/con datos, Mensajes vacío/con conversación, Perfil, Ajustes,
  Datos personales y Administración con fixtures a los cuatro anchos, sin
  overflow horizontal medido; chat y compositor visibles y controles de al
  menos 44 px.
- [x] Rol normal sin enlace de Administración y acceso restringido; rol admin
  con enlace activo, incluidos menú móvil y estado restringido con navegación.
- [x] Apertura de menú principal, ciclo de foco, Escape y restauración de foco
  y scroll; apertura y Escape del drawer del foro a 360 px en temas claro y
  oscuro.
- [ ] Validar operaciones autenticadas reales y persistencia de cambios,
  navegación completa de todas las rutas y tecnologías de asistencia.
- [ ] Resolver el fallo previo del marketplace que puede quedar en
  «Cargando productos…» por claves de petición inconsistentes; no se modificó.
- [ ] Revisar estilos heredados por sección, en particular el drawer del foro
  que conserva fondo claro en tema oscuro, y las incidencias de contraste y
  semántica documentadas en UI-01. No se declara conformidad WCAG completa.

El lint focalizado pasó; el lint global tenía errores preexistentes documentados
en UI-01 y no se corrigieron como parte de esta intervención.
