# Spec Delta

## Purpose

Define el entregable de pruebas funcionales de caja negra: cómo se derivan los casos desde el oráculo con técnicas explícitas, qué riesgos cubren y cómo se registra su ejecución sobre la UI y la API.

## ADDED Requirements

### Requirement: Derivación explícita por técnica
Antes de los casos, el documento SHALL mostrar la derivación de cada técnica aplicada: particiones de equivalencia con sus clases válidas e inválidas, valores límite con los puntos elegidos, tablas de decisión con condiciones y acciones, el modelo de pairwise con sus parámetros y combinaciones generadas, y la matriz de consistencia entre capas.

#### Scenario: Revisor pregunta de dónde sale un caso
- **WHEN** un revisor elige un caso cualquiera
- **THEN** encuentra la partición, el límite, la regla de la tabla o la combinación de la que se derivó

### Requirement: Orden de aplicación de técnicas
Las técnicas SHALL presentarse y aplicarse en el orden exploratorio, funcional, dominio (partición de equivalencia y valores límite) y combinatorio, con las tablas de decisión y la consistencia entre capas como técnicas funcionales.

#### Scenario: Lectura del documento
- **WHEN** se lee el documento de arriba abajo
- **THEN** las secciones siguen ese orden y el exploratorio aparece primero con sus charters y hallazgos

### Requirement: Casos acotados y guiados por riesgo
El documento SHALL contener entre 15 y 25 casos, cada caso MUST indicar el riesgo del plan que cubre, y los riesgos R1 a R4 MUST concentrar la mayoría de los casos.

#### Scenario: Conteo por riesgo
- **WHEN** se cuentan los casos por riesgo
- **THEN** más de la mitad cubren R1, R2, R3 o R4

### Requirement: Formato de caso completo
Cada caso SHALL tener ID, título, técnica, riesgo, capa, precondición, pasos, datos, resultado esperado, resultado obtenido, estado y evidencia, y el resultado esperado MUST citar su fuente (documento y sección, Swagger o criterio explícito).

#### Scenario: Resultado esperado sin fuente
- **WHEN** un caso afirma un resultado esperado
- **THEN** el caso nombra el documento o la regla que lo respalda

### Requirement: Cobertura de UI y API
El conjunto de casos SHALL incluir casos ejecutados sobre la UI y casos ejecutados sobre la API, y MUST incluir pruebas negativas y de validación de entradas.

#### Scenario: Capa sin casos
- **WHEN** se filtran los casos por capa
- **THEN** hay casos de UI, de API y casos negativos

### Requirement: Diseño sin leer el código
Los casos SHALL derivarse solo de la documentación, el Swagger, la UI en ejecución y las sesiones exploratorias, y MUST NOT citar archivos de `backend/` o `frontend/src/` como fuente.

#### Scenario: Fuente de un caso
- **WHEN** se revisan las fuentes citadas por los casos
- **THEN** ninguna es un archivo de código de la aplicación

### Requirement: Ejecución con evidencia
Cada caso SHALL registrar su resultado obtenido y su estado (`PASA`, `FALLA` o `BLOQUEADO`) con evidencia enlazada, y cada caso que falla MUST referenciar un candidato a defecto `BUG-xx`.

#### Scenario: Caso que falla
- **WHEN** un caso termina en `FALLA`
- **THEN** enlaza su evidencia y el `BUG-xx` correspondiente

### Requirement: Versión tabular
Los casos SHALL existir también en `qa/03-casos-caja-negra.csv` con las mismas columnas y los mismos valores que el documento.

#### Scenario: Abrir en hoja de cálculo
- **WHEN** se abre el CSV en una hoja de cálculo
- **THEN** cada caso es una fila con las columnas del formato y coincide con el documento
