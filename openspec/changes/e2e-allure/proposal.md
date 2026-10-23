# Proposal

## Why

El reporte HTML de Playwright existe, pero solo como artefacto de cada shard unido al final, y no muestra la vista de tendencias, categorías y entorno que esperan los equipos de QA. Allure es el estándar de reporte en la industria y en los proyectos de referencia del bootcamp (`gitea-ui-automation`); sumarlo hace la evidencia más legible para quien no corre la suite.

## What Changes

- Reporter `allure-playwright` en `e2e/playwright.config.ts` junto al de lista y al HTML, con información de entorno (app, commit, zona horaria).
- `e2e/allurerc.mjs` (Allure 3) con el reporte en un solo archivo HTML; scripts `report:allure` y `report:allure:open`; `pretest` limpia los resultados anteriores.
- Continuous Testing: cada shard sube sus resultados de Allure y el job `report` genera y publica el artefacto `allure-report`, además del HTML de Playwright.
- `e2e/README.md`: cómo generar Allure y dónde ver los reportes en GitHub.
- Fuera de alcance: historial de tendencias entre ejecuciones (requiere guardar el historial entre runs) y GitHub Pages (repo privado).

## Capabilities

### New Capabilities

### Modified Capabilities
- `e2e-ci`: el reporte consolidado incluye un reporte Allure además del HTML de Playwright.

## Impact

- `e2e/` (dependencias `allure` y `allure-playwright`, config, scripts, README) y `.github/workflows/continuous-testing.yml`. No cambia ningún test.
