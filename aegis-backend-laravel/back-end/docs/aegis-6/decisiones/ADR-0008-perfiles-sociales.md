# ADR-0008: Perfiles sociales y privacidad

## Estado

Aprobada para el Incremento 06.

## Decisión

- El perfil propio usa `GET/PATCH /api/perfil/me`.
- El perfil público conserva `GET /api/perfil/{usuario}` y añade pestañas paginadas.
- Los datos privados exactos no se incluyen en recursos públicos.
- La privacidad se almacena en `usuarios.perfil_privado`, con seguimiento aceptado para perfiles privados.
- Seguimientos, bloqueos y silencios usan tablas mínimas específicas.
- Presencia visible requiere consentimiento mediante `mostrar_presencia`.
- Avatar y portada reutilizan los endpoints de media del Incremento 05.
- La desactivación inicia una retención de 30 días y revoca tokens actuales.

## Consecuencias

- El recurso público no expone email, teléfono ni ciudad exacta.
- Los perfiles privados rechazan visitantes no seguidos con `PROFILE_PRIVATE`.
- Los bloqueos mutuos producen `PROFILE_RESTRICTED`.
- Las pestañas de comunidades permanecen estructuralmente preparadas; no existe un dominio real de comunidades en el proyecto actual.
