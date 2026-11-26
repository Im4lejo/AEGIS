# Matriz de navegación y redundancias

## Alcance y conservación

- Rama auditada: `PersonalizacionPerfil`.
- El repositorio no contiene un TAG literal `6.0.0`; la referencia histórica existente es `v6.0.0`. No se movió ni eliminó ninguna referencia.
- Se conservaron los cambios posteriores a `v6.0.0` y los cambios preexistentes. La auditoría no ejecutó cambios destructivos de Git ni de base de datos.
- Fuente principal: [`App.jsx`](../../aegis-web/AEGIS-REACT/src/App.jsx), [`Header.jsx`](../../aegis-web/AEGIS-REACT/src/components/layouts/Header.jsx), [`WorkspaceChrome.jsx`](../../aegis-web/AEGIS-REACT/src/components/layouts/WorkspaceChrome.jsx) y [`Navbar.jsx`](../../aegis-web/AEGIS-REACT/src/components/layouts/Navbar.jsx).

## Inventario de rutas React

| Ruta | Acceso aplicado en React | Pantalla | Descubrimiento / observación |
|---|---|---|---|
| `/` | Público | Inicio | Entrada principal, alias de `/home`. |
| `/home` | Público | Inicio | Alias compatible; redirigir canónicamente sería una decisión de contrato futuro. |
| `/foro` | Lectura pública | Foro | Rail, menú móvil, header, footer y contexto. |
| `/comunidades` | Lectura pública | Comunidades | Rail, menú móvil y contexto. |
| `/tiendas` | Lectura pública | Tiendas | Ruta sin entrada principal visible. |
| `/negociacion` | API autenticada, **sin guard React** | Negociación | Ruta sin entrada principal visible; un visitante recibe una pantalla vacía/error API. |
| `/notificaciones` | API autenticada, **sin guard React** | Notificaciones | Solo accesible desde flujos/contextos, no desde navegación principal. |
| `/busqueda` | Público | Búsqueda | Header, búsqueda de Home y enlaces con query. |
| `/ajustes` | Autenticación esperada, **sin guard React** | Ajustes | Rail y agrupador de rutas secundarias. |
| `/mis-reportes` | Autenticado | Reportes propios | Sin entrada principal visible. |
| `/datos-personales` | Autenticado | Datos personales | Acceso desde ajustes. |
| `/publicacion?id=` | Público | Publicación | Requiere identificador; falla de forma deficiente si falta. |
| `/productos` | Público | Marketplace | Entrada principal. |
| `/novedades` | Público | Marketplace | Alias contextual; reutiliza el mismo componente y filtros. |
| `/productos/crear` | Autenticado | Crear producto | Rail móvil, header y CTA contextual. |
| `/productos/detalle?id=` | Público | Detalle | Requiere identificador; aparece desde cards. |
| `/productos/mis-productos` | Autenticado | Productos propios | Contextual, no primario global. |
| `/perfil` | Autenticado | Perfil propio | Menú, rail y footer móvil. No acepta perfil público ajeno. |
| `/perfil/editar` | Autenticado | Editar perfil | Desde perfil/ajustes. |
| `/vendedor` | Público degradado | Mensaje de identificador requerido | Importa `Vendedor` pero React renderiza un mensaje y nadie navega a esta ruta. |
| `/puntos-fisicos` | Público | Directorio | Header, rail y footer. |
| `/mensajes` | Autenticado | Mensajes | Header, rail y bottom nav, con acceso contextual desde producto/perfil. |
| `/configurar-encuentro` | Autenticado | Encuentro | Requiere producto/id según flujo; sin guard adicional de id. |
| `/admin` | Administrador | Dashboard | Rail solo para admin; React bloquea otros roles. |
| `/admin/reportes` | Administrador | Reportes | Contextual dentro de administración. |
| `/admin/usuarios` | Administrador | Usuarios | Contextual dentro de administración. |
| `/admin/auditoria` | Administrador | Auditoría | Contextual dentro de administración. |
| `/admin/configuracion` | Administrador | Configuración | Contextual dentro de administración. |
| `/login` | Público | Login | Menú de invitado y redirecciones. |
| `/forgot-password` | Público | Recuperación | Desde login. |
| `/reset-password` | Público | Restablecer clave | Desde enlace de correo. |
| `/verify-email` | Público | Reenviar verificación | Desde autenticación. |
| `/email-verified` | Público | Verificación concluida | Destino de enlace backend. |
| `/seguridad` | Autenticado | Seguridad de cuenta | Perfil, menú móvil y dropdown. |
| `/register` | Público | Registro | Login/dropdown. |
| `/plantilla` | Público | Placeholder de compatibilidad | No debe presentarse como funcionalidad completa. |
| `*` | Público | 404 | Detecta hashes desconocidos. |

## Controles y duplicaciones

| Gravedad | Archivo / control | Causa comprobada | Clasificación | Función que conservar | Solución propuesta | Dependencias / prueba |
|---|---|---|---|---|---|---|
| Crítica | [`Header.jsx`](../../aegis-web/AEGIS-REACT/src/components/layouts/Header.jsx) monta `Navbar` y `WorkspacePrimaryNav` dentro del drawer | Dos sistemas de navegación conviven; ambos contienen Marketplace, Foro, Puntos y publicar | Duplicación real | Todas las rutas deben seguir accesibles desde móvil | Un único bloque de navegación móvil; conservar CTA de publicar | Prueba de enlaces únicos, targets y focus en drawer |
| Alta | `Navbar` muestra “Publicar Producto”; `WorkspacePrimaryNav` muestra “Publicar” | Nombres distintos para el mismo `/productos/crear` en la misma superficie móvil | Duplicación real | CTA de creación | Un solo nombre canónico contextual, no eliminar capacidad | Test de nombre visible/URL |
| Media | Rail, bottom nav y drawer repiten Inicio/Marketplace/Comunidades/Foro/Perfil | Adaptación responsive deliberada de un mismo menú primario | Legítimo, responsive | Acceso móvil/desktop equivalente | Mantener, pero centralizar modelo de enlaces | Verificar que solo una superficie sea visible por viewport |
| Media | Header “Mensajes” + rail “Mensajes” + bottom nav indirecto | Acceso global persistente y menú principal | Contextual legítimo, con posible saturación | Mensajes siempre detectables en desktop | Definir una ubicación primaria; conservar acceso contextual desde producto | Test visual móvil/desktop |
| Media | Avatar móvil, avatar dropdown y rail “Perfil” | Entrada global de cuenta vs navegación principal | Contextual legítimo | Perfil propio y autenticación | Unificar URL; no mostrar acciones protegidas a visitante sin explicación | Tests visitante/usuario |
| Media | Header busca “producto”; Home y `/busqueda` también permiten buscar | Búsqueda global, hero y página especializada son puntos de entrada | Contextual legítimo | Buscar desde inicio/header | Conservar; normalizar destino y query | Test query y Enter |
| Alta | `WorkspacePrimaryNav` muestra `/perfil`, `/ajustes`, `/mensajes` al visitante | Modelo de enlaces no filtra autenticación; `Vista` redirige algunos | Opción expuesta sin sesión | Descubribilidad de funciones públicas | Ocultar o marcar protegido; al elegir, redirigir preservando retorno | Tests guest de todos los enlaces |
| Alta | `WorkspacePrimaryNav` muestra solo `admin` extra, no owner ni capacidades | Usa un booleano de rol, no capacidades efectivas | Inconsistencia de roles | Administración solo para admin | La visibilidad debe derivar de acciones confirmadas por backend | Tests admin/owner/capacidades |
| Alta | `/negociacion`, `/notificaciones`, `/ajustes` se omiten en `requiereSesion` | Lista manual de rutas no coincide con APIs autenticadas | Navegación/guard rotos | Login estándar y retorno | Centralizar metadatos de ruta | Guest directo debe redirigir a login |
| Alta | `/tiendas`, `/negociacion`, `/mis-reportes`, `/notificaciones` sin navegación primaria | Rutas integradas pero no conectadas al shell | Rutas parcialmente descubiertas | Funcionalidad sigue accesible | Añadir accesos contextuales por dominio, no saturar menú global | Mapa por tarea y tests de descubrimiento |
| Alta | `/vendedor` no usa el componente importado | Ruta degradada, conserva import muerto | Ruta heredada/bloqueada | Perfil público del vendedor | Usar la ruta pública parametrizada o redirigir a ella | Visitante y vendedor objetivo |
| Media | `/puntos-fisicos/configuracion` y `/puntos-fisicos/encuentros` en componentes no registrados | Componentes históricos no cableados | Enlace inexistente | Gestión futura de punto y agenda | Registrar solo si backend/UI están completos; retirar CTA si no | Owner e invalid route tests |
| Media | `Configuracion.jsx` apunta a POST `/puntos-fisicos/guardar` | Ni ruta React ni endpoint Laravel | Flujo heredado roto | Edición de punto | Reemplazar por endpoints actuales cuando se active | Owner, validación, rollback |
| Baja | `/` + `/home`, `/novedades` + marketplace | Alias | Legítimo histórico | Bookmarks/compatibilidad | Mantener alias y marcar ruta activa | Test de ambos alias |
| Baja | Guardados, reglas legales y checkout están deshabilitados | Capacidad explícitamente “próximamente” | Estado legítimo | No fingir función no disponible | Conservar deshabilitado hasta contrato real | Test de accesibilidad/deshabilitados |

## Profundidad innecesaria

- Para un anuncio: Marketplace → Detalle → Perfil vendedor requiere hoy una ruta propia inexistente y se corta en `/vendedor` o en el perfil del visitante autenticado.
- Foro: Feed → Publicación → identidad del autor vuelve a `/perfil` propio; falta salto público directo.
- Administración y ajustes sí requieren una jerarquía razonable porque agrupan operaciones por dominio.

## Prueba de corrección mínima

1. Abrir/cerrar el drawer en 360, 768, 1280 y 1440 px.
2. Verificar que cada destino principal aparece una sola vez dentro del mismo menú visible.
3. Recorrer directos protegidos como visitante, usuario, owner y admin.
4. Validar retorno a la ruta original después del login.
5. Confirmar que `/`, `/home`, `/novedades` y enlaces contextuales siguen funcionando.

