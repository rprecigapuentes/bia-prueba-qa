# Spec Delta

## Purpose

Define la automatización de UI de la entrega: el flujo de negocio completo del operador y los tests de UI que evidencian defectos abiertos.

## ADDED Requirements

### Requirement: Flujo de negocio completo
La suite SHALL automatizar el recorrido del operador desde la sesión iniciada hasta la acción recomendada, pasando por el libro filtrado, la búsqueda, el detalle y la investigación, y MUST validar datos de negocio contra el oráculo, no solo la carga de pantallas.

#### Scenario: Recorrido de M-109
- **WHEN** corre el flujo de negocio en Chromium o Firefox
- **THEN** valida estado, consumo, baseline y variación de M-109 en el detalle, y tipo, severidad, confianza, prioridad y acción en la investigación

### Requirement: Defectos de UI evidenciados
Los defectos BUG-01, BUG-02 y BUG-03 SHALL tener un test de UI con `test.fail()` que afirma el comportamiento documentado, nombra el `BUG-xx` en el título y enlaza su reporte.

#### Scenario: Defecto corregido
- **WHEN** se corrige uno de esos defectos
- **THEN** su test pasa, Playwright lo reporta como fallo inesperado y hay que retirar `test.fail()`
