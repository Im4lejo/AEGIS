# Inventario de rutas web — evidencia before

## Rutas públicas capturadas

| Ruta | Estado | Evidencia / observación |
|---|---|---|
| `/#/home` | Activa | Capturada en claro/oscuro y 4 viewports |
| `/#/login` | Activa | h1 semántico ausente; idioma mixto |
| `/#/productos` | Activa | Capturada; cards DEMO y footer |
| `/#/foro` | Activa | Overflow a 360; compositor móvil y footer |
| `/#/comunidades` | Activa | Capturada sin overflow principal |
| `/#/tiendas` | Activa | Capturada; misma composición base |
| `/#/busqueda` | Activa | Capturada; falta h1 en resultado |
| `/#/publicacion` | Existe | No se incluyó porque requiere `id` establecido |
| `/#/productos/detalle?id=` | Existe | Requiere id dinámico; no capturado sin dato seleccionado |
| `/#/novedades` | Existe | Comparte componente de productos |
| `/#/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/email-verified` | Existen | No incluidos en la matriz automatizada inicial |
| `/#/puntos-fisicos`, `/configurar-encuentro`, `/negociacion` | Existen | No capturados por alcance inicial; requieren sesión/contexto |

## Rutas autenticadas capturadas

| Ruta | Estado | Observación |
|---|---|---|
| `/#/ajustes` | Activa | Overflow 1440; layout dos columnas |
| `/#/datos-personales` | Activa | Overflow 1440; panel denso |
| `/#/mensajes` | Activa | No se observó overflow |
| `/#/productos/mis-productos` | Activa | Capturada; tabla responsiva por validar |
| `/#/notificaciones` | Activa | Capturada |
| `/#/perfil` | Activa | Capturada; h1 no siempre detectado |
| `/#/perfil/editar` | Existe | No capturada en matriz inicial |
| `/#/seguridad` | Existe | No capturada |
| `/#/mis-reportes` | Existe | No capturada |

## Rutas administrativas

| Ruta | Acceso | Estado |
|---|---|---|
| `/#/admin` | Admin | Existe, no capturada |
| `/#/admin/reportes` | Admin | Existe, no capturada |
| `/#/admin/usuarios` | Admin | Existe, no capturada |
| `/#/admin/auditoria` | Admin | Existe, no capturada |
| `/#/admin/configuracion` | Admin | Existe, no capturada |

## Rutas degradadas

| Ruta | Estado real |
|---|---|
| `/#/vendedor` | Mensaje de requerir perfil real |
| `/#/plantilla` | Pantalla placeholder mantenida por compatibilidad |
