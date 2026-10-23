# Tasks

## 1. Datos

- [ ] 1.1 Escribir `partitions.data.ts`, `boundaries.data.ts` y `decision-table.data.ts` desde las tablas de `qa/03`, y un lector del `.tsv` de PICT; verificar `npm run typecheck`

## 2. API

- [ ] 2.1 Escribir los tests de API por técnica (TC-01, 02, 04, 05, 07, 08, 10, 11, 13, 14, 15) sobre las tablas, sin las aserciones afectadas por defectos conocidos; verificar que `npm run test:api` pasa
- [ ] 2.2 Escribir el test pairwise (TC-16) sobre el `.tsv`, con las filas afectadas por BUG-01 y BUG-04 marcadas como `test.fail()`; verificar 30 resultados en el reporte

## 3. UI

- [ ] 3.1 Escribir el flujo de negocio de M-109 y verificar que pasa en Chromium y en Firefox
- [ ] 3.2 Escribir los tests `@defect` de BUG-01…BUG-05 con `test.fail()` y la anotación del reporte; verificar que Playwright los reporta como fallos esperados

## 4. CI y documentación

- [ ] 4.1 Escribir `.github/workflows/e2e.yml` y verificar que el job pasa en el PR
- [ ] 4.2 Actualizar `e2e/README.md` con las suites nuevas y `@defect`; verificar que los comandos documentados corren
