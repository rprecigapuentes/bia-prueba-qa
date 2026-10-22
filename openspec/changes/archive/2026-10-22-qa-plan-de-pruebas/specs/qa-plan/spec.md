# Spec Delta

## Purpose

Define el documento de estrategia y plan de pruebas de la entrega: qué debe contener para que el resto del trabajo de QA tenga un alcance, una prioridad por riesgo y unos criterios de salida comunes.

## ADDED Requirements

### Requirement: Plan de pruebas breve y autocontenido
El plan SHALL existir en `qa/01-plan-de-pruebas.md`, MUST ocupar como máximo dos páginas impresas (sin contar el resumen ejecutivo) y MUST poder leerse sin abrir otros documentos de la entrega.

#### Scenario: Revisor lee solo el plan
- **WHEN** un revisor abre únicamente `qa/01-plan-de-pruebas.md`
- **THEN** entiende qué se probó, qué no, por qué, con qué prioridad y cuándo se considera terminado

### Requirement: Alcance con exclusiones justificadas
El plan SHALL listar las áreas incluidas y las excluidas, y cada exclusión MUST tener una razón explícita (tiempo, riesgo bajo, fuera del producto o dependencia externa).

#### Scenario: Área excluida
- **WHEN** un área del producto queda fuera de alcance (por ejemplo, la redacción con OpenAI)
- **THEN** el plan dice que queda fuera y por qué

### Requirement: Riesgos priorizados
El plan SHALL incluir una matriz de riesgos por área funcional con impacto y probabilidad, MUST ordenarla de mayor a menor riesgo y MUST justificar el impacto desde el punto de vista del operador de planta.

#### Scenario: Prioridad de esfuerzo
- **WHEN** se decide dónde invertir más casos de prueba
- **THEN** las áreas de riesgo alto de la matriz reciben más casos que las de riesgo bajo, y el plan lo hace visible

### Requirement: Tipos de prueba por capa
El plan SHALL indicar qué tipos de prueba se aplican en cada capa (unitario, API, UI) y qué técnicas de diseño se usan por área, incluidas al menos partición de equivalencia, valores límite, tablas de decisión, combinatoria (pairwise) y consistencia entre capas.

#### Scenario: Trazabilidad técnica–área
- **WHEN** un revisor busca cómo se probó un área de riesgo alto
- **THEN** el plan nombra la capa y la técnica usadas para esa área

### Requirement: Criterios de entrada, suspensión y salida
El plan SHALL definir criterios de entrada, de suspensión y de salida verificables, y el criterio de entrada MUST referirse al resultado de la suite de humo.

#### Scenario: Build no probable
- **WHEN** falla un caso de la suite de humo
- **THEN** el criterio de suspensión del plan indica que se detiene la ejecución funcional y se reporta el bloqueo

### Requirement: Oráculos declarados
El plan SHALL declarar qué oráculos de consistencia (HICCUPPS) se usan, con la fuente concreta de cada uno en el producto, MUST indicar cuáles no aplican y por qué, y MUST definir qué oráculo prevalece cuando dos se contradicen.

#### Scenario: Dos oráculos se contradicen
- **WHEN** la documentación y otra parte del producto muestran valores distintos para el mismo dato
- **THEN** el plan indica qué oráculo prevalece y el caso o defecto lo nombra como argumento

### Requirement: Uso de IA declarado
El plan SHALL describir qué herramientas de IA se usaron, para qué tareas, y qué decisiones quedaron en manos de la persona evaluada.

#### Scenario: Revisor pregunta por la IA
- **WHEN** un revisor quiere saber cómo se usó la IA
- **THEN** el plan lo explica en una sección propia, sin ambigüedad sobre qué validó una persona

### Requirement: Resumen ejecutivo reservado
El plan SHALL contener una sección "Resumen ejecutivo" que, al cierre de la prueba, MUST responder si se libera el build a producción, por qué y qué riesgos quedan abiertos.

#### Scenario: Cierre de la prueba
- **WHEN** se terminan la ejecución y el reporte de defectos
- **THEN** la sección "Resumen ejecutivo" queda completa con la decisión de liberación y los riesgos abiertos
