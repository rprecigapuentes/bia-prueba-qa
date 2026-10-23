# e2e-api Specification

## Purpose
Define la automatización de API de la entrega: los tests derivados de cada técnica de diseño de la caja negra y los tests de API que evidencian defectos abiertos.

## Requirements

### Requirement: Tests por técnica de diseño
La suite SHALL tener tests de API para particiones de equivalencia (login, búsqueda, estado), valores límite (`size`, `page`), la tabla de decisión tipo → estado, el orden de prioridad y las negativas de autenticación, y cada test MUST nombrar el `TC-xx` del que sale.

#### Scenario: Trazabilidad con la caja negra
- **WHEN** un revisor busca la automatización de un caso de `qa/03`
- **THEN** encuentra un test con su `TC-xx` en el título

### Requirement: Tablas como datos
Cada tabla de la caja negra SHALL representarse una sola vez como datos tipados o como archivo versionado, y MUST recorrerse con un único test parametrizado que produce un resultado por fila.

#### Scenario: Agregar una fila
- **WHEN** se agrega una fila a una tabla de datos
- **THEN** aparece un test nuevo en el reporte sin tocar el código del test

### Requirement: Pairwise ejecutable
Las 30 combinaciones de `qa/evidencias/pairwise/getall.pict.out.tsv` SHALL ejecutarse como tests de API que evalúan filtro, búsqueda, conteo y orden contra el oráculo.

#### Scenario: Regenerar el modelo
- **WHEN** se regenera la salida de PICT
- **THEN** la suite ejecuta las combinaciones nuevas sin cambios de código

### Requirement: Defectos de API evidenciados
Los defectos BUG-01, BUG-04 y BUG-05 SHALL tener un test de API con `test.fail()` que afirma el comportamiento documentado y nombra el `BUG-xx`.

#### Scenario: Suite principal en verde
- **WHEN** se ejecuta la suite completa con defectos abiertos
- **THEN** los tests de técnica pasan y solo los tests `@defect` fallan, como esperado
