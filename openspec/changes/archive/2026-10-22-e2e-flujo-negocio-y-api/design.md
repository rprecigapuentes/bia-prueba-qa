# Design

## Context

El framework separa tests, fixtures, Page Objects y cliente de API, y el oráculo vive en `src/data/oracle.data.ts`. La caja negra dejó tablas explícitas (particiones, límites, decisión, pairwise) y 9 candidatos a defecto con evidencia. Los tests de este change traducen esas tablas a código sin reescribir el diseño.

## Goals / Non-Goals

**Goals:**
- Que cada test cite el caso de diseño del que sale (`TC-xx` o `BUG-xx`) en su título.
- Que una tabla de la caja negra sea una tabla de datos en `src/data/` y un solo test parametrizado, no N tests copiados.
- Que un defecto corregido haga fallar su `test.fail()` y obligue a quitar la marca.

**Non-Goals:**
- Un generador de casos en tiempo de ejecución; PICT ya generó las combinaciones y el archivo es la fuente.

## Decisions

### Tests data-driven

Cada tabla del oráculo (`boundaries.data.ts`, `partitions.data.ts`, `decision-table.data.ts`) es un arreglo tipado. El spec la recorre con `for (const row of TABLE) test(\`${row.id} ...\`, ...)`, así cada fila aparece como un test propio en el reporte. Las 30 filas pairwise se leen del `.tsv` versionado en `qa/evidencias/pairwise/`, de modo que el modelo PICT y la suite no se separan. Alternativa descartada: copiar las combinaciones a TypeScript, que duplicaría la fuente.

### Defectos

`tests/defects/` contiene un archivo por defecto con la etiqueta `@defect`. Cada test:

- declara `test.fail()` y una anotación `{ type: 'issue', description: <url> }`;
- afirma el comportamiento documentado, no el actual.

Hoy falla, y Playwright lo reporta como "esperado". Si alguien corrige el defecto, el test pasa, Playwright lo marca como fallo inesperado y obliga a quitar `test.fail()`. Los tests de negocio y de API por técnica no incluyen las aserciones afectadas por un defecto conocido; esas aserciones viven solo en `tests/defects/`, para que la suite principal no quede en rojo por defectos ya reportados.

### CI

El job usa `ubuntu-latest` con Docker:

1. `docker compose up -d --build`.
2. Espera `/health` con `curl --retry`.
3. `npm ci` y `npx playwright install --with-deps chromium firefox`.
4. `npm run lint`, `npm run typecheck` y `npm test`.

Sube `playwright-report/` siempre, y `test-results/` cuando algo falla. Se ejecuta en `push` a `main`, en `pull_request` y en `workflow_dispatch`.

## Risks / Trade-offs

- [Los issues aún no existen cuando se escriben los tests] → la anotación apunta al reporte en `qa/05-defectos.md#bug-xx`. `qa-reporte-defectos` la cambia por el enlace al issue.
- [El job de CI tarda por el build de Docker] → se acepta; es un solo job y la suite corre en segundos.
- [El orden de severidad ASC/DESC no está documentado] → el test de orden verifica monotonía y sentido natural, y el sentido queda escrito como decisión en el test.
