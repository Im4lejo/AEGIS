# UI-05 — Matriz de rutas

Las rutas se abrieron en Chromium con respuestas API interceptadas y cuentas
de prueba aisladas. La persona «vendedor» usa el rol existente `usuario` con
un producto propio; no se inventa un rol backend separado.

| Ruta | Persona | Estado observado | Cobertura y límites |
| --- | --- | --- | --- |
| `/` | Invitado | Verificada | Feed con datos, loading, vacío, error, historia/dialog y tema claro/oscuro. |
| `/login` | Invitado | Verificada | Estado de credenciales inválidas y retorno tras login a Mensajes. |
| `/foro` | Invitado / usuario | Verificada | Feed y apertura/publicación del compositor; el payload multipart conserva título y cuerpo. |
| `/comunidades` | Invitado / moderador | Verificada | Directorio y herramientas/eventos visibles para membresía de moderador. |
| `/productos` | Invitado | Verificada | Catálogo en cuatro anchos y dos temas; comparación contra snapshot UI-04. |
| `/productos/detalle?id=501` | Invitado / usuario | Verificada | Detalle responsive y diálogo para proponer precio; comparación contra UI-04. |
| `/productos/crear` | Vendedor | Verificada visualmente | Formulario capturado. El envío de anuncios se había probado con fixture en UI-04; no se verificó persistencia real. |
| `/productos/mis-productos` | Verificada con scroll interno | Vendedor | Producto propio visible. A 360 px la región está rotulada, indica el desplazamiento y se opera con flechas izquierda/derecha; las acciones se alcanzan desplazando horizontalmente. |
| `/mensajes` | Vendedor | Verificada | Conversación móvil y escritorio; envío de mensaje incluido en la comparación UI-04 con fixture. |
| `/perfil` | Vendedor | Verificada | Perfil y productos propios con respuestas de fixture. |
| `/tiendas` | Invitado | Verificada visualmente | Directorio; no representa un dashboard de inventario/analítica que no existe. |
| `/puntos-fisicos` | Invitado | Verificada visualmente | Directorio con texto de dirección de fixture. No se conectó un mapa ni se presentan ubicaciones reales. |
| `/ajustes` | Vendedor | Verificada | Preferencias con fixture y ambos temas. |
| `/seguridad` | Vendedor | Verificada | Superficie privada y sesión de prueba. |
| `/admin` | Admin / vendedor | Verificada | Dashboard admin y acceso denegado al usuario sin permiso. |
| `/admin/usuarios` | Verificada con scroll interno | Admin | Tabla con fixture; scroll por teclado verificado a 360 px y selectores de rol/estado con nombres accesibles asociados a cada cuenta. |
| `/admin/reportes` | Admin | Verificada | Tabla con fixture. |
| `/admin/auditoria` | Admin | Verificada | Tabla con fixture. |
| `/admin/configuracion` | Admin | Verificada | Tabla/estado con fixture. |
| `/guardados` | Invitado | Bloqueada/no disponible | No hay página implementada; conservar el estado ausente y no simular funcionalidad. |
| `/vendedor?id=…` | Público | Parcial/bloqueada | La limitación ya está documentada en UI-04; no se presentó una página ficticia. |

## Evidencia por tamaño y tema

La matriz de rutas genera 176 capturas (22 destinos × cuatro anchos × dos
temas), además de capturas de estados, recorridos y baseline. En total hay 190
PNG. Los anchos son 360, 768, 1280 y 1440 px; no se midió overflow del
documento en ninguna captura. Las tablas usan scroll horizontal interno; la
región y el movimiento con flechas se comprobaron a 360 px. Los resultados detallados están en
[`route-results.json`](./route-results.json); los PNG están en esta carpeta.

Muestras de las tablas con scroll horizontal:

- [Productos propios a 360 px](./seller-products-seller-light-360.png)
- [Usuarios de administración a 360 px](./admin-users-admin-light-360.png)

El detalle de tres superficies se comparó con `toHaveScreenshot()` contra el
baseline existente de UI-04, sin actualización automática:

- [Marketplace móvil](./marketplace-guest-light-360.png)
- [Detalle de producto móvil](./product-detail-guest-light-360.png)
- [Mensajes móvil](./messages-seller-light-360.png)

Las comparaciones usan datos/fixtures de UI-05 y UI-04; no equivalen a una
comparación controlada con UI-00 ni a validación de persistencia backend.

Axe ejecutó 52 escaneos en 13 superficies a 360 y 1280 px, en ambos temas;
no detectó violaciones automáticas. Los 64 resultados `incomplete` requieren
revisión manual y no se consideran aprobados.
