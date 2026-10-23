# Spec Delta

## Purpose

Define el reporte de defectos de la entrega: qué debe contener cada reporte para que un desarrollador lo reproduzca y lo priorice sin preguntar, cómo se publica y cómo alimenta el resumen ejecutivo.

## ADDED Requirements

### Requirement: Reporte completo por defecto
Cada defecto SHALL tener en `qa/05-defectos.md` título, severidad, prioridad, entorno (navegador, SO, zona horaria, commit), pasos, datos, resultado esperado, resultado obtenido, evidencia, causa raíz probable y cómo detectarlo automáticamente.

#### Scenario: Desarrollador recibe el reporte
- **WHEN** un desarrollador lee un reporte
- **THEN** puede reproducir el defecto con los pasos y datos dados, sin pedir información adicional

### Requirement: Severidad y prioridad justificadas por separado
Cada reporte SHALL justificar la severidad (impacto técnico y sobre el operador) y la prioridad (urgencia de corrección) por separado, y MUST explicar por qué difieren cuando difieren.

#### Scenario: Severidad alta, prioridad distinta
- **WHEN** un defecto tiene severidad y prioridad distintas
- **THEN** el reporte dice por qué

### Requirement: Esperado argumentado con oráculos
El resultado esperado SHALL citar al menos un oráculo HICCUPPS con su fuente concreta, y MUST citar más de uno cuando la documentación sola no basta.

#### Scenario: Comportamiento no documentado
- **WHEN** el comportamiento esperado no está escrito en la documentación
- **THEN** el reporte lo argumenta con otro oráculo (Product, Purpose, User desires o Standards)

### Requirement: Evidencia reproducible
Cada reporte SHALL enlazar evidencia en `qa/evidencias/` (captura de UI o `curl -i` con request y response) y el caso `TC-xx` o `SM-xx` que lo encontró.

#### Scenario: Revisor verifica el defecto
- **WHEN** un revisor abre la evidencia enlazada
- **THEN** ve el resultado obtenido descrito en el reporte

### Requirement: Publicación como issue
Cada defecto SHALL tener un issue en el repositorio de entrega con etiquetas de severidad y prioridad, y `qa/05-defectos.md` MUST tener una tabla índice con el enlace a cada issue.

#### Scenario: Navegar del índice al issue
- **WHEN** un revisor pulsa el enlace de un defecto en el índice
- **THEN** llega a su issue con el mismo título, severidad y prioridad

### Requirement: Reproducción humana antes de publicar
Ningún defecto SHALL publicarse como issue sin que Rosemberth lo haya reproducido y haya confirmado su severidad y prioridad.

#### Scenario: Defecto no reproducido
- **WHEN** un candidato no se reproduce a mano
- **THEN** no se publica y queda como observación con la razón

### Requirement: Resumen ejecutivo
La sección "Resumen ejecutivo" de `qa/01-plan-de-pruebas.md` SHALL responder en media página si el build se libera a producción, por qué y qué riesgos quedan abiertos, usando los defectos y la cobertura alcanzada.

#### Scenario: Lectura del cierre
- **WHEN** un responsable lee solo el resumen ejecutivo
- **THEN** conoce la decisión de liberación, los defectos que la bloquean y los riesgos que quedan sin cubrir
