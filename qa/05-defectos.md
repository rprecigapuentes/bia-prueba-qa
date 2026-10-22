# Reporte de defectos · EnergIA

Defectos del build `026b991` encontrados por la caja negra ([`03`](03-casos-caja-negra.md)) y explicados por la caja blanca ([`04`](04-caja-blanca.md)). Cada reporte argumenta su resultado esperado con un oráculo HICCUPPS (ver [`01`](01-plan-de-pruebas.md)) y separa severidad (cuánto daño hace) de prioridad (qué tan pronto corregirlo).

**Entorno común:**

- Sistema: Windows 11 Pro con WSL Ubuntu 26.04 y Docker Compose (`docker compose up -d --build`, `.env` copiado de `.env.example`).
- App: front en http://localhost:3000 y API en http://localhost:8080.
- Commit `026b991`.
- UI en Chromium 156.0.8078.4 (Playwright 1.64.1) y Firefox 157, con locale `es-CO` y zona horaria `America/Bogota` salvo que el reporte diga otra cosa.
- Usuario `admin@energia.local`.

## Índice

| ID | Título | Severidad | Prioridad | Encontrado por | Issue |
|---|---|---|---|---|---|
| [BUG-01](#bug-01) | Un falso positivo (M-106) aparece en estado Alerta en lugar de Normal | Alta | Alta | TC-09, TC-13, TC-16, TC-17 | [#13](https://github.com/rprecigapuentes/bia-prueba-qa/issues/13) |
| [BUG-02](#bug-02) | Las horas de planta se muestran convertidas a la zona del navegador (5 h antes en Colombia) | Alta | Alta | TC-20 | [#14](https://github.com/rprecigapuentes/bia-prueba-qa/issues/14) |
| [BUG-03](#bug-03) | La paginación del libro no permite pasar a la página 2: M-111 y M-112 quedan inalcanzables | Media | Alta | TC-12 | [#15](https://github.com/rprecigapuentes/bia-prueba-qa/issues/15) |
| [BUG-04](#bug-04) | La búsqueda por medidor distingue mayúsculas: "m-109" no encuentra M-109 | Media | Media | TC-06, TC-16 | [#16](https://github.com/rprecigapuentes/bia-prueba-qa/issues/16) |
| [BUG-05](#bug-05) | `page` negativa en `POST /meter/getAll` responde 500 en lugar de 400 | Media | Baja | TC-11 | [#17](https://github.com/rprecigapuentes/bia-prueba-qa/issues/17) |
| [BUG-06](#bug-06) | `size: 0` en `POST /meter/getAll` se acepta como 10 en lugar de rechazarse | Baja | Baja | TC-10 | [#18](https://github.com/rprecigapuentes/bia-prueba-qa/issues/18) |
| [BUG-08](#bug-08) | Despacho dice "3 órdenes abiertas" mientras numera "Orden 1 de 4" | Baja | Media | TC-18 | [#19](https://github.com/rprecigapuentes/bia-prueba-qa/issues/19) |
| [BUG-09](#bug-09) | Textos en inglés y códigos internos visibles en una interfaz en español | Baja | Baja | TC-25 | [#20](https://github.com/rprecigapuentes/bia-prueba-qa/issues/20) |
| [BUG-10](#bug-10) | La severidad de una anomalía real usa "≥" donde la regla dice "supera" | Media | Baja | Caja blanca | [#21](https://github.com/rprecigapuentes/bia-prueba-qa/issues/21) |

**Retirado:** BUG-07 ("`status` en minúsculas se acepta"). La caja blanca muestra que la conversión a mayúsculas es intencional (`meter/dto.go:49`) y que un test la fija como comportamiento esperado (`meter/service_test.go:61`). Queda como observación de contrato: el Swagger documenta el enum en mayúsculas sin mencionar esa tolerancia.

**Escalas:**

- **Severidad:** **Alta** = el operador toma una decisión equivocada o pierde información crítica; **Media** = una función falla pero hay un camino alternativo; **Baja** = presentación o contrato, sin efecto en la decisión.
- **Prioridad:** **Alta** = corregir antes de liberar; **Media** = en la siguiente iteración; **Baja** = cuando haya capacidad.

## Evidencia visual

Capturas anotadas, con un círculo sobre el elemento que prueba el defecto y lo que la documentación espera. Las genera un script reproducible (`node qa/evidencias/anotadas/capture-annotated.mjs`), con Chromium en `America/Bogota`.

| Defecto | Captura |
|---|---|
| BUG-01 | [KPIs de Despacho](evidencias/anotadas/BUG-01-kpis-despacho.png) · [filtro Alertas](evidencias/anotadas/BUG-01-filtro-alertas.png) |
| BUG-02 | [Detectada 09:00 vs. "desde 12/09 14:00"](evidencias/anotadas/BUG-02-hora-despacho.png) |
| BUG-03 | [Siguiente deshabilitado](evidencias/anotadas/BUG-03-paginacion.png) |
| BUG-04 | [Búsqueda en minúsculas](evidencias/anotadas/BUG-04-busqueda-minusculas.png) |
| BUG-08 | [3 órdenes abiertas vs. Orden 1 de 4](evidencias/anotadas/BUG-08-ordenes-despacho.png) |
| BUG-09 | [Texto en inglés en M-104](evidencias/anotadas/BUG-09-ingles-m104.png) |

Ejecuciones grabadas de Playwright (video `.webm` y trace `.zip`, que se abre con `npx playwright show-trace <archivo>` o en https://trace.playwright.dev):

| Test | Video | Trace |
|---|---|---|
| Flujo de negocio M-109 (TC-19) | [webm](evidencias/e2e/flujo-negocio-m109.webm) | [trace](evidencias/e2e/flujo-negocio-m109.trace.zip) |
| BUG-02 hora de planta (`test.fail()`) | [webm](evidencias/e2e/bug-02-hora-planta.webm) | [trace](evidencias/e2e/bug-02-hora-planta.trace.zip) |
| BUG-03 paginación (`test.fail()`) | [webm](evidencias/e2e/bug-03-paginacion.webm) | [trace](evidencias/e2e/bug-03-paginacion.trace.zip) |

## BUG-01

**Un falso positivo (M-106) aparece en estado Alerta en lugar de Normal**

- **Severidad: Alta.** El motor concluye que M-106 es un falso positivo ("No escalar"), pero el libro, el detalle, el filtro y los KPIs lo presentan como Alerta. Un operador que trabaja por estado escala un caso que el producto mismo dice no escalar, y el conteo de la planta queda mal (8 normales, 2 alertas, 2 críticas en vez de 9, 1 y 2).
- **Prioridad: Alta.** Se ve en la primera pantalla (KPIs de Despacho) para cualquier usuario y contradice la tabla de estados de la documentación. La corrección es local: una rama en una función.
- **Pasos:**
  1. `POST /api/v1/meter/getAll` con `{"pagination":{"size":100},"filter":{"status":"ALERT"}}`.
  2. `GET /api/v1/meter/getById/M-106`.
  3. `GET /api/v1/dashboard/getSummary`.
  4. En la UI: Medidores → filtro "Alertas"; Despacho → KPI "Medidores".
- **Datos:** M-106 (`anomaly_type: FALSE_POSITIVE`, severidad `LOW`).
- **Esperado:** M-106 en `NORMAL`; el filtro `ALERT` devuelve solo M-104; los conteos son 9 / 1 / 2.
  - **Claims:** `backend/README.md`, "Estado de alerta de un medidor": "Sin anomalía, o `FALSE_POSITIVE` → `NORMAL`".
  - **Product:** la misma pantalla de Despacho marca la tarjeta de M-106 como "No escalar".
  - **Purpose:** "quiet when things are fine" (`PRODUCT.md`).
- **Obtenido:** M-106 tiene `status: "ALERT"` en `getAll` y en `getById`. El filtro `ALERT` devuelve M-104 y M-106 (`count: 2`). `status_counts` es `{normal: 8, alert: 2, critical: 2}`. La UI muestra el sello "Alerta" y el KPI "8 normales · 2 alerta · 2 críticas".
- **Evidencia:**
  - API: [`TC-09/api.txt`](evidencias/TC-09/api.txt), [`TC-13/api.txt`](evidencias/TC-13/api.txt), [`TC-17/api.txt`](evidencias/TC-17/api.txt).
  - Capturas: [`TC-09/ui-1-filtro-alertas.png`](evidencias/TC-09/ui-1-filtro-alertas.png), [`TC-17/`](evidencias/TC-17/).
  - Pairwise: 6 de las 30 combinaciones fallan por este defecto ([`getall.results.csv`](evidencias/pairwise/getall.results.csv)).
- **Causa raíz probable:** `backend/internal/meter/enums.go:29-38`. `StatusOf` no tiene la rama `Type == FALSE_POSITIVE → NORMAL` que su comentario (`:26`) promete; un falso positivo (severidad `LOW`) cae en `default → ALERT`.
- **Detección automática:**
  - Unitario: `TestBUG01_*` en `backend/internal/meter/meter_defects_test.go` (`go test -tags defects`).
  - E2E: `e2e/tests/defects/bug-01-false-positive-status.api.spec.ts` y `.ui.spec.ts`.
  - Además, `server_test.go:131` fija hoy 8/2/2 y debe corregirse junto con el código.
- **Maximize:** afecta todo lo que deriva del estado: el filtro, el orden por estado, los conteos y el sello en el libro y el detalle. No afecta el tipo, la severidad ni la prioridad de la anomalía, que se calculan antes.

## BUG-02

**Las horas de planta se muestran convertidas a la zona del navegador (5 h antes en Colombia)**

- **Severidad: Alta.** Las horas de las lecturas son hora de planta y deben verse tal cual. En un navegador de Colombia todas se ven 5 h antes: la anomalía de M-109, que empezó el 12/09 a las 14:00, se muestra como "Detectada 12/09 09:00". Un operador que investiga en sitio buscaría la causa en la ventana equivocada. En la misma pantalla, el texto de la IA dice "desde 12/09 14:00" y la tarjeta "Detectada 12/09 09:00": el producto se contradice a sí mismo.
- **Prioridad: Alta.** Afecta a todos los usuarios previstos (operadores en Colombia), en todas las pantallas con horas, y la corrección es de una línea.
- **Entorno específico:** navegador con zona `America/Bogota` (UTC−5). Con un navegador en UTC el defecto no se ve, y por eso los tests existentes no lo detectan.
- **Pasos:**
  1. Abrir Despacho y leer "Detectada" en la orden de M-109.
  2. Abrir Anomalías IA, columna "Detectada".
  3. Abrir la investigación de M-109: "Detectada" y "Desde".
  4. Abrir Medidores, columna "Última lectura".
  5. Comparar con `detected_at` y `last_reading_at` de la API.
- **Datos:** M-109, `detected_at: 2026-09-12T14:00:00Z`; `last_reading_at: 2026-09-14T23:00:00Z`.
- **Esperado:** "12/09 14:00" como detección y "14/09 23:00" como última lectura.
  - **Claims:** `frontend/README.md`: "se muestran tal como vienen, sin convertirlas a la zona del navegador"; `PRODUCT.md`: "never convert them to the browser's time zone".
  - **Product:** el texto de la IA, en la misma tarjeta, dice "desde 12/09 14:00".
  - **User desires:** el operador está en Colombia.
- **Obtenido:**
  - Detección "12/09 09:00" en Despacho, Anomalías e Investigación ("Desde 12/09 09:00").
  - Última lectura "14/09 18:00" en el libro y el detalle.
  - M-112 aparece "12/09 19:00" cuando la API dice `2026-09-13T00:00:00Z`: también se corre el día.
- **Evidencia:** [`TC-20/api.txt`](evidencias/TC-20/api.txt), [`TC-20/ui-1-despacho-detectada.png`](evidencias/TC-20/ui-1-despacho-detectada.png), [`ui-3-investigacion-detectada.png`](evidencias/TC-20/ui-3-investigacion-detectada.png), [`ui-5-detalle-ultima-lectura.png`](evidencias/TC-20/ui-5-detalle-ultima-lectura.png).
- **Causa raíz probable:** `frontend/src/lib/format.ts:55-58`. `formatPlantTime` usa `getDate`, `getMonth` y `getHours` (hora local) en lugar de `getUTC*`, contra lo que dice su comentario (`:51-52`). `vite.config.ts:33` fuerza `TZ=UTC` en los tests y oculta el defecto.
- **Detección automática:**
  - Unitario: `frontend/src/lib/format.defects.test.ts`, que corre con `TZ=America/Bogota`.
  - E2E: `e2e/tests/defects/bug-02-plant-time.ui.spec.ts`, que corre con `timezoneId: America/Bogota`.
- **Maximize:** afecta todas las horas de planta observadas (detección, inicio de ventana, eventos y última lectura). No afecta las fechas sin hora (`formatPlantDay`, que ya usa UTC) ni la hora real del último análisis, que sí debe ir en zona local.

## BUG-03

**La paginación del libro no permite pasar a la página 2: M-111 y M-112 quedan inalcanzables**

- **Severidad: Media.** En el libro sin filtros, "Anterior" y "Siguiente" están deshabilitados, y M-111 y M-112 no aparecen. M-112 es una de las dos críticas. Hay caminos alternativos (la tarjeta de Despacho, el filtro "Críticas", ordenar, o escribir `?pagina=2` en la URL), por eso no es Alta.
- **Prioridad: Alta.** Es el primer uso del libro, cualquier operador lo encuentra, y oculta justamente un medidor crítico. La corrección es de una línea. Severidad y prioridad difieren porque existe un camino alternativo, pero la visibilidad y el bajo costo de corregirlo justifican hacerlo antes de liberar.
- **Pasos:**
  1. Abrir Medidores sin filtros.
  2. Leer el resumen de la paginación.
  3. Pulsar "Siguiente".
- **Datos:** 12 medidores, 10 por página.
- **Esperado:** "1–10 de 12 medidores" con "Siguiente" habilitado; en la página 2, "11–12 de 12 medidores" con M-111 y M-112.
  - **Claims:** `PRODUCT.md`, 12 medidores; `backend/README.md`, página por defecto de 10.
  - **Product:** la API devuelve la página 2 y la UI la muestra si se escribe `?pagina=2`.
- **Obtenido:** "1–10 de 12 medidores" con los dos botones con atributo `disabled`; pulsar "Siguiente" no hace nada.
- **Evidencia:** [`TC-12/ui-1-pagina-1.png`](evidencias/TC-12/ui-1-pagina-1.png), [`ui-2-tras-pulsar-siguiente.png`](evidencias/TC-12/ui-2-tras-pulsar-siguiente.png), [`ui-3-pagina-2-por-url.png`](evidencias/TC-12/ui-3-pagina-2-por-url.png).
- **Causa raíz probable:** `frontend/src/features/meters/components/Pagination.tsx:13` calcula las páginas con `Math.floor(count / size)` (= 1) en lugar de `Math.ceil` (= 2). "Siguiente" se deshabilita con `page >= pages` (`:30`).
- **Detección automática:**
  - Unitario: `frontend/src/features/meters/components/Pagination.defects.test.tsx`.
  - E2E: `e2e/tests/defects/bug-03-ledger-pagination.ui.spec.ts`.
- **Maximize:** pasa con cualquier resultado cuyo total no sea múltiplo de 10. Con 20 resultados funcionaría (test de control). El componente no tiene tests.

## BUG-04

**La búsqueda por medidor distingue mayúsculas: "m-109" no encuentra M-109**

- **Severidad: Media.** La búsqueda devuelve "Ningún medidor coincide" para un medidor que existe. El operador puede reescribir en mayúsculas, pero lo natural es concluir que el medidor no existe.
- **Prioridad: Media.** Contradice la documentación de forma explícita, y la corrección es de una línea.
- **Pasos:**
  1. `POST /api/v1/meter/getAll` con `{"filter":{"meter_id":"m-109"}}`.
  2. En la UI, Medidores → buscar `m-109`.
- **Esperado:** M-109 en los dos casos.
  - **Claims:** `backend/README.md` y Swagger: "Búsqueda parcial, sin importar mayúsculas".
  - **Product:** `GET /meter/getById/m-109` sí encuentra el medidor.
- **Obtenido:** `count: 0`; la UI muestra "Ningún medidor coincide con los filtros". `m-10` también da 0, frente a los 9 resultados de `M-10`.
- **Evidencia:** [`TC-06/api.txt`](evidencias/TC-06/api.txt), [`TC-06/`](evidencias/TC-06/); 5 combinaciones pairwise ([`getall.results.csv`](evidencias/pairwise/getall.results.csv)).
- **Causa raíz probable:** `backend/internal/meter/service.go:59` usa `strings.Contains` sin normalizar mayúsculas, y `Normalize` (`meter/dto.go:44`) solo recorta espacios.
- **Detección automática:**
  - Unitario: `TestBUG04_SearchIgnoresCase` en `meter_defects_test.go`.
  - E2E: `e2e/tests/defects/bug-04-case-insensitive-search.api.spec.ts`.

## BUG-05

**`page` negativa en `POST /meter/getAll` responde 500 en lugar de 400**

- **Severidad: Media.** Una entrada inválida provoca un pánico en el servidor, que el middleware convierte en 500 "Error interno del servidor". El servicio sigue vivo, pero la respuesta oculta el motivo y rompe el contrato de errores de validación.
- **Prioridad: Baja.** La UI nunca envía páginas negativas (las descarta al leer la URL), así que solo afecta a otros clientes de la API. Severidad y prioridad difieren por eso.
- **Pasos:** `POST /api/v1/meter/getAll` con `{"pagination":{"page":-1,"size":10}}`.
- **Esperado:** 400 con `message: "Filtros inválidos"` y un error en `errors` que nombre `pagination.page`.
  - **Claims:** Swagger, `page minimum: 1`; `backend/README.md`, "Los errores responden siempre con el mismo formato".
  - **Standards:** HTTP, un 4xx para la entrada del cliente.
- **Obtenido:** `500` con `"message":"Error interno del servidor"`.
- **Evidencia:** [`TC-11/api.txt`](evidencias/TC-11/api.txt).
- **Causa raíz probable:**
  - `backend/internal/httpx/paging.go:23-36`: `Normalize` valida `size` pero no `page < 1`.
  - `:48`: `start = (p.Page-1)*p.Size` da negativo.
  - `:54`: `items[start:end]` entra en pánico.
- **Detección automática:**
  - Unitario: `TestBUG05_*` en `paging_defects_test.go`.
  - E2E: `e2e/tests/defects/bug-05-negative-page.api.spec.ts`.

## BUG-06

**`size: 0` en `POST /meter/getAll` se acepta como 10 en lugar de rechazarse**

- **Severidad: Baja.** La respuesta es razonable (la página por defecto), pero contradice el contrato publicado.
- **Prioridad: Baja.** No lo provoca la UI.
- **Pasos:** `POST /api/v1/meter/getAll` con `{"pagination":{"page":1,"size":0}}`.
- **Esperado:** 400.
  - **Claims:** Swagger, `size minimum: 1`.
  - **Product:** `size: 101` sí responde 400 con "pagination.size debe estar entre 1 y 100".
- **Obtenido:** `200` con `size: 10` y 10 filas.
- **Evidencia:** [`TC-10/api.txt`](evidencias/TC-10/api.txt).
- **Causa raíz probable:** `backend/internal/httpx/paging.go:16,27-29`: el `0` de un `int` significa "no enviado" y se reemplaza por 10. No se distingue un `0` explícito de un campo ausente. Se corrige con `*int` o documentando que `0` equivale a ausente.
- **Detección automática:** sin test automatizado por su prioridad baja; el caso manual está en TC-10.

## BUG-08

**Despacho dice "3 órdenes abiertas" mientras numera "Orden 1 de 4"**

- **Severidad: Baja.** Es un texto inconsistente; las cuatro tarjetas y sus acciones son correctas.
- **Prioridad: Media.** Está en la pantalla de inicio y hace dudar de los conteos, justo después de BUG-01, que sí los altera. Es barato de corregir.
- **Pasos:** abrir Despacho; leer el subtítulo y el encabezado de la primera orden.
- **Esperado:** el mismo total en el subtítulo y en la numeración, o una etiqueta que explique la diferencia (por ejemplo, "4 órdenes, 3 por escalar").
  - **Product:** la misma pantalla.
  - **Purpose:** "the first thing the user sees is what needs attention and in what order".
- **Obtenido:** "3 órdenes abiertas, ordenadas por prioridad" y "Orden 1 de 4 · Prioridad máxima", con 4 tarjetas (M-106 marcada "No escalar").
- **Evidencia:** [`TC-18/ui-1-despacho-ordenes.png`](evidencias/TC-18/ui-1-despacho-ordenes.png).
- **Causa raíz probable:** el subtítulo excluye el falso positivo y la numeración no. No se revisó el código de la pantalla.
- **Detección automática:** sin test automatizado; caso manual TC-18.

## BUG-09

**Textos en inglés y códigos internos visibles en una interfaz en español**

- **Severidad: Baja.** No cambia ninguna decisión, pero el operador lee textos en inglés y nombres de enum dentro de frases en español.
- **Prioridad: Baja.** Los textos vienen del dataset de eventos, no de la interfaz.
- **Pasos:** abrir el detalle y la investigación de M-109 y de M-104.
- **Esperado:** textos en español, o al menos sin códigos internos.
  - **Claims:** `PRODUCT.md`: "Spanish interface".
  - **User desires:** el operador no debería leer códigos de programación.
- **Obtenido:** "No operational event reported" (M-109); "coincide con el evento OPERATIONAL_CHANGE (New production line activated)" (M-104); "SCHEDULED_OUTAGE (Scheduled maintenance outage for 12 hours)" (M-106).
- **Evidencia:** [`TC-25/ui-1-detalle-m-109.png`](evidencias/TC-25/ui-1-detalle-m-109.png), [`ui-3-detalle-m-104.png`](evidencias/TC-25/ui-3-detalle-m-104.png).
- **Causa raíz probable:** las descripciones de `backend/data/events.csv` se muestran sin traducir, y el texto del motor interpola el tipo de evento crudo. No se revisó el código de la plantilla.
- **Detección automática:** sin test automatizado; caso manual TC-25.

## BUG-10

**La severidad de una anomalía real usa "≥" donde la regla dice "supera"**

- **Severidad: Media.** En el límite exacto, una anomalía real activa de 50,0 % sale `HIGH` en lugar de `MEDIUM` (y pasa a `CRITICAL`), y una de 20,0 % sale `MEDIUM` en lugar de `LOW`. Eso cambia la prioridad.
- **Prioridad: Baja.** No ocurre con el dataset actual y exige un valor exacto en el límite.
- **Pasos:** no reproducible por la API con el dataset fijo; se reproduce con el test unitario.
- **Esperado:** 50,0 % activo → `MEDIUM`; 50,01 % → `HIGH`; 20,0 % → `LOW`.
  - **Claims:** `backend/README.md`, "8. Severidad": "HIGH si la variación supera 50 % y sigue activa; MEDIUM si supera 20 %".
- **Obtenido:** 50,0 % → `HIGH`; 20,0 % → `MEDIUM`.
- **Evidencia:** [`caja-blanca/go-test-defects.txt`](evidencias/caja-blanca/go-test-defects.txt).
- **Causa raíz probable:** `backend/internal/analysis/classify/classify.go:222` (`p >= 50`) y `:224` (`p >= 20`).
- **Detección automática:** `TestBUG10_SeverityBoundariesAreExclusive` en `severity_defects_test.go`.
