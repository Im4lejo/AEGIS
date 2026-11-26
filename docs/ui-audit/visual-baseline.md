# Baseline visual UI-FIX-01

## Método

Captura realizada antes de corregir diseño o navegación:

- Aplicación React/Vite en `http://127.0.0.1:5173`.
- Playwright Chromium.
- Viewports: 360×800, 768×1024, 1280×800 y 1440×900.
- Temas: `light` y `dark`.
- Personas: visitante, comprador, vendedor, owner de punto, moderador comunitario y administrador.
- Fixtures de API aislados; no se modificaron datos reales durante la captura.
- La suite original se parametrizó con `UI_AUDIT_OUTPUT` para conservar el histórico en `after/ui-05` y no sobrescribirlo.

Artefactos:

- [`route-results.json`](./before/ui-fix-01/route-results.json)
- [`accessibility.json`](./before/ui-fix-01/accessibility.json)
- [`api-console-results.json`](./before/ui-fix-01/api-console-results.json)
- [`capturas PNG`](./before/ui-fix-01/)

## Resultado cuantitativo

- 192 capturas de matriz: 24 combinaciones ruta/persona × 2 temas × 4 viewports.
- 14 capturas adicionales de estados/interacciones en la ejecución inicial, para 206 PNG disponibles.
- 0 desbordamientos horizontales detectados por `scrollWidth > clientWidth`.
- 0 errores de JavaScript/pageerror.
- 0 errores de consola capturados.
- 52 scans Axe; 0 violaciones automáticas críticas/serias bajo los fixtures.
- Axe dejó checks “incomplete” de contraste/ARIA en algunos componentes; requieren inspección manual, no deben contarse como aprobados.

## Cobertura

| Persona | Rutas capturadas |
|---|---|
| Visitante | Home, login, foro, comunidades, marketplace, detalle, tiendas, puntos, guardados no disponible |
| Comprador | Negociación |
| Vendedor | Crear producto, mensajes, perfil, mis productos, ajustes, seguridad, admin denegado |
| Owner | Puntos físicos con identidad owner |
| Moderador comunitario | Comunidad moderada/herramientas |
| Administrador | Dashboard, usuarios, reportes, auditoría, configuración |

Cada fila fue capturada en claro/oscuro y cuatro anchos.

## Capturas representativas

- Visitante, home móvil claro: [`home-guest-light-360.png`](./before/ui-fix-01/home-guest-light-360.png)
- Visitante, home desktop oscuro: [`home-guest-dark-1440.png`](./before/ui-fix-01/home-guest-dark-1440.png)
- Vendedor, crear producto móvil: [`ad-create-seller-light-360.png`](./before/ui-fix-01/ad-create-seller-light-360.png)
- Vendedor, crear producto desktop: [`ad-create-seller-dark-1440.png`](./before/ui-fix-01/ad-create-seller-dark-1440.png)
- Foro visitante móvil: [`forum-guest-light-360.png`](./before/ui-fix-01/forum-guest-light-360.png)
- Perfil vendedor: [`profile-seller-light-360.png`](./before/ui-fix-01/profile-seller-light-360.png)
- Punto owner: [`owner-points-point-owner-light-360.png`](./before/ui-fix-01/owner-points-point-owner-light-360.png)
- Negociación comprador: [`buyer-negotiations-buyer-dark-360.png`](./before/ui-fix-01/buyer-negotiations-buyer-dark-360.png)
- Comunidad moderador: [`moderated-community-community-moderator-light-768.png`](./before/ui-fix-01/moderated-community-community-moderator-light-768.png)
- Administración: [`admin-dashboard-admin-dark-1440.png`](./before/ui-fix-01/admin-dashboard-admin-dark-1440.png)
- Compositor abierto: [`forum-composer-open-usuario-light-360.png`](./before/ui-fix-01/forum-composer-open-usuario-light-360.png)
- Modal oferta: [`product-offer-dialog-usuario-light-360.png`](./before/ui-fix-01/product-offer-dialog-usuario-light-360.png)

## Problemas visuales observados

| Gravedad | Evidencia | Causa comprobada | Función a conservar | Corrección futura / prueba |
|---|---|---|---|---|
| Alta | Crear producto presenta dropzone y carga heredada | Tres sistemas de upload se montan en una pantalla | Imagen principal, extras, preview, responsive | Una fuente de datos y un uploader; probar preview/payload |
| Alta | Foro puede repetir título dentro del cuerpo | Título ocupa primera línea de `contenido` | Compositor compacto y publicación completa | Estados separados; comparar feed/detalle/API |
| Alta | Menú móvil contiene navegación duplicada | `Navbar` y `WorkspacePrimaryNav` se montan juntos | Acceso completo desde móvil | Un bloque visible; contar destinos únicos |
| Alta | Perfil de terceros no es navegable | No existe ruta React compatible con API pública | Ver autor/vendedor/comprador/comentario | Ruta pública con target id; pruebas por rol |
| Media | Superficies globales con paletas independientes | CSS features usa colores fijos y tokens parciales | Identidad visual y tema oscuro | Migración semántica gradual; screenshots por tema |
| Media | Owner no observa gestión propia específica | Componentes de dashboard/configuración no están registrados | El owner debe operar sus puntos | Cablear solo rutas/API completas y capturar antes/después |
| Informativa | Controles “próximamente” aparecen deshabilitados | No existe contrato funcional completo | No prometer checkout/guardados no operativos | Mantener estado claro o implementar en su incremento |

## Limitaciones

- La baseline usa fixtures controlados para roles y rutas; no demuestra autorización real del servidor.
- El cero de overflow pertenece a las combinaciones capturadas y al estado fijo de fixtures; no cubre contenido extremadamente largo ni archivos media reales.
- “0 violaciones Axe” no reemplaza revisión manual: existen resultados incompletos y reglas visuales no detectadas.
- No se probaron pantallas legacy no registradas (`Dashboard`, `Configuracion`, `Qr`) porque no forman parte del árbol de rutas React actual. Se registran como deuda/alcance roto en la matriz de navegación.

## Comando reproducible

```bash
cd aegis-web/AEGIS-REACT
UI_AUDIT_OUTPUT=../../../docs/ui-audit/before/ui-fix-01 npx playwright test --config playwright.config.cjs
```

En Windows PowerShell:

```powershell
$env:UI_AUDIT_OUTPUT="../../../docs/ui-audit/before/ui-fix-01"
npx playwright test --config playwright.config.cjs
```

La validación fue completada: 5 pruebas Playwright pasaron; luego la matriz se amplió a buyer/owner y su prueba específica también pasó.

