# UI-05 — Checklist de regresión

## Navegación, rutas e interacción

- [x] Invitado: Inicio, Login, Foro, Comunidades, Marketplace, detalle,
  Tiendas, Puntos físicos y estado no disponible de Guardados.
- [x] Usuario autenticado con producto propio: publicar en Foro, Perfil,
  Mensajes, productos propios, Ajustes y Seguridad.
- [x] Moderador de comunidad: herramientas/eventos visibles según membresía.
- [x] Admin: dashboard, usuarios, reportes, auditoría y configuración.
- [x] Usuario sin permiso: acceso restringido a Administración.
- [x] Login con error de credenciales y retorno a una ruta privada con fixture.
- [x] Envío de publicación comprobado en el request multipart; título y cuerpo
  presentes, sin escribir a la API o base de datos real.
- [x] Diálogo de oferta, diálogo de historia y estados loading, vacío y error.
- [x] Navegación móvil operada con teclado: Enter abre, Tab mantiene el foco
  dentro del diálogo, Escape cierra y el foco vuelve al botón.
- [x] Mensaje de chat y búsqueda/publicación de Marketplace mantienen la
  evidencia de interacciones con fixtures documentada en UI-04.
- [ ] Validar publicación, permisos, mensajes y persistencia con backend real.

## Responsive y visual

- [x] Capturas Chromium a 360, 768, 1280 y 1440 px, claro y oscuro.
- [x] 176 capturas de la matriz de rutas sin overflow horizontal medido.
- [x] Tablas de Mis productos y Administración a 360 px con región rotulada,
  hint móvil y desplazamiento comprobado con flechas izquierda/derecha.
- [x] Acciones y selectores de administración alcanzables tras scroll; los
  controles de rol/estado incluyen nombres accesibles por cuenta.
- [x] 190 PNG generados en total; se inspeccionaron Inicio móvil, Login,
  Marketplace oscuro y navegación móvil abierta.
- [x] Tres comparaciones `toHaveScreenshot()` contra UI-04; no se habilitó
  actualización automática de snapshots.
- [ ] La comparación con UI-00 no es pixel a pixel: cambian fixtures y
  disponibilidad de API.

## Accesibilidad

- [x] 52 escaneos Axe en 13 rutas/superficies, 360 y 1280 px, claro y oscuro;
  cero violaciones automáticas en la corrida final.
- [x] Ratios de tokens seleccionados >= 4.5:1 para texto y >= 3:1 para foco;
  detalle en [`token-contrast.json`](./token-contrast.json).
- [x] Contraste de enlaces secundarios de Login corregido a `#4b5c72`.
- [x] Carrito con nombre accesible que incluye el conteo; icono y badge visual
  marcados como decorativos.
- [x] Botón de búsqueda y control Mostrar/Ocultar contraseña cumplen 24×24 px
  como mínimo de WCAG 2.2 AA.
- [x] Logo móvil con texto alternativo válido; menú móvil verificado por
  teclado y restauración del foco.
- [ ] Axe dejó 64 resultados `incomplete`: requieren inspección manual; no son
  violaciones confirmadas ni se consideran aprobados.
- [ ] Falta revisión completa con lector de pantalla y contraste de cada
  estilo local/estado interactivo.

## Build y pruebas

- [x] `npm test`: 24 pruebas Vitest y 8 pruebas Node pasan.
- [x] `npm run test:visual`: cinco pruebas Playwright pasan; snapshots no se
  actualizaron.
- [x] `npm run build`: build Vite de producción pasa.
- [ ] Lint focalizado de las vistas de tablas y el spec: 2 errores en
  Mis productos (`meta` no usado y `set-state-in-effect`) y 2 advertencias
  de dependencias de hooks.
- [ ] `npm run lint` global conserva 11 errores y 8 advertencias en otros
  archivos del proyecto; no se amplió el alcance para corregirlos.
- [ ] No hay script de typecheck configurado.
- [x] `php artisan test` pasa 127 pruebas/635 assertions cuando se configura,
  solo para ese comando, `FRONTEND_URL=http://localhost:5173`.
- [ ] Con el `.env` local actual (`http://127.0.0.1:5173`), una prueba espera
  `localhost` y falla por discrepancia de hostname.
- [ ] Backend HTTP real no disponible en `127.0.0.1:8000`; las pruebas web
  usan fixtures y no comprueban integración/persistencia.
