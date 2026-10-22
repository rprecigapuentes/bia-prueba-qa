# Tasks

## 1. CI

- [x] 1.1 Escribir `ci.yml` con los jobs `static`, `unit-backend`, `unit-frontend`, `known-defects` (no bloqueante) y `smoke` (depende de los tres primeros), y eliminar `e2e.yml`; verificar que el run del PR queda en verde y que `known-defects` lista los BUG

## 2. Continuous Testing

- [x] 2.1 Escribir `continuous-testing.yml` con el cron diario, el `workflow_dispatch` con la suite a elegir, la matriz de 5 jobs aislados con `--shard` y `fail-fast: false`, y el job `report` con `merge-reports`; verificar que el run del PR produce el artefacto `continuous-testing-report` y el resumen

## 3. Documentación

- [x] 3.1 Documentar los dos pipelines en `e2e/README.md` con diagramas y el comando de ejecución manual; verificar que los nombres de los jobs coinciden con los workflows
