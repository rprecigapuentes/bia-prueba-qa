# qa-white-box Specification

## Purpose
Define el entregable de caja blanca: la revisión de los módulos de mayor riesgo, la evaluación de los tests existentes y los tests unitarios propuestos para cada causa raíz encontrada.

## Requirements

### Requirement: Módulos elegidos por riesgo
El documento SHALL revisar al menos dos módulos y cada módulo MUST justificar su elección con un riesgo del plan o con un caso de caja negra que falló.

#### Scenario: Revisor pregunta por qué ese módulo
- **WHEN** un revisor lee la sección de un módulo
- **THEN** encuentra el riesgo o el caso `TC-xx` que lo motivó

### Requirement: Ramas, condiciones y casos borde
Por cada módulo, el documento SHALL enumerar las ramas y condiciones relevantes con archivo y línea, MUST señalar los casos borde y MUST indicar cuáles están cubiertos por algún test existente.

#### Scenario: Rama sin test
- **WHEN** una rama o un límite no tiene test
- **THEN** el documento lo marca como no cubierto y propone el test

### Requirement: Causa raíz trazable
Cada defecto de caja negra que el análisis explica SHALL quedar enlazado a su causa raíz probable (archivo y línea) y al test unitario que lo detecta.

#### Scenario: De síntoma a causa
- **WHEN** se sigue un `BUG-xx` desde la caja negra
- **THEN** el documento muestra el archivo, la línea, la condición defectuosa y el test que lo evidencia

### Requirement: Evaluación de la suite existente
El documento SHALL reportar qué cubren `go test ./...` y `pnpm test`, con la cobertura por paquete medida, MUST identificar los tests que fijan comportamiento contrario a la documentación y la configuración que oculta defectos, y MUST concluir si se confía en la suite y por qué.

#### Scenario: Cobertura alta con defecto
- **WHEN** una función con cobertura de líneas del 100 % contiene un defecto
- **THEN** el documento lo usa como evidencia de que la cobertura no mide corrección

### Requirement: Tests propuestos sin romper la suite
Los tests unitarios nuevos SHALL fallar hoy por el defecto que evidencian, MUST NOT romper `go test ./...` ni `pnpm test` por defecto, y MUST poder ejecutarse con un comando documentado.

#### Scenario: Ejecución de los tests de defectos
- **WHEN** se ejecuta el comando documentado para los tests de defectos
- **THEN** cada test falla con un mensaje que nombra el `BUG-xx`, y la suite normal sigue en verde

### Requirement: Sin cambios en código productivo
El change SHALL agregar solo archivos de test y documentos, y MUST NOT modificar código productivo de `backend/` ni de `frontend/`.

#### Scenario: Revisión del diff
- **WHEN** se revisa el diff del change
- **THEN** los únicos archivos tocados dentro de `backend/` y `frontend/` son tests nuevos
