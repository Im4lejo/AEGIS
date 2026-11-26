# Matriz de roles, permisos y visibilidad

## Modelo real comprobado

| Actor | Persistencia | Aplicación backend | Exposición React |
|---|---|---|---|
| Visitante | Sin usuario/token | Lectura pública en rutas iniciales; escrituras dentro de `auth:sanctum` | `isAuthenticated=false`; algunos enlaces protegidos aún se muestran |
| Usuario autenticado | `usuarios.rol=usuario`, `estado` activo/suspendido/baneado | Middleware de sesión/estado; verificación adicional en writes | `auth.user`, token, `isAdmin/isOwner`, `capabilities` |
| Comprador | No existe como rol persistido | Relación y acciones por `comprador_id` en ofertas/operaciones/encuentros | UI derivada del usuario actual vs comprador |
| Vendedor | No existe como rol persistido | Propiedad `productos.usuario_id` y gates | CTA de publicar disponible para usuario autenticado activo/verificado |
| Owner de punto | `usuarios.rol=owner` y propiedad `puntos_fisicos.owner_id` | `manage.points` acepta admin, owner del punto o capacidad delegada | Booleano `isOwner`, pero no existe navegación de gestión registrada |
| Moderador de comunidad | `membresias_comunidad.rol=moderador` | Controller verifica owner/moderador y membresía | La vista comunitaria usa `membership`; no es un rol global |
| Administrador | `usuarios.rol=admin` | Gates admin y autorización de controllers | Bloquea `/admin` en React y añade enlace primario |

Fuentes: migraciones [`usuarios`](../../aegis-backend-laravel/back-end/database/migrations/2026_10_11_000000_create_usuarios_table.php), [`comunidades`](../../aegis-backend-laravel/back-end/database/migrations/2026_11_23_000008_create_communities.php), [`permisos`](../../aegis-backend-laravel/back-end/database/migrations/2026_11_23_000003_add_authorization_privacy_tables.php), [`AppServiceProvider`](../../aegis-backend-laravel/back-end/app/Providers/AppServiceProvider.php) y [`App.jsx`](../../aegis-web/AEGIS-REACT/src/App.jsx).

## Matriz por capacidad

Leyenda: **S** sí; **C** condicional; **N** no.

| Capacidad | Visitante | Usuario | Comprador | Vendedor | Owner punto | Mod. comunidad | Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Leer inicio/productos/foro/comunidades/tiendas/puntos | S | S | S | S | S | S | S |
| Registrar/iniciar sesión | S | — | — | — | — | — | — |
| Ver perfil público por id | S en API | S en API | S | S | S | S | S |
| Crear producto | N | C: activo + verificado | C | C | C | C | C |
| Gestionar producto | N | C: dueño/delegado | C: no por rol | C: dueño | C: dueño | C: dueño | S |
| Crear/aceptar oferta | N | C | C según relación | C según relación | C según relación | C según relación | Backend/C |
| Coordinar encuentro | N | C | C | C | C por punto/participación | C según relación | S |
| Gestionar punto físico | N | N salvo capacidad | N por rol | N por rol | C: propietario | N por rol | S |
| Crear foro/comentarios/reacciones | Lectura solamente | C: activo + verificado según endpoint | C | C | C | C | C |
| Moderar comunidad/eventos | N | C: miembro | C | C | C | C: moderador/owner | No asumir sin membresía |
| Moderar reportes globales | N | N | N | N | N | N | S |
| Administrar cuentas/configuración/auditoría | N | N | N | N | N | N | S |

## Incidencias

| Gravedad | Hallazgo | Causa | Función a conservar | Solución propuesta | Prueba |
|---|---|---|---|---|---|
| Alta | React muestra Perfil/Ajustes/Mensajes al visitante | El shell no filtra navegación por sesión | Descubrimiento de función protegida | Ocultar o mostrar estado “requiere sesión” y redirigir con retorno | Matriz visitante vs autenticado |
| Alta | `/notificaciones`, `/negociacion`, `/ajustes` omiten guard React | Lista manual `requiereSesion` incompleta | Protección clara y UX consistente | Metadatos centralizados por ruta | Acceso directo guest |
| Alta | “vender” podría interpretarse como rol separado | Contrato real usa cuenta común + propiedad | Cualquier cuenta activa puede publicar | Mantener buyer/seller como capacidades de operación, no `rol` | Registro, publicar, ofrecer como mismo usuario |
| Alta | Owner no tiene ruta de dashboard/gestión registrada | Componentes históricos no se conectaron | Gestión real del punto | Cablear solo capacidades respaldadas por endpoint, no crear menú ficticio | Owner/no owner/admin |
| Media | Moderador comunitario no es admin global | Roles pertenecen a tablas y contextos distintos | Moderación acotada | Derivar controles del `membership` entregado por comunidad | Owner/moderador/miembro/invitado |
| Alta | React expone acciones según booleans, pero API no queda protegida por eso | Separación correcta de responsabilidades | Backend como autoridad | Mantener autorización de controllers/gates y no confiar en props React | Tests de endpoint por rol, estado, propiedad |
| Media | `capabilities` se propaga pero no hay inventario único de uso visual | UI puede divergir de backend | Ocultar controles no autorizados | Documentar claves y fallback a denegación | Snapshot usuario/capabilities |

## Política para la siguiente corrección

1. La visibilidad UI es ergonomía, no seguridad.
2. `usuario`, `owner` y `admin` no reemplazan propiedad ni membresía.
3. Comprador y vendedor son relaciones/acciones de una misma cuenta.
4. Moderador de comunidad y gestor de tienda tienen alcance local.
5. Toda opción nueva debe tener permiso backend verificable y prueba negativa.

