# Entrega · Prueba técnica QA Funcional & Automation (Bia)

**Rosemberth Preciga** · build bajo prueba `026b991` · 22 de octubre de 2026

**Video (10:19):** https://drive.google.com/file/d/14TfpwnFuSj8CKufQJhPMRujvPvSN9OT6/view?usp=sharing

## Resumen ejecutivo

**No se libera el build a producción.** El motor detecta, clasifica y prioriza bien las cuatro anomalías del dataset. Lo que falla es la capa que se lo muestra al operador, en tres puntos que cambian sus decisiones:

- [BUG-01](qa/05-defectos.md#bug-01): un falso positivo aparece en estado Alerta.
- [BUG-02](qa/05-defectos.md#bug-02): las horas de planta se ven corridas 5 h en Colombia.
- [BUG-03](qa/05-defectos.md#bug-03): la paginación oculta un medidor crítico.

Cada uno se corrige en una o dos líneas. Los riesgos abiertos y la condición de liberación están en [`qa/01-plan-de-pruebas.md`](qa/01-plan-de-pruebas.md#resumen-ejecutivo).

| Resultado | Cifra |
|---|---|
| Humo | 10 / 10 |
| Casos de caja negra | 25 (13 PASA, 12 FALLA), más 30 combinaciones pairwise |
| Defectos | 9 reportados con issue ([#13–#21](https://github.com/rprecigapuentes/bia-prueba-qa/issues?q=label%3Adefecto)); 1 retirado tras la caja blanca |
| Caja blanca | 4 módulos revisados; 6 tests unitarios nuevos que evidencian defectos |
| Automatización | 94 tests de Playwright (API, Chromium, Firefox, `America/Bogota`) en CI y Continuous Testing |

## Mapa del enunciado

| Parte de [PRUEBA_QA.md](PRUEBA_QA.md) | Dónde está |
|---|---|
| A · Estrategia y plan | [`qa/01-plan-de-pruebas.md`](qa/01-plan-de-pruebas.md): alcance, oráculos HICCUPPS, riesgos R1–R9, pirámide, criterios, uso de IA, resumen ejecutivo |
| B · Humo | [`qa/02-smoke.md`](qa/02-smoke.md) y `e2e/tests/smoke/` (`@smoke`) |
| C · Caja negra | [`qa/03-casos-caja-negra.md`](qa/03-casos-caja-negra.md) y [`.csv`](qa/03-casos-caja-negra.csv): sesiones exploratorias, tablas de decisión, EP/BVA, PICT y 25 casos |
| D · Caja blanca | [`qa/04-caja-blanca.md`](qa/04-caja-blanca.md) y los `*_defects_test.go` / `*.defects.test.ts(x)` |
| E · Defectos | [`qa/05-defectos.md`](qa/05-defectos.md), los issues #13–#21 y las capturas anotadas en `qa/evidencias/anotadas/` |
| F · Playwright | [`e2e/`](e2e/README.md): Page Objects, fixtures, `storageState`, API con `request`, `test.fail()`, multi-navegador, `timezoneId`, reportes HTML y Allure, CI |
| Evidencias | [`qa/evidencias/`](qa/evidencias/): `curl -i` por caso, capturas, videos y traces de Playwright |

## Trazabilidad de riesgo a test

| Riesgo | Casos | Defecto | Test automatizado |
|---|---|---|---|
| R1 · Estado de alerta | TC-09, TC-13, TC-17 | BUG-01 | `e2e/tests/defects/bug-01-*`, `TestBUG01_*` |
| R2 · Horas de planta | TC-20 | BUG-02 | `e2e/tests/defects/bug-02-*`, `format.defects.test.ts` |
| R3 · Libro de medidores | TC-05–07, TC-10–12, TC-16, TC-21 | BUG-03, BUG-04, BUG-05, BUG-06 | `bug-03-*`, `bug-04-*`, `bug-05-*`, `tests/api/boundaries`, `tests/api/pairwise` |
| R4 · Priorización y cifras | TC-14, TC-15, TC-19 | BUG-10 (caja blanca) | `tests/business/operator-investigates-m109`, `tests/api/priority`, `TestBUG10_*` |
| R5 · Consistencia | TC-18 | BUG-08 | manual |
| R6–R9 | TC-01–04, TC-08, TC-22–25 | BUG-09 | `tests/api/partitions`, `tests/api/auth-negative` |

## Cómo correrlo

```bash
docker compose up -d --build          # app: http://localhost:3000 · API: http://localhost:8080/docs
cd e2e && npm run setup && npm test   # 94 tests; reporte: npm run report · Allure: npm run report:allure
```

Tests unitarios de defectos (se espera que fallen mientras el defecto siga abierto):

```bash
cd backend && go test -tags defects -run BUG ./internal/meter ./internal/httpx ./internal/analysis/classify
cd frontend && pnpm test
```

**Pipelines** (`.github/workflows/`):

- `ci`: en cada PR, en orden estáticos → unitarios → humo, más el job de defectos conocidos.
- `continuous-testing`: todos los días y a mano, en 5 jobs paralelos, cada uno con su app aislada.

Los reportes de Playwright HTML y Allure quedan en **Actions → run → Artifacts**. El detalle está en [`e2e/README.md`](e2e/README.md#pipelines).

## Cómo se trabajó y uso de IA

- **Spec-Driven Development con OpenSpec.** Cada entregable fue un *change* revisado en dos PR: primero la propuesta (requisitos y tareas) y después la implementación. Quedaron 9 changes archivados en [`openspec/changes/archive/`](openspec/changes/archive/), sus specs en [`openspec/specs/`](openspec/specs/), y 15 PR en el historial.
- **Claude Code** redactó, ejecutó pruebas de API, tomó capturas y escribió código. Los **agentes de Playwright** (planner, generator, healer) trabajaron sobre el MCP.
- **Decisiones humanas:**
  - el alcance, los riesgos, y la severidad y prioridad de cada defecto;
  - las sesiones exploratorias 1 y 4;
  - la reproducción de los defectos;
  - la revisión de cada PR.
- **Diseño de casos:** la caja negra salió solo de la documentación; el código se abrió después.
- **Convenciones de ramas, commits, PR e identificadores:** [`CONVENTIONS.md`](CONVENTIONS.md).

---

# EnergIA · AI Energy Management Platform

> **¿Vienes a presentar la prueba técnica de QA?** Empieza por [PRUEBA_QA.md](PRUEBA_QA.md).

MVP para monitorear medidores eléctricos y usar IA para **detectar, explicar, priorizar y recomendar acciones** sobre anomalías de consumo.

Con 14 días de lecturas horarias de 12 medidores, la plataforma responde lo que necesita un operador: qué está pasando, qué se sale de lo normal, si la anomalía es real, explicable o un problema de calidad de datos, cuál revisar primero y qué hacer.

| Prioridad | Medidor | Resultado | Acción |
|---|---|---|---|
| 1 | M-109 | Anomalía real (+110,5 % sin evento que lo explique) | Investigar en sitio |
| 2 | M-112 | Calidad de datos (voltaje y factor de potencia incoherentes) | Validar el medidor |
| 3 | M-104 | Anomalía explicable (nueva línea productiva) | Actualizar baseline |
| 4 | M-106 | Falso positivo (parada programada) | No escalar |

## Proyecto

Este repo tiene dos aplicaciones y la configuración para correrlas juntas:

| Carpeta | Qué es | Documentación |
|---|---|---|
| [`backend/`](backend/) | API en Go: motor de detección de anomalías, login con JWT, Run AI Analysis y narrador opcional con OpenAI | [backend/README.md](backend/README.md): API, variables de entorno, metodología del motor y tests |
| [`frontend/`](frontend/) | Dashboard en React 19 + Vite + TanStack Query | [frontend/README.md](frontend/README.md): pantallas y arquitectura. El diseño está en [DESIGN.md](frontend/DESIGN.md) y el producto en [PRODUCT.md](frontend/PRODUCT.md) |

```
energy-ai/
├── .env.example         # plantilla de variables (copiar como .env)
├── docker-compose.yml   # backend + frontend
├── backend/             # API en Go (datos en backend/data/*.csv)
└── frontend/            # React, servido por nginx en Docker
```

## Configuración

Hay **un solo `.env`**, en la raíz del proyecto. Lo usan el backend, el frontend y `docker compose`:

```bash
cp .env.example .env
```

Todas las variables son opcionales y tienen un valor por defecto, así que la app arranca sin tocar nada. Las que conviene definir:

| Variable | Para qué |
|---|---|
| `OPENAI_API_KEY` | Si está, Run AI Analysis redacta las explicaciones con OpenAI. Si no, las escribe el motor |
| `JWT_SECRET` | Secreto de los tokens. **Cámbialo fuera de local** |
| `AUTH_EMAIL`, `AUTH_PASSWORD` | Usuario del login (por defecto `admin@energia.local` / `admin123`) |

La lista completa está en [backend/README.md](backend/README.md#variables-de-entorno). El `.env` está en `.gitignore` y nunca se sube al repo.

## Cómo correrlo

### Con Docker

Desde la raíz del proyecto:

```bash
docker compose up -d --build
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API (Swagger) | http://localhost:8080/docs |

nginx sirve el frontend y reenvía `/api` al backend, así que la app funciona desde cualquier IP sin configurar CORS. Para detenerla: `docker compose down`.

### En desarrollo

Se corre cada aplicación en su propia terminal. El frontend se recarga solo al guardar.

```bash
# Terminal 1: backend (Go 1.26+), en http://localhost:8080
cd backend
go run ./cmd/api

# Terminal 2: frontend (Node 20.19+ y pnpm), en http://localhost:5173
cd frontend
pnpm install
pnpm dev
```

El backend se corre desde `backend/`: ahí busca los CSV (`data/`) y el `.env` de la raíz (`../.env`). En desarrollo, Vite reenvía `/api` al backend.

## Despliegue en un servidor

En cualquier máquina con Docker (por ejemplo, una VM o un LXC de Proxmox):

```bash
git clone <url-del-repo> energy-ai
cd energy-ai
cp .env.example .env     # completa JWT_SECRET, AUTH_PASSWORD y OPENAI_API_KEY
docker compose up -d --build
```

Para actualizar: `git pull && docker compose up -d --build`.

El servidor construye las imágenes, así que no hace falta un registro como Docker Hub. Los CSV van dentro de la imagen del backend.

## Tests

```bash
# backend
cd backend
go test ./...

# frontend
cd frontend
pnpm test && pnpm lint && pnpm typecheck
```

El detalle de qué cubre cada suite está en el README de cada aplicación.
