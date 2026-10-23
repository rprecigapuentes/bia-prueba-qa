# Plan de trabajo · Prueba técnica QA (Bia · EnergIA)

Entrega: jueves 22 de octubre de 2026, 10:00 p. m. (America/Bogota), a karen.villamil@bia.app.
Enunciado: [PRUEBA_QA.md](PRUEBA_QA.md). Este documento es el plan de ejecución, no un entregable del enunciado.

## Entorno

| Pieza | Valor |
|---|---|
| Repo de trabajo | WSL `~/github/bia/prueba-qa` (remote `upstream` = biaenergy/prueba-qa) |
| App | `docker compose up -d --build` · front http://localhost:3000 · API/Swagger http://localhost:8080/docs |
| Credenciales | `admin@energia.local` / `admin123` |
| Commit bajo prueba | `026b991` (upstream/main) |
| Zona horaria de prueba | `America/Bogota` (usuarios: operadores de planta en Colombia) |
| Automatización | Playwright 1.64 + TypeScript en `e2e/` |
| SDD | OpenSpec 1.13 (`openspec/`, skills `/opsx:*` en `.claude/`) |
| Agentes de Playwright | planner, generator, healer (`.claude/agents/`) sobre el MCP `playwright-test` (`.mcp.json`) |

## Cómo se usa la IA (para el README de entrega y el video)

- **Claude Code** como par de trabajo: lee el oráculo, propone casos, ejecuta pruebas de API, captura evidencias y escribe el framework. Las decisiones de alcance, riesgo, severidad y prioridad son humanas, y cada defecto se reproduce a mano antes de reportarlo.
- **Spec-Driven Development con OpenSpec**: cada entregable es un *change* (`/opsx:propose` → `proposal.md` + specs + `tasks.md` → `/opsx:apply` → `/opsx:archive`). El historial en `openspec/changes/archive/` muestra qué se pidió, qué se hizo y por qué.
- **Agentes de Playwright dentro de OpenSpec**: el *planner* explora la UI y propone escenarios (`specs/`), el *generator* los convierte en tests sobre los Page Objects y el *healer* repara locators cuando un test falla por la UI y no por un defecto.
- **Transparencia**: al inicio, un subagente hizo un barrido estático del código para ubicar módulos de riesgo. Esos hallazgos se tratan como hipótesis de caja blanca (Parte D). La caja negra (Parte C) se diseña solo desde la documentación y debe llegar al síntoma por su cuenta.

## Changes de OpenSpec

| Orden | Change | Entregable | Dominio |
|---|---|---|---|
| 1 | `qa-plan-de-pruebas` | `qa/01-plan-de-pruebas.md` | qa-plan |
| 2 | `qa-smoke-suite` | `qa/02-smoke.md` + tests `@smoke` | qa-smoke |
| 3 | `e2e-framework` | config, Page Objects, fixtures, `storageState`, proyectos por navegador y zona horaria | e2e-framework |
| 4 | `qa-casos-caja-negra` | `qa/03-casos-caja-negra.md` + `.csv` | qa-black-box |
| 5 | `e2e-flujo-negocio-y-api` | flujo E2E de negocio + tests de API con `request` + pairwise data-driven | e2e-ui, e2e-api |
| 6 | `qa-caja-blanca` | `qa/04-caja-blanca.md` + tests unitarios propuestos | qa-white-box |
| 7 | `qa-reporte-defectos` | `qa/05-defectos.md` + un issue de GitHub por defecto + tests `test.fail()` | qa-defects |
| 8 | `e2e-ci` | workflow de GitHub Actions (compose + suite + reporte HTML) | e2e-ci |

## Fases y horario

Quién: **R** = Rosemberth (manual, decisión, video) · **C** = Claude Code.

| Hora | Fase | R | C |
|---|---|---|---|
| 10:30–11:00 | 0 · Entorno | Revisa la app en el navegador | Docker, OpenSpec, agentes, este plan (hecho) |
| 11:00–12:00 | 1 · Plan de pruebas y smoke | Valida alcance y riesgos | Redacta 01 y 02; ejecuta smoke por API |
| 12:00–12:45 | 2 · Exploratorio | Sesiones con charter (abajo), anota hallazgos | Arma `e2e-framework` en paralelo |
| 12:45–15:00 | 3 · Caja negra | Ejecuta los casos de UI y confirma resultados | Diseña casos, ejecuta los de API, captura evidencias |
| 15:00–17:00 | 4 · Playwright | Revisa y aprueba cada change | Flujo E2E, API, pairwise, tests de defectos |
| 17:00–18:00 | 5 · Caja blanca | Revisa el análisis | 04 + tests unitarios propuestos + cobertura |
| 18:00–18:45 | 6 · Defectos | Asigna severidad y prioridad final, reproduce cada uno | 05 + issues de GitHub |
| 18:45–19:15 | 7 · Resumen ejecutivo y CI | Decide "¿se libera?" | README de entrega, workflow de CI |
| 19:15–21:15 | 8 · Video | Ensaya y graba (guion abajo) | Deja comandos y pantallas listos |
| 21:15–22:00 | 9 · Envío | Sube video, comparte repo, envía correo | Verificación final |

## Orden de técnicas (caja negra)

Se sigue el orden del bootcamp: **exploratorio → funcional → dominio (partición de equivalencia + valores límite) → combinatorio (pairwise)**, y se agregan **tablas de decisión** para las reglas del motor y **consistencia entre capas** (doc vs. API vs. UI), que el enunciado pide explícitamente.

### Charters exploratorios (fase 2, R)

Cada sesión dura 10–12 minutos. Anota: qué probaste, qué viste, qué te sorprendió. Captura de pantalla de cualquier cosa rara (Win+Shift+S) a `qa/evidencias/exploratorio/`.

1. **Libro de medidores**: explora filtros por estado, búsqueda por medidor (prueba `109`, `M-109`, `m-109`, espacios), orden y paginación. ¿Llegas a los 12 medidores? ¿Los filtros sobreviven a recargar y al botón atrás?
2. **Despacho y KPIs**: compara los conteos NORMAL / ALERTA / CRÍTICO con la tabla del README (4 anomalías, 8 normales; M-106 es falso positivo y "no escalar").
3. **Detalle e Investigación de M-109 y M-106**: compara cifras con el README (M-109: 2.207,6 kWh vs 1.052,15 kWh, +109,8 %; detectada 12/09 14:00; confianza 0,95). Mira las horas: deben verse en hora de planta, tal cual.
4. **Run AI Analysis y sesión**: lánzalo dos veces seguidas, cierra la hoja a mitad, recarga. Cierra sesión, usa una URL protegida sin sesión, deep link a `/medidores/M-999`.

### Casos candidatos (fase 3, se eligen 20–25)

| Técnica | Área | Casos |
|---|---|---|
| Partición de equivalencia | Login | válido · email en mayúsculas · contraseña incorrecta · email inexistente · campos vacíos · email mal formado |
| Partición de equivalencia | Búsqueda `meter_id` | parcial (`109`) · completo (`M-109`) · minúsculas (`m-109`) · sin coincidencias (`M-999`) · espacios · vacío |
| Partición de equivalencia | Filtro de estado | `NORMAL` · `ALERT` · `CRITICAL` · valor inválido · vacío |
| Valores límite | Paginación API (`size` 1..100, `page` ≥ 1) | `size` 0, 1, 100, 101 · `page` -1, 0, 1, 2 (última), 3 (fuera de rango) |
| Valores límite | Paginación UI (12 medidores, 10 por página) | primera página, última página, transición 10→11 |
| Tabla de decisión | Tipo → estado | sin anomalía, REAL/HIGH, DATA_QUALITY/HIGH, EXPLAINABLE/MEDIUM, FALSE_POSITIVE/LOW contra M-101, M-109, M-112, M-104, M-106 |
| Tabla de decisión | Prioridad | severidad → energía en juego → confianza (orden M-109, M-112, M-104, M-106) |
| Combinatorio (pairwise, PICT) | `getAll` | estado × `sort_by` × `sort_order` × clase de búsqueda, ejecutado como test data-driven de API |
| Negativas | Seguridad de la API | sin token (401) · token alterado · `sort_by` inválido (400 con formato de error) · `getById/M-999` (404) |
| Consistencia entre capas | Dashboard / libro / detalle | conteos por estado, consumo, baseline, variación, fechas de detección: doc vs. API vs. UI |
| Estado y flujo | URL y sesión | filtros en la URL tras recargar y volver · ruta protegida sin sesión · Run AI Analysis concurrente |
| UI y accesibilidad | Presentación | formato es-CO (coma decimal), estado no depende solo del color, ruta inexistente, teclado en tablas y filtros |

## Evidencias

- **UI**: capturas con un spec de evidencias de Playwright (`e2e/tests/evidence/`), con `timezoneId: America/Bogota`, que guarda en `qa/evidencias/<BUG-xx|TC-xx>/`. Se pueden regenerar con un comando y no dependen de capturas a mano.
- **API**: `curl -i` de request y response guardado en `qa/evidencias/<id>/*.txt`.
- **Exploratorio**: capturas manuales de R en `qa/evidencias/exploratorio/`.
- **Playwright**: reporte HTML, traza y video en fallo.

## Guion del video (≤ 15 min)

| Min | Bloque | Qué se muestra |
|---|---|---|
| 0:00–1:00 | Contexto | Qué es EnergIA, qué se probó, cómo se usó la IA (Claude Code + OpenSpec + agentes de Playwright) |
| 1:00–3:00 | Estrategia | Alcance, matriz de riesgos, pirámide (unitario Go/Vitest → API → UI), criterios de entrada/salida |
| 3:00–4:00 | Smoke | Por qué esos casos; ejecución en vivo de `@smoke` |
| 4:00–7:00 | Diseño de casos | Una técnica por bloque: EP/BVA en paginación, tabla de decisión tipo→estado, modelo PICT y su ejecución |
| 7:00–10:30 | Defectos | Reproducción en pantalla de los 3–4 más graves, severidad vs. prioridad, causa raíz |
| 10:30–12:00 | Caja blanca | Módulos revisados, cobertura vs. corrección (líneas cubiertas al 100 % y aun así con bug), tests que fijan el comportamiento incorrecto |
| 12:00–14:00 | Playwright | Estructura (POM, fixtures, `storageState`), ejecución multi-navegador con zona horaria, `test.fail()`, reporte HTML, CI |
| 14:00–15:00 | Resumen ejecutivo | ¿Se libera? No, y por qué; riesgos abiertos |

## Decisiones tomadas

- **Repo de entrega:** repo propio `rprecigapuentes/bia-prueba-qa`, privado durante el trabajo y público al entregar.
- **Issues de defectos:** uno por defecto en ese repo (#13–#21).
- **Trabajo por PR:** cada change de OpenSpec pasó por propuesta e implementación revisadas (ver `CONVENTIONS.md`).
