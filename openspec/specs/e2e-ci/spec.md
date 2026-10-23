# e2e-ci Specification

## Purpose
Define la ejecución continua de la suite: un workflow que levanta la app con Docker, corre los controles estáticos y la suite completa, y publica la evidencia.

## Requirements

### Requirement: Pipeline que levanta la app
El workflow de CI SHALL correr en cada pull request y en cada push a `main`. MUST ejecutar primero los controles estáticos y las pruebas unitarias de backend y frontend, y solo si pasan, levantar la app con `docker compose`, esperar a que `/health` responda y correr la suite de humo.

#### Scenario: Pull request
- **WHEN** se abre o actualiza un pull request
- **THEN** el workflow corre contra la app del propio commit y su estado aparece en el PR

#### Scenario: Falla una prueba unitaria
- **WHEN** falla un test unitario de backend o de frontend
- **THEN** el humo no se ejecuta y el PR queda en rojo

### Requirement: Evidencia publicada
El workflow SHALL publicar el reporte HTML de Playwright como artefacto en cada ejecución, y MUST publicar trazas y videos cuando un test falla de forma inesperada.

#### Scenario: Fallo en CI
- **WHEN** un test falla en CI
- **THEN** el artefacto contiene su traza y su video

### Requirement: Defectos conocidos visibles sin bloquear
El CI SHALL ejecutar los tests unitarios de defectos en un job que no bloquea el pipeline, y MUST listar en el resumen de la ejecución los BUG que siguen abiertos.

#### Scenario: Defecto todavía abierto
- **WHEN** un test de defecto falla porque el defecto sigue abierto
- **THEN** el pipeline sigue en verde y el resumen nombra el BUG

### Requirement: Continuous Testing programado y bajo demanda
Un workflow de Continuous Testing SHALL ejecutar la suite completa a diario y MUST poder lanzarse a mano eligiendo la suite (todas, regresión, defectos o humo).

#### Scenario: Ejecución manual
- **WHEN** alguien lanza el workflow con la suite `defects`
- **THEN** solo corren los tests `@defect`

### Requirement: Ejecución paralela y aislada
Continuous Testing SHALL repartir la suite en jobs paralelos por proyecto y shard, cada uno con su propia instancia de la app, y MUST NOT cancelar los demás jobs cuando uno falla.

#### Scenario: Un shard falla
- **WHEN** falla un test en un shard de Firefox
- **THEN** los demás jobs terminan, y el reporte consolidado muestra el fallo con su shard

### Requirement: Reporte consolidado
Continuous Testing SHALL unir los reportes de todos los jobs en un solo reporte HTML publicado como artefacto, y MUST escribir en el resumen de la ejecución los conteos de tests esperados, inesperados, inestables y omitidos.

#### Scenario: Revisión de una ejecución nocturna
- **WHEN** alguien abre una ejecución de Continuous Testing
- **THEN** ve los conteos en el resumen y descarga un único reporte HTML con todos los proyectos
