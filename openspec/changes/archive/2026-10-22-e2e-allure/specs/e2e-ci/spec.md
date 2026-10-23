# Spec Delta

## ADDED Requirements

### Requirement: Reporte Allure
Cada ejecución de la suite SHALL producir resultados de Allure, y Continuous Testing MUST publicar un reporte Allure consolidado de todos los shards como artefacto, en un solo archivo HTML que se abra sin servidor.

#### Scenario: Revisión con Allure
- **WHEN** alguien descarga el artefacto `allure-report` de una ejecución de Continuous Testing
- **THEN** abre `index.html` directamente y ve todos los tests de API, Chromium y Firefox con sus etiquetas y el entorno de la ejecución
