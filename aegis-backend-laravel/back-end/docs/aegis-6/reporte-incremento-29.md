# Incremento 29: pruebas extremo a extremo y cierre web

## Alcance y estado

Parcial. Existe una suite backend amplia y una suite React unit/integration, pero no E2E real con Playwright/Cypress ni medición navegador de CWV. Las acciones falsas se degradaron honestamente donde fueron detectadas.

## Estado Git

- Rama activa: `PersonalizacionPerfil`.
- HEAD inicial: `56148c84129f3fe8ae0910ff1f072c255e9e5580`.
- Estado inicial con cambios acumulados respetados.
- Tag `6.0.0`: no existe localmente.
- Respaldo: `C:\Users\franc\.copilot\session-state\6c03e4e7-625a-49c7-8785-7931f45d1124\files\aegis_db_pre_incremento29.sql`, 166255 bytes.

## Resultados

| Componente | Resultado |
|---|---|
| Laravel | Suite completa ejecutada anteriormente: 127 pruebas, 635 aserciones |
| React | Vitest completo: 19 pruebas aprobadas |
| React build | Build exitoso |
| Migraciones | 000001–000030 aplicadas en MySQL local |
| SQLite testing | Configurado; suites corren en memoria |
| E2E navegador | Pendiente: no se instaló Playwright/Cypress |
| Capturas 360/768/1280/1440 | Pendiente: no hubo browser compartido |
| WCAG auditoría automatizada | Pendiente: no hay axe/E2E configurado |
| Live | Gated por proveedor |
| Checkout | Pendiente |

## Acciones degradadas

- Checkout muestra que no está disponible y no hace `onClick` falso.
- Live no ofrece sesión real sin proveedor configurado.
- `/vendedor` ya no promete datos demo.
- Centro de ayuda, FAQ, términos y privacidad están marcados próximamente.
- El feed Siguiendo conserva explicación de no disponibilidad.

## Riesgos abiertos

- Mensajería usa API real, no `mensajesDemo`.
- Había datos demo residuales en perfil/vendedor y carrito; no se eliminaron por completo en esta ejecución.
- El Playwright/Cypress no está habilitado.
- No existe auditoría WCAG automatizada ni prueba real de teclado/zoom/lectores.
- Live/checkout requieren productos externos e integración probada.

## Prerrequisitos

- Instalar Playwright y browsers de CI.
- Definir cuentas demo de visitante, usuario, vendedor, owner, moderador y admin.
- Levantar Laravel/React y ejecutar flujos críticos.
- Medir Lighthouse y Web Vitals en Chromium.
- Completar política legal y páginas soporte antes del release público.
