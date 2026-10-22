# Tasks

## 1. Configuración y calidad estática

- [x] 1.1 Configurar `playwright.config.ts` con proyectos `setup`, `chromium`, `firefox` y `api`, `timezoneId`/`locale`, reportes HTML y lista, y traza, captura y video en fallo; verificar con `npx playwright test --list`
- [x] 1.2 Agregar `src/config/env.ts` con `BASE_URL`, `API_URL` y credenciales con defaults locales; verificar `npm run typecheck`
- [x] 1.3 Agregar ESLint con `eslint-plugin-playwright` y los scripts `test`, `test:smoke`, `test:api`, `lint`, `typecheck`, `report`; verificar que `npm run lint` falla con un `waitForTimeout` de prueba y pasa sin él

## 2. Capas

- [x] 2.1 Escribir `src/data/oracle.ts` con los valores de la documentación y su fuente; verificar `npm run typecheck`
- [x] 2.2 Escribir `src/api/EnergiaApi.ts` (login, meters, anomalies, dashboard, ai) sobre `APIRequestContext`; verificar con los tests de humo de API
- [x] 2.3 Escribir los componentes `AppHeader` y `Pagination` y los Page Objects de las seis pantallas con locators por rol, label o texto; verificar con los tests de humo de UI
- [x] 2.4 Escribir `src/fixtures/test.ts` con Page Objects y un cliente de API autenticado por worker; verificar que ningún test importa `@playwright/test` directo

## 3. Autenticación y humo

- [x] 3.1 Escribir `tests/setup/auth.setup.ts` que guarda `storageState` en `.auth/` (ignorado por git); verificar que los tests de UI arrancan autenticados
- [x] 3.2 Automatizar SM-01..SM-10 con la etiqueta `@smoke`; verificar que `npm run test:smoke` pasa en Chromium, Firefox y API
- [x] 3.3 Reemplazar el seed genérico por uno autenticado sobre las fixtures; verificar que el planner de Playwright lo puede usar

## 4. Documentación

- [x] 4.1 Escribir `e2e/README.md` con requisitos, instalación, el comando único, scripts, estructura y reglas de capas; verificar siguiendo el README desde cero en un clon limpio
