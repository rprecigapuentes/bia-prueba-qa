# Spec Delta

## Purpose

Define la ejecución continua de la suite: un workflow que levanta la app con Docker, corre los controles estáticos y la suite completa, y publica la evidencia.

## ADDED Requirements

### Requirement: Pipeline que levanta la app
El workflow SHALL levantar la app con `docker compose`, MUST esperar a que `/health` responda antes de probar y MUST correr lint, typecheck y la suite completa.

#### Scenario: Pull request
- **WHEN** se abre o actualiza un pull request
- **THEN** el workflow corre contra la app del propio commit y su estado aparece en el PR

### Requirement: Evidencia publicada
El workflow SHALL publicar el reporte HTML de Playwright como artefacto en cada ejecución, y MUST publicar trazas y videos cuando un test falla de forma inesperada.

#### Scenario: Fallo en CI
- **WHEN** un test falla en CI
- **THEN** el artefacto contiene su traza y su video
