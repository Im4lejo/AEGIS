# Navegabilidad de perfiles

## Diagnóstico

Laravel expone `GET /api/perfil/{usuario}` y tabs públicos, pero React solo registra `/perfil`, la marca como autenticada y obtiene el perfil desde el usuario de sesión. Por eso la mayoría de identificadores de terceros termina sin un destino compatible.

Fuentes: [`routes/api.php`](../../aegis-backend-laravel/back-end/routes/api.php), [`App.jsx`](../../aegis-web/AEGIS-REACT/src/App.jsx), [`Perfil.jsx`](../../aegis-web/AEGIS-REACT/src/components/perfil/views/Perfil.jsx) y [`PerfilController.php`](../../aegis-backend-laravel/back-end/app/Http/Controllers/Api/PerfilController.php).

## Incidencias por pantalla

| Gravedad | Superficie | Identificador disponible | Enlace actual / problema | Función a conservar | Solución / dependencia / prueba |
|---|---|---|---|---|---|
| Crítica | Producto → vendedor | `producto.usuario_id` y relación vendedor | No hay enlace público consistente; `/vendedor` muestra mensaje | Vendedor debe ser navegable desde detalle, card contextual y oferta | Nueva ruta pública por id; validar que resource de detalle siempre incluya id seguro; pruebas guest y owner |
| Crítica | Foro → autor | `usuarioId` se mapea desde API | Si es el usuario actual, va a `/perfil`; terceros se muestran como texto | Autor visible, controles de dueño solo para dueño | Enlace universal `/perfil?id=` o ruta dinámica; preservar acciones de editar/archivar solo al dueño |
| Crítica | Foro → comentarios | Comentario trae usuario en endpoint | Nombres no se enlazan al perfil | Conversación y respuesta siguen funcionando | Incluir id público y enlace; respetar perfil privado/bloqueos |
| Alta | Publicación de foro | API carga `usuario`; UI muestra identidad | No se detectó enlace al autor | Título, comentarios y compartir | Usar identificador estable de `usuario`; test visita al perfil objetivo |
| Alta | Perfil → productos/publicaciones | Datos propios de perfil actual | Tabs usan id de sesión, no el id visto | Tabs de cualquier perfil | Separar viewer y target; reseñas/tabs deben usar target |
| Alta | Reseñas | Endpoints por id/ámbito disponibles | UI de perfil depende del id propio | Reputación y respuesta de reseña | Confirmar serialización de reviewer/receptor; enlazar según privacidad |
| Alta | Comunidades | Membership y posts cargan usuario | Identidades de miembros/autores no tienen enlace consolidado | Moderación y membresía contextual | Enlazar solo identidades públicas; mantener controles según membership |
| Alta | Mensajería | Conversación incluye usuarios e ids | Participantes se muestran como texto | Privacidad y apertura de conversación directa | Enlace sujeto a política de bloqueo/privacidad; no filtrar contenido por UI |
| Media | Historias | `usuario` disponible | Avatar/nombre permite abrir historia, no perfil | Abrir historia sigue siendo principal | Añadir acceso secundario a perfil sin secuestrar click de historia |
| Media | Tiendas | Owner/miembros se relacionan en API | Directorio muestra identidad incompleta | Tienda y perfil son entidades diferentes | Enlace owner solo cuando id esté normalizado |

## Ruta propuesta compatible

Para no romper bookmarks:

- Conservar `/perfil` como “mi perfil” y ruta protegida.
- Añadir una ruta pública parametrizada, por ejemplo `/perfil/:usuarioId` o `/perfil?usuario=`.
- Pasar el id real como target y separar:
  - `viewerId`: sesión actual, puede ser nulo.
  - `profileId`: usuario visitado.
- Mostrar “Editar perfil” solo cuando ambos ids coincidan o el backend conceda capacidad.
- Mantener el perfil privado como respuesta API controlada, no como simple ocultación React.

## Contrato API por completar

Verificar en respuestas de:

- productos y detalle;
- foro index/show/comentarios;
- comunidades/member/posts;
- reseñas;
- conversaciones/participantes;
- tiendas.

Cada identidad visual debe disponer al menos de:

```text
usuario: {
  id,
  username/nombre,
  foto_perfil/foto_perfil_url
}
```

No exponer correo, teléfono, rol interno ni capacidades ajenas salvo necesidad funcional.

## Pruebas necesarias

1. Visitante abre perfil de vendedor y autor.
2. Usuario autenticado abre perfil de otro usuario, no su `/perfil` propio.
3. La propia identidad conserva botón Editar.
4. Perfil privado, bloqueado y suspendido tienen comportamiento definido.
5. Comentarios, reseñas, comunidades, mensajes e historias usan el id objetivo correcto.
6. Producto y foro cargados desde fixtures y desde API real.
7. No se generan rutas con `undefined`, `null` o id de sesión incorrecto.

