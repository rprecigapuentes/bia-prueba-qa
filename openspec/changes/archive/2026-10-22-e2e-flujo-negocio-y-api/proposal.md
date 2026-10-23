# Proposal

## Why

La Parte F exige como mínimo un flujo E2E de negocio completo y un test que evidencie un defecto. También suma puntos con tests de API usando `request`, ejecución multi-navegador con zona horaria y un workflow de CI que levante la app y corra la suite. El framework (`e2e-framework`) ya existe; falta usarlo para automatizar lo que la caja negra diseñó y ejecutó a mano.

## What Changes

- **Flujo E2E de negocio** (UI, Chromium y Firefox con `America/Bogota`): el operador entra con la sesión guardada y hace este recorrido:
  1. Abre el Libro de medidores.
  2. Filtra por Críticas.
  3. Busca `109` y abre el detalle de M-109.
  4. Valida consumo, baseline, variación y estado contra el oráculo.
  5. Abre la investigación y valida tipo, severidad, confianza, prioridad y la acción recomendada.
- **Tests de API por técnica**, data-driven desde tablas del oráculo:
  - particiones de login, búsqueda y estado;
  - valores límite de `size` y `page`;
  - tabla de decisión tipo → estado;
  - orden de prioridad;
  - negativas de autenticación;
  - las 30 combinaciones pairwise de `qa/evidencias/pairwise/getall.pict.out.tsv`.
- **Tests que evidencian defectos** (`@defect`, `test.fail()` con el `BUG-xx` y el enlace al issue): BUG-01 (API y UI), BUG-02 (UI), BUG-03 (UI), BUG-04 (API) y BUG-05 (API). Fallan hoy y pasarán cuando se corrijan.
- **Workflow de GitHub Actions** (`.github/workflows/e2e.yml`). Levanta la app con `docker compose`, espera `/health`, instala la suite y corre lint, typecheck y `npm test`. Publica el reporte HTML como artefacto.
- Se actualiza `e2e/README.md` con las suites nuevas y la etiqueta `@defect`.
- **Fuera de alcance:**
  - pruebas visuales y de accesibilidad automatizadas;
  - BUG-06…BUG-09, que se dejan como casos manuales por su prioridad baja;
  - el reporte de defectos (`qa-reporte-defectos`).

## Capabilities

### New Capabilities
- `e2e-ui`: el flujo de negocio automatizado en la UI y los tests de UI que evidencian defectos.
- `e2e-api`: los tests de API por técnica de diseño y los tests de API que evidencian defectos.
- `e2e-ci`: la ejecución de la suite en GitHub Actions contra la app levantada con Docker.

### Modified Capabilities

## Impact

- Nuevos:
  - `e2e/tests/business/`, `e2e/tests/api/` y `e2e/tests/defects/`;
  - tablas de datos en `e2e/src/data/`;
  - `.github/workflows/e2e.yml`.
- Si un test lo necesita, puede haber métodos nuevos en los Page Objects. Siguen exponiendo locators y nunca aserciones.
- No toca `backend/`, `frontend/` ni `qa/`.
