# Design

## Context

La app corre con Docker en `http://localhost:3000` (nginx sirve el front y reenvía `/api` al backend) y la API también en `http://localhost:8080`. El front guarda el JWT en `localStorage` (clave `energyai.token`), así que un `storageState` lo captura. La API es de solo lectura salvo `POST /ai/analyze`, que crea un análisis: los tests no necesitan limpieza de datos. El patrón de capas viene de `rprecigapuentes/gitea-ui-automation`, simplificado a un solo paquete porque aquí hay un solo runner.

## Goals / Non-Goals

**Goals:**
- Que un test lea como una frase del negocio y no contenga locators ni URLs.
- Login una vez por ejecución; ningún test de UI pasa por el formulario salvo los que prueban el login.
- Que cambiar un locator toque un solo archivo.
- Que la zona horaria del operador sea la del navegador en todos los proyectos de UI.

**Non-Goals:**
- Soportar Selenium o BDD; no hay un segundo runner que justifique estrategias intercambiables.
- Allure, Healenium o visual testing.

## Decisions

### Capas y estructura

```text
e2e/
├── playwright.config.ts
├── src/
│   ├── config/env.ts          # BASE_URL, API_URL, credenciales (process.env con defaults)
│   ├── data/oracle.ts         # valores esperados citados de la documentación
│   ├── api/EnergiaApi.ts      # cliente tipado sobre APIRequestContext
│   ├── pages/                 # LoginPage, DispatchPage, MeterLedgerPage, MeterDetailPage,
│   │                          # AnomaliesPage, InvestigationPage
│   ├── components/            # AppHeader (navegación, Run AI Analysis, sesión), Pagination
│   └── fixtures/test.ts       # base.extend: pages + api autenticada; exporta test y expect
└── tests/
    ├── setup/auth.setup.ts    # login por UI una vez → .auth/operator.json
    ├── smoke/                 # @smoke (UI y API)
    └── seed.spec.ts           # seed autenticado para los agentes de Playwright
```

Regla de dependencia: `tests → fixtures → pages/components/api → config/data`. Un test nunca importa `@playwright/test` directo ni llama `page.locator` o `page.goto`. Alternativa descartada: Screenplay, que es más expresivo pero sobra para seis pantallas y un día de trabajo.

### Autenticación

Un proyecto `setup` hace login por UI y guarda `storageState` en `e2e/.auth/operator.json` (ignorado por git). Los proyectos de UI dependen de él. El cliente de API obtiene su token con `POST /auth/login` una vez por worker (fixture de alcance `worker`). Alternativa descartada: inyectar el token en `localStorage` sin pasar por la UI; es más rápido, pero el setup por UI además verifica el login en cada ejecución.

### Proyectos

| Proyecto | Navegador | Zona / locale | Tests |
|---|---|---|---|
| `setup` | Chromium | America/Bogota, es-CO | `tests/setup` |
| `chromium` | Desktop Chrome | America/Bogota, es-CO | UI |
| `firefox` | Desktop Firefox | America/Bogota, es-CO | UI |
| `api` | — | — | `*.api.spec.ts` |

Los tests de UI y de API se separan por sufijo de archivo (`*.ui.spec.ts`, `*.api.spec.ts`) para que cada proyecto tome solo los suyos. Las etiquetas (`@smoke`, `@regression`, `@defect`) usan la API de `tag` de Playwright.

### Locators y esperas

Orden de preferencia: `getByRole` con nombre accesible, `getByLabel`, `getByText`, y `getByTestId` solo si la app no expone otra cosa. No hay `data-testid` en la app y no se modifica el front, así que la accesibilidad de la UI es el contrato. Toda espera es una aserción web-first (`expect(locator).toBeVisible()`, `toHaveURL`, `toHaveText`) o una espera de respuesta (`waitForResponse`) cuando se valida contra la API.

### Datos del oráculo

`oracle.ts` contiene los valores que la documentación promete (las 4 anomalías con tipo, severidad, confianza y prioridad, el estado esperado por tipo, cifras de M-109, 12 medidores, tamaño de página por defecto 10). Cada constante cita su fuente en un comentario corto. Los tests comparan contra el oráculo, nunca contra lo que devuelve la propia app.

### Calidad estática

TypeScript `strict`. ESLint flat config con `eslint-plugin-playwright` (recomendado), con `no-wait-for-timeout`, `no-page-pause`, `no-raw-locators` y `prefer-web-first-assertions` como error. Scripts: `test`, `test:smoke`, `test:api`, `lint`, `typecheck`, `report`.

## Risks / Trade-offs

- [La UI no tiene nombres accesibles para algún control] → usar `getByText` acotado dentro de una región con rol, y registrarlo como observación de accesibilidad.
- [Firefox y Chromium formatean fechas distinto] → las aserciones de fecha comparan el texto que la app renderiza, que es responsabilidad de la app y no del navegador.
- [`storageState` caducado si la ejecución pasa de 8 h (`JWT_TTL`)] → el setup corre en cada ejecución.
