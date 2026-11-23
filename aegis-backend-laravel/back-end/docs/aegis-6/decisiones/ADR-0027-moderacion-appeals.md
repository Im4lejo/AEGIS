# ADR-0027: Moderación auditable y apelaciones

- **Estado:** Aceptado
- **Fecha:** 2026-11-23
- **Responsable:** Copilot SDK

## Contexto

Existían reportes contextuales básicos y acciones administrativas dispersas, sin cola, sanción reversible, protección de reportante ni auditabilidad encadenada.

## Decisión

- Extender `reportes` en lugar de crear otra entidad duplicada.
- Permitir solo las razones `spam`, `estafa`, `acoso`, `contenido_prohibido` y `suplantacion`.
- Limitar la cola global a administradores; propietarios/moderadores comunitarios continúan con moderación contextual existente.
- Aplicar sanciones proporcionales y permitir apelación solo a la persona afectada.
- Registrar acciones críticas con hash anterior y actual.
- Clasificar antifraude como señales de revisión, sin culpabilidad o sanción automática.
- Restringir mensajes de desconocidos según preferencias del destinatario.

## Alternativas

- Mantenimiento de reportes separados por entidad: descartado por duplicar el mismo flujo y privacidad.
- Acceso libre a mensajes privados: descartado por violar privacidad y minimizar moderación.
- Clasificación automática culpable: descartada por riesgo de sesgo y falta de revisión humana.

## Consecuencias

- Las sanciones pueden revertirse por apelación aceptada.
- Los reportes ajenos no se exponen.
- El hash encadenado es interno y debe complementarse con firma externa si se exige prueba legal.
- La expiración real de suspensiones requiere scheduler posterior.
