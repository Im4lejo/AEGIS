# INSTRUCCIONES GENERALES PARA AGENTES

## 1. PROPÓSITO

Trabaja dentro de la arquitectura, contratos y convenciones existentes.

Implementa únicamente la tarea solicitada.

Prioriza:

1. Corrección.
2. Compatibilidad.
3. Simplicidad.
4. Mantenibilidad.
5. Cambios mínimos necesarios.

No redefinas la arquitectura por iniciativa propia.


## 2. ANTES DE MODIFICAR

Antes de escribir código:

1. Identifica el objetivo de la tarea.
2. Lee la documentación aplicable.
3. Localiza los archivos relacionados.
4. Identifica dependencias e impacto.
5. Determina la solución mínima compatible.

No modifiques archivos no relacionados con la tarea.


## 3. ALCANCE DE LOS CAMBIOS

Puedes modificar:

- Archivos necesarios para la tarea.
- Archivos necesarios para integrar la solución.
- Tests relacionados.
- Documentación afectada.

No modifiques por iniciativa propia:

- Arquitectura general.
- Estructura principal de directorios.
- Contratos API.
- Tecnologías principales.
- Dependencias principales.
- Configuración global.
- Funcionalidades no relacionadas.
- Código funcional que no sea necesario modificar.

No realices refactorizaciones oportunistas.


## 4. CRITERIO TÉCNICO

Puedes decidir libremente detalles internos de implementación cuando:

- Respeten la arquitectura.
- Mantengan los contratos existentes.
- No introduzcan dependencias innecesarias.
- No afecten funcionalidades externas.
- Sean decisiones locales de implementación.

Utiliza la solución más simple y coherente.

No solicites autorización para decisiones internas que estén dentro de estos límites.


## 5. ESCALAMIENTO

Detén la implementación antes de realizar un cambio que afecte:

- Arquitectura.
- Estructura principal del proyecto.
- Contrato API.
- Modelo de datos.
- Tecnología principal.
- Dependencias principales.
- Autenticación.
- Comunicación entre frontend y backend.
- Comportamiento funcional no contemplado en la tarea.

En ese caso informa:

1. Problema encontrado.
2. Cambio necesario.
3. Motivo.
4. Archivos o módulos afectados.
5. Alternativas posibles.

Espera autorización antes de continuar.


## 6. COMPATIBILIDAD

Antes de modificar una interfaz existente, identifica sus consumidores.

No cambies silenciosamente:

- Funciones públicas.
- Endpoints.
- Parámetros.
- Respuestas API.
- Estructuras de datos.
- Props públicas.
- Interfaces.
- Rutas.
- Contratos entre módulos.

Si el cambio rompe compatibilidad, informa primero el impacto.


## 7. DEPENDENCIAS

Antes de agregar una dependencia:

1. Comprueba si ya existe una solución equivalente.
2. Determina si realmente es necesaria.
3. Evalúa su impacto.

No agregues dependencias innecesarias.

Si la dependencia modifica significativamente la arquitectura, solicita autorización.


## 8. IMPLEMENTACIÓN

Implementa únicamente lo necesario.

Respeta las convenciones existentes cuando sean compatibles con la arquitectura.

Utiliza primero las abstracciones existentes.

No reescribas código por preferencias personales.

No corrijas problemas no relacionados con la tarea.


## 9. VERIFICACIÓN

Después de implementar:

1. Ejecuta las pruebas relacionadas.
2. Verifica errores de compilación, ejecución o tipado.
3. Comprueba las interfaces afectadas.
4. Verifica el cumplimiento de la arquitectura.
5. Revisa los archivos modificados.
6. Comprueba que no existan cambios accidentales.

Si una verificación no puede realizarse, indícalo.


## 10. RESULTADO

Al finalizar informa únicamente:

- Cambios realizados.
- Archivos modificados.
- Pruebas ejecutadas.
- Resultado de las pruebas.
- Problemas encontrados.
- Decisiones relevantes tomadas.

No afirmes haber realizado una acción que no ejecutaste.


## 11. REGLA DE ARQUITECTURA

Si la tarea puede resolverse sin modificar la arquitectura, utiliza esa solución.

Si requiere modificar la arquitectura:

1. Detén la implementación.
2. Explica la necesidad.
3. Presenta las alternativas.
4. Espera autorización.

Nunca ocultes un cambio arquitectónico dentro de una implementación.


# OBJETIVOS DE TRABAJO


## OBJ-01 — AUDITAR EL PROYECTO

Objetivo:

Analizar el proyecto existente antes de modificarlo.

Instrucciones:

1. Inspecciona la estructura.
2. Identifica tecnologías y dependencias.
3. Identifica módulos y funcionalidades.
4. Identifica rutas y puntos de entrada.
5. Identifica presentación.
6. Identifica lógica de negocio.
7. Identifica acceso a datos.
8. Identifica autenticación y autorización.
9. Identifica dependencias entre módulos.
10. Identifica puntos de acoplamiento relevantes.
11. Identifica responsabilidades ambiguas.

No modifiques código.

No refactorices.

No corrijas problemas.

No diseñes todavía una nueva arquitectura.

Genera el análisis únicamente a partir de evidencia del proyecto.


## OBJ-02 — IDENTIFICAR DOMINIOS

Objetivo:

Agrupar las funcionalidades existentes en dominios coherentes.

Instrucciones:

1. Utiliza únicamente información obtenida del proyecto.
2. Agrupa funcionalidades por propósito.
3. Identifica entidades principales.
4. Identifica operaciones principales.
5. Identifica dependencias entre dominios.
6. Separa infraestructura de lógica de negocio.
7. No crees dominios únicamente por estructura de archivos.

No modifiques código.

No cambies la estructura actual.

No diseñes todavía React o Laravel.

Si existe ambigüedad, documenta las alternativas y criterio utilizado.


## OBJ-03 — SEPARAR RESPONSABILIDADES

Objetivo:

Determinar qué responsabilidades pertenecen a cada capa.

Clasifica las responsabilidades como:

- Presentación.
- Interacción.
- Validación de entrada.
- Lógica de aplicación.
- Regla de negocio.
- Autenticación.
- Autorización.
- Acceso a datos.
- Persistencia.
- Infraestructura.

Principios:

React → presentación e interacción.

Laravel → API, aplicación y reglas de negocio.

Base de datos → persistencia.

No traslades código PHP directamente a React.

Determina primero la responsabilidad de cada componente.

No modifiques código durante este análisis.


## OBJ-04 — DISEÑAR LARAVEL

Objetivo:

Definir la estructura del backend necesaria para reemplazar progresivamente el sistema actual.

Instrucciones:

1. Utiliza los dominios identificados.
2. Define responsabilidades por módulo.
3. Define endpoints necesarios.
4. Define validaciones.
5. Define reglas de negocio.
6. Define acceso a datos.
7. Define respuestas API.
8. Define autenticación y autorización cuando corresponda.

No agregues capas sin una responsabilidad concreta.

No implementes funcionalidades fuera del alcance.

No modifiques React durante esta etapa.

Si una decisión afecta el contrato API, documenta primero el impacto.


## OBJ-05 — DEFINIR CONTRATO API

Objetivo:

Definir una interfaz estable entre React y Laravel.

Para cada operación define:

- Endpoint.
- Método HTTP.
- Autenticación.
- Autorización.
- Parámetros.
- Request.
- Response.
- Códigos HTTP.
- Errores.
- Paginación cuando corresponda.
- Filtros cuando correspondan.

El contrato debe describir el comportamiento externo de la API, no su implementación interna.

React no debe depender directamente de:

- Modelos Eloquent.
- Tablas de base de datos.
- Clases internas de Laravel.
- Estructura interna del backend.

No rompas contratos existentes sin autorización.


## OBJ-06 — DISEÑAR REACT

Objetivo:

Definir una estructura React basada en las funcionalidades reales y el contrato API.

Utiliza como referencia conceptual:

- app
- features
- shared
- infrastructure

Adapta la estructura a las necesidades reales del proyecto.

Los componentes de UI no deben comunicarse directamente con Laravel.

Centraliza las llamadas HTTP mediante la capa definida para API.

Mantén la lógica específica dentro de su feature.

Utiliza shared únicamente para elementos realmente reutilizables.

No introduzcas abstracciones innecesarias.

No modifiques el backend salvo que exista una incompatibilidad previamente identificada.


## OBJ-07 — IMPLEMENTAR FUNCIONALIDAD

Objetivo:

Implementar la funcionalidad solicitada respetando arquitectura y contratos.

Antes de modificar:

1. Lee la documentación aplicable.
2. Identifica la feature afectada.
3. Identifica el contrato API relacionado.
4. Localiza implementaciones existentes.
5. Determina los archivos necesarios.

Después:

1. Implementa la funcionalidad.
2. Modifica únicamente lo necesario.
3. Mantén compatibilidad.
4. Utiliza abstracciones existentes.
5. Respeta las convenciones.
6. Añade o modifica pruebas relacionadas.

No:

- Refactorices código no relacionado.
- Cambies arquitectura.
- Cambies contratos.
- Agregues dependencias innecesarias.
- Modifiques funcionalidades fuera del alcance.

Si alguno es imprescindible, escala la decisión antes de continuar.


## OBJ-08 — MIGRAR FUNCIONALIDAD PHP

Objetivo:

Migrar una funcionalidad PHP existente a React + Laravel conservando su comportamiento.

Instrucciones:

1. Analiza la implementación existente.
2. Identifica el comportamiento que debe conservarse.
3. Separa presentación, negocio y persistencia.
4. Determina responsabilidades de Laravel.
5. Determina responsabilidades de React.
6. Define o verifica el contrato API.
7. Implementa el backend necesario.
8. Implementa el frontend necesario.
9. Verifica la integración.

No traduzcas PHP línea por línea a React.

No reproduzcas reglas de negocio del backend en React.

No elimines la implementación anterior hasta validar la nueva.

No modifiques funcionalidades fuera del alcance.

Si el comportamiento existente es ambiguo, informa antes de cambiarlo.


## OBJ-09 — VERIFICAR ARQUITECTURA

Objetivo:

Comprobar que una implementación respete la arquitectura definida.

No modifiques código.

Revisa:

1. Estructura.
2. Dependencias.
3. Responsabilidades.
4. Comunicación frontend/backend.
5. Contrato API.
6. Duplicación de lógica.
7. Acoplamiento.
8. Dependencias nuevas.
9. Cambios fuera del alcance.
10. Violaciones arquitectónicas.

Clasifica hallazgos como:

- Crítico.
- Importante.
- Menor.
- Informativo.

Para cada hallazgo indica:

- Ubicación.
- Problema.
- Regla afectada.
- Impacto.
- Solución recomendada.

No realices cambios.


# JERARQUÍA DE DECISIONES

El agente debe seguir esta jerarquía:

PROYECTO
    ↓
ARQUITECTURA
    ↓
CONTRATOS
    ↓
TAREA
    ↓
IMPLEMENTACIÓN

Regla:

El agente tiene autonomía máxima dentro del nivel de implementación.

Puede decidir libremente detalles internos que no afecten niveles superiores.

Debe escalar cualquier decisión que modifique arquitectura, contratos, tecnología o alcance.

PRINCIPIO FINAL:

La arquitectura define los límites.

El contrato define las interfaces.

La tarea define el objetivo.

El agente decide cómo implementar dentro de esos límites.

