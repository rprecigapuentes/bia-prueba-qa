# EnergIA · Suite de Playwright

Automatización de la prueba técnica de QA: humo, flujo de negocio, API y defectos sobre la app levantada con Docker. Playwright + TypeScript.

## Requisitos

- Node 20 o superior (probado con Node 24).
- La app corriendo desde la raíz del repo: `docker compose up -d --build` (front en http://localhost:3000, API en http://localhost:8080).

## Instalar y correr

Una vez, para instalar dependencias y los navegadores:

```bash
cd e2e
npm run setup
```

Toda la suite, con un solo comando:

```bash
npm test
```

El reporte HTML queda en `playwright-report/`. Se abre con `npm run report`. Traza, captura y video se guardan solo de los tests que fallan.

| Script | Qué corre |
|---|---|
| `npm test` | Todo: proyectos `setup`, `chromium`, `firefox` y `api` |
| `npm run test:smoke` | Solo `@smoke` (los casos de `qa/02-smoke.md`) |
| `npm run test:regression` | Solo `@regression` (flujo de negocio y tests por técnica de diseño) |
| `npm run test:defects` | Solo `@defect` (tests que evidencian defectos abiertos) |
| `npm run test:api` | Solo la API, sin navegador |
| `npm run test:ui` | Solo la UI, en Chromium y Firefox |
| `npm run lint` | ESLint con `eslint-plugin-playwright` |
| `npm run typecheck` | TypeScript estricto |

Para otro entorno, copia `.env.example` a `.env` y cambia `BASE_URL`, `API_URL` y las credenciales. Sin `.env` se usan los valores locales.

## Proyectos

| Proyecto | Navegador | Zona horaria / locale | Archivos |
|---|---|---|---|
| `setup` | Chromium | America/Bogota, es-CO | `tests/setup/*.setup.ts` |
| `chromium` | Desktop Chrome | America/Bogota, es-CO | `*.ui.spec.ts` |
| `firefox` | Desktop Firefox | America/Bogota, es-CO | `*.ui.spec.ts` |
| `api` | Ninguno | — | `*.api.spec.ts` |

La zona horaria es la de los operadores de planta (`America/Bogota`). Así los tests ven las horas como las ve un usuario real.

## Estructura

```text
e2e/
├── playwright.config.ts
├── src/
│   ├── config/env.ts            # URLs, credenciales, zona horaria, ruta del storageState
│   ├── data/                    # oracle.data.ts (valores esperados, cada uno cita su fuente) y las tablas de qa/03:
│   │                            #   partitions, boundaries, decision-table y pairwise (lee el .tsv de PICT de qa/)
│   ├── api/                     # energia.api.ts (cliente) y energia.types.ts (contrato)
│   ├── components/              # app-header, pagination, analysis-sheet
│   ├── pages/                   # login, dispatch, meter-ledger, meter-detail, anomalies, investigation
│   ├── utils/                   # format.ts (cifras es-CO desde el oráculo) y ordering.ts (orden monótono)
│   └── fixtures/test.ts         # test y expect con Page Objects y API autenticada
└── tests/
    ├── setup/auth.setup.ts      # login por UI una vez → .auth/operator.json
    ├── smoke/                   # @smoke
    ├── business/                # @regression: flujo del operador (libro → detalle → investigación de M-109)
    ├── api/                     # @regression: un spec por técnica (particiones, límites, decisión, prioridad, auth, pairwise)
    ├── defects/                 # @defect: un archivo por defecto, con test.fail()
    └── seed.ui.spec.ts          # punto de partida para los agentes de Playwright
```

## Etiquetas

| Etiqueta | Qué agrupa |
|---|---|
| `@smoke` | Los casos de humo de `qa/02-smoke.md` |
| `@regression` | El flujo de negocio y los tests de API por técnica de diseño. Deben pasar siempre |
| `@defect` | Un test por defecto abierto (BUG-01…BUG-05) que afirma el comportamiento documentado |

Cada test por técnica lleva el `TC-xx` de `qa/03-casos-caja-negra.md` en el título, y cada tabla de la caja negra es un arreglo en `src/data/` recorrido por un único test parametrizado: agregar una fila crea un test nuevo. Las 30 filas pairwise salen de `qa/evidencias/pairwise/getall.pict.out.tsv`; las filas cuya expectativa rompe BUG-01 o BUG-04 se marcan `test.fail()` y se calculan desde los datos.

## Defectos y `test.fail()`

Un test `@defect` afirma lo que la documentación dice, no lo que hace la app hoy. Lleva `test.fail()`, el `BUG-xx` en el título y la anotación `issue` con el enlace al reporte (`qa/05-defectos.md#bug-xx`).

- Con el defecto abierto, la aserción falla y Playwright lo cuenta como **esperado** (no rompe la suite).
- Cuando se corrige el defecto, la aserción pasa y Playwright lo reporta como **fallo inesperado**: hay que quitar `test.fail()` y el test queda como regresión.

Los tests de `@regression` no incluyen las aserciones afectadas por un defecto conocido; viven solo en `tests/defects/`. BUG-06 a BUG-09 quedan como casos manuales: `size` 0 y el estado en minúsculas no están en las tablas de límites ni de particiones.

## Integración continua

`.github/workflows/e2e.yml` corre en `push` a `main`, en `pull_request` y a mano (`workflow_dispatch`). El job:

1. Copia `.env.example` a `.env` y levanta la app con `docker compose up -d --build`.
2. Espera `/health` de la API y la UI con `curl --retry`.
3. Instala Node 22, `npm ci` y los navegadores (`npx playwright install --with-deps chromium firefox`).
4. Corre `npm run lint`, `npm run typecheck` y `npm test`.
5. Sube `playwright-report/` siempre y `test-results/` (trazas y videos) cuando algo falla.

## Reglas

- **Capas:** `tests → fixtures → pages/components/api → config/data`. Un test importa `test` y `expect` desde `src/fixtures/test`, nunca desde `@playwright/test`; el lint lo bloquea.
- **Sin locators en los tests:** los Page Objects exponen acciones y consultas (Locators), y las aserciones viven en el test.
- **Locators:** por rol y nombre accesible, label o texto. Hay dos XPath, cada uno con un comentario que explica por qué: son listas sin nombre accesible.
- **Sin esperas fijas:** solo aserciones web-first y `expect.poll`. `waitForTimeout`, `page.pause` y los locators crudos en tests son error de lint.
- **Login reutilizable:** el proyecto `setup` guarda la sesión con `storageState`. Solo los tests del login usan `NO_SESSION`.
- **Oráculo:** los valores esperados salen de `oracle.data.ts`, no de lo que devuelve la app.

Las convenciones completas (nombres de tests, commits, ramas) están en [`../CONVENTIONS.md`](../CONVENTIONS.md).

## Agentes de Playwright

`.mcp.json` en la raíz levanta el MCP `playwright-test` con esta configuración. Los agentes `playwright-test-planner`, `playwright-test-generator` y `playwright-test-healer` (`.claude/agents/`) parten de `tests/seed.ui.spec.ts`, que ya llega autenticado gracias a las fixtures.
