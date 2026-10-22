# Proposal

## Why

La Parte F se evalúa por cómo está construida la automatización, no solo por lo que prueba: locators robustos, cero esperas fijas, Page Objects o fixtures, datos y configuración separados del test, y login reutilizable. Los tests de negocio, de API y de defectos necesitan esa base antes de escribirse. Hoy `e2e/` solo tiene el andamiaje de `npm init playwright`.

## What Changes

- Configuración de Playwright con estos proyectos:
  - `setup`: login una sola vez y `storageState`.
  - `chromium` y `firefox`: con `timezoneId: America/Bogota` y `locale: es-CO`.
  - `api`: sin navegador, con `request`.
- Reportes: HTML y lista; traza, captura y video se conservan solo en fallo.
- Page Objects por pantalla, con componentes compartidos (barra principal y paginación). Usan locators por rol, label y texto.
- Fixtures con `base.extend` que entregan los Page Objects y un cliente de API ya autenticado.
- Datos de prueba y valores del oráculo en `e2e/src/data/`. URLs y credenciales por variables de entorno, con valores por defecto para local.
- Suite `@smoke` automatizada, que replica los 10 casos de `qa/02-smoke.md`.
- Calidad estática:
  - `tsc --noEmit` en modo estricto.
  - ESLint con `eslint-plugin-playwright`, que falla ante `waitForTimeout`, `page.pause` y selectores frágiles.
- `e2e/README.md` con instalación y ejecución con un solo comando.
- Se elimina el `tests/seed.spec.ts` genérico. Se reemplaza por un seed autenticado que usan los agentes de Playwright.
- Fuera de alcance:
  - El flujo E2E de negocio, los tests de API por técnica y los tests de defectos: van en `e2e-flujo-negocio-y-api` y `qa-reporte-defectos`.
  - El workflow de CI: va en `e2e-ci`.
  - Pruebas visuales y de accesibilidad automatizadas.

## Capabilities

### New Capabilities
- `e2e-framework`: estructura, configuración, autenticación reutilizable, capas (tests → fixtures → Page Objects / cliente API) y reglas de calidad de la automatización.

### Modified Capabilities

## Impact

- `e2e/`: nueva estructura `src/` (pages, components, api, fixtures, data), `tests/setup`, `tests/smoke`, config, ESLint, README.
- `.mcp.json` y los agentes de Playwright siguen apuntando a `e2e/playwright.config.ts`; el seed pasa a ser autenticado.
- No toca `backend/`, `frontend/` ni `qa/`.
