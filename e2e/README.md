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
│   ├── data/oracle.data.ts      # valores esperados según la documentación (cada uno cita su fuente)
│   ├── api/                     # energia.api.ts (cliente) y energia.types.ts (contrato)
│   ├── components/              # app-header, pagination, analysis-sheet
│   ├── pages/                   # login, dispatch, meter-ledger, meter-detail, anomalies, investigation
│   └── fixtures/test.ts         # test y expect con Page Objects y API autenticada
└── tests/
    ├── setup/auth.setup.ts      # login por UI una vez → .auth/operator.json
    ├── smoke/                   # @smoke
    └── seed.ui.spec.ts          # punto de partida para los agentes de Playwright
```

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
