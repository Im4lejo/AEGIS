# ADR-0028: Centro administrativo y permisos operativos

- **Estado:** Aceptado
- **Fecha:** 2026-11-23
- **Responsable:** Copilot SDK

## Contexto

El proyecto tenía rutas admin mínimas y el dashboard React usaba datos demo. Los permisos globales estaban concentrados en el rol admin y no existían capacidades operativas por tarea.

## Decisión

- Mantener admin como rol global y agregar capacidades delegables por usuario.
- No mezclar roles comunitarios con permisos globales.
- Medir KPIs con agregaciones SQL y periodos explícitos.
- Usar confirmación verbal `CONFIR` para cambios críticos de cuenta.
- Versionar configuración global y rechazar versiones obsoletas.
- Mantener auditoría no editable desde el panel.
- Limitar exportación a CSV autorizado y registrar su emisión.

## Alternativas

- Crear roles generales tipo soporte/moderador: descartado por introducir una nueva matriz ambiguamente global.
- Permitir solo rol admin: descartado por no cumplir mínimo privilegio.
- CSV libre sin límite: descartado por exposición masiva de datos.

## Consecuencias

- Operadores pueden recibir capacidades individuales sin convertirse en admin.
- Categorías y avisos requieren permisos específicos.
- Exportaciones quedan trazadas y tienen límite inicial de 10,000 filas.
