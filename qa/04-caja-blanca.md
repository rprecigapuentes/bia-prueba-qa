# Caja blanca · EnergIA

Revisión del código y de los tests existentes del build `026b991`, después de la caja negra. Los módulos se eligieron por los riesgos del plan y por los casos que fallaron en `qa/03`. Toda referencia es `archivo:línea` dentro de `backend/internal/` o `frontend/src/`. Los comandos y su salida están en [`evidencias/caja-blanca/`](evidencias/caja-blanca/).

## Módulos revisados

| Módulo | Por qué | Riesgo | Casos de caja negra |
|---|---|---|---|
| Estado, filtros y búsqueda (`meter/`) | El estado decide qué escala el operador; la búsqueda decide qué medidores encuentra | R1, R3 | TC-06, TC-09, TC-13, TC-16, TC-17 |
| Paginación (`httpx/paging.go` y `features/meters/components/Pagination.tsx`) | Un medidor inalcanzable es una alerta invisible; una entrada inválida no debe tumbar la API | R3, R6 | TC-10, TC-11, TC-12 |
| Hora de planta (`lib/format.ts`) | Una hora corrida manda a investigar la ventana equivocada | R2 | TC-20 |
| Severidad del motor (`analysis/classify/classify.go`) | Los límites 20 % y 50 % no son alcanzables con el dataset fijo: solo la caja blanca los prueba | R4 | — |

### Estado, filtros y búsqueda

**`StatusOf`** (`meter/enums.go:29-38`) tiene tres ramas:

| Rama | Condición | Resultado | Test existente |
|---|---|---|---|
| 1 | `a == nil` | `NORMAL` | `meter/service_test.go:37` |
| 2 | `a.Severity == HIGH` | `CRITICAL` | `meter/service_test.go:38` |
| 3 | cualquier otro | `ALERT` | `meter/service_test.go:39-40` |

- **Causa raíz de BUG-01.** Falta la rama "`Type == FALSE_POSITIVE` → `NORMAL`". El propio comentario de la función la promete (`meter/enums.go:26`: "sin anomalía, o falso positivo (el motor dice "no escalar"): NORMAL"), igual que el README. Un falso positivo tiene severidad `LOW`, así que cae en la rama 3 y sale `ALERT`. El efecto llega a todo lo que llama a `summarize` (`meter/service.go:100`): el libro, el detalle, el filtro por estado y los conteos del despacho.
- **Por qué no lo detectan los tests.** La tabla de `TestStatusOf` construye anomalías sin el campo `Type`, así que la condición que falta nunca se ejerce. Es un hueco de la tabla de decisión: se prueban severidades, no tipos.
- **Búsqueda: causa raíz de BUG-04.** `GetAll` filtra con `strings.Contains(sm.MeterID, search)` (`meter/service.go:59`) sin normalizar mayúsculas. `Normalize` (`meter/dto.go:44`) solo recorta espacios. La documentación del DTO dice "sin importar mayúsculas" (`meter/dto.go:26`), y `GetByID` sí convierte a mayúsculas (`meter/service.go:74`): el producto es inconsistente consigo mismo. `TestGetAllFilters` (`meter/service_test.go:62-63`) solo busca `109` y `M-11`, ambos ya en mayúsculas.
- **Estado en minúsculas: BUG-07 se retira.** `Normalize` convierte el estado a mayúsculas a propósito (`meter/dto.go:49`). Lo mismo hace con `sort_by` (`:54`) y con `sort_order` (`httpx/paging.go:76-77`). Además hay un test que fija este comportamiento como intencional (`meter/service_test.go:61`, "estado en minúscula"). Es tolerancia de diseño, no un defecto: queda como observación de contrato (el Swagger documenta el enum en mayúsculas).

### Paginación

**`Pagination.Normalize`** (`httpx/paging.go:23-36`) solo valida `size`:

| Condición | Resultado | Test existente |
|---|---|---|
| `page == 0` | se reemplaza por 1 | indirecto |
| `size == 0` | se reemplaza por 10 | indirecto |
| `size < 1 \|\| size > 100` | error | `meter/service_test.go:119` (`size: 500`) |
| `page < 1` | **sin validación** | ninguno |

- **Causa raíz de BUG-05.** Con `page = -1`, `Paginate` calcula `start = min((p.Page-1)*p.Size, len(items))`, que vale `-20` (`httpx/paging.go:48`). El corte `items[start:end]` (`:54`) entra en pánico (`slice bounds out of range [:-10]`), y el middleware de recuperación lo convierte en 500. La UI no envía páginas negativas porque `parseMeterFilters` las descarta (`features/meters/hooks/useMeterFilters.test.ts`, "ignora valores inválidos"). El defecto queda expuesto a cualquier cliente de la API.
- **BUG-06 queda explicado.** El comentario `httpx/paging.go:16` define que `0` significa "no enviado". Con un `int` de Go, un `size: 0` enviado explícitamente no se distingue de uno ausente, así que se acepta y vale 10. El Swagger promete `minimum: 1`. Es una contradicción de contrato de severidad baja; se corrige con `*int`.
- **Causa raíz de BUG-03.** `Pagination.tsx:13` calcula el total de páginas con `Math.floor(count / size)`: `floor(12 / 10) = 1`. "Siguiente" se deshabilita con `page >= pages` (`:30`), así que nunca se habilita en el libro de 12 medidores. El cálculo correcto es `Math.ceil`. El defecto solo aparece cuando `count` no es múltiplo de `size`: con 20 medidores funcionaría, que es lo que comprueba el test de control. El docstring del componente ("11–12 de 12", `:11`) describe justo el caso que el código no alcanza. El componente no tiene ningún test.

### Hora de planta

- **Causa raíz de BUG-02.** `formatPlantTime` (`lib/format.ts:55-58`) usa `getDate`, `getMonth` y `getHours`, que dan la hora **local** del navegador. El comentario inmediatamente anterior (`:51-52`) dice que se leen las partes UTC "para NO convertirla a la zona del navegador". Las funciones vecinas `formatPlantDate` y `formatPlantDay` sí usan `getUTC*` (`:63`, `:69`). En `America/Bogota` (UTC−5), 14:00 se ve como 09:00, y 23:00 como 18:00.
- **Por qué no lo detecta el test.** `format.test.ts:15-18` afirma lo correcto ("12/09 14:00"), pero `vite.config.ts:33` fuerza `TZ: 'UTC'` en todos los tests, y bajo UTC la hora local coincide con la UTC. La configuración que buscaba "tests deterministas" oculta el defecto en la única zona horaria que importa: la del operador.

### Severidad del motor

`realSeverity` (`analysis/classify/classify.go:219-229`):

| Rama | Condición en código | README ("8. Severidad") |
|---|---|---|
| `HIGH` | `p >= 50 && c.Ongoing` | "si la variación **supera** 50 % y sigue activa" |
| `MEDIUM` | `p >= 20` | "si **supera** 20 %" |
| `LOW` | resto | "si no" |

- **BUG-10, nuevo y solo de caja blanca.** "Supera" es `>`, y el código usa `>=`. Una variación de exactamente 50,0 % activa sale `HIGH` en lugar de `MEDIUM`, y una de exactamente 20,0 % sale `MEDIUM` en lugar de `LOW`. No es observable con el dataset, pero cambia la prioridad de un caso real en el límite. `realSeverity` tiene 60 % de cobertura y ningún test de límites.
- La regla de calidad de datos (`classify.go:59`, `FlaggedHours >= 12`) sí coincide con el README ("12 horas sospechosas o más").

## Tests existentes

| Suite | Resultado | Cobertura |
|---|---|---|
| `go test ./...` | 12 paquetes OK; `httpx`, `dashboard`, `anomaly`, `store` y `variables` sin tests propios | 84,2 % de sentencias con `-coverpkg=./internal/...` |
| `pnpm test` (Vitest) | 3 archivos originales en verde: `format.test.ts`, `useMeterFilters.test.ts`, `marks.test.tsx` | sin reporte de cobertura configurado |

Cobertura por paquete (`go test -cover`):

| Paquete | Cobertura |
|---|---|
| `analysis` | 100 % |
| `quality` | 89,7 % |
| `stats` | 89,5 % |
| `changes` | 82,4 % |
| `baseline` | 80 % |
| `meter` | 79,6 % |
| `server` | 78,9 % |
| `data` | 75,5 % |
| `ai` | 71,7 % |
| `config` | 47,2 % |
| `auth` | 28,3 % |
| `classify` | **6,9 %** |

Salida completa en [`go-test-cover.txt`](evidencias/caja-blanca/go-test-cover.txt).

**Qué cubren:**

- **Backend:** el motor estadístico con datos inventados y con los CSV reales. `TestAnalyzeRealData` verifica los 4 casos del README. También cubren login y tokens, filtros, orden y paginación de `getAll`, y rutas protegidas.
- **Frontend:** formato numérico, parseo de filtros de la URL y etiquetas accesibles de estado y severidad.

**Qué no cubren:**

- `StatusOf` con tipo `FALSE_POSITIVE`.
- La búsqueda en minúsculas.
- `page < 1`.
- Los límites exactos de severidad.
- Ningún componente con lógica: `Pagination`, el libro y el `AuthProvider` no tienen tests.
- Ninguna prueba en una zona horaria distinta de UTC.

**Tests que fijan el comportamiento incorrecto:**

- `server/server_test.go:131` exige `normal 8, alert 2, critical 2`. Contradice el README (9/1/2) y bloquea la corrección de BUG-01: quien arregle `StatusOf` verá fallar este test y podría "arreglar" el test en lugar del código.
- `vite.config.ts:33` (`TZ: 'UTC'`) no es un test, pero anula el único test que protegía BUG-02.

**Cobertura frente a corrección.** `StatusOf`, `Paginate`, `Pagination.Normalize` y `meter.Service.GetAll` tienen 100 % de líneas cubiertas, y los cuatro contienen un defecto. La cobertura de líneas mide qué código se ejecutó, no qué condiciones se probaron. Aquí faltan las combinaciones de la tabla de decisión (el tipo junto a la severidad) y los valores límite (`page` negativa, 20 % y 50 % exactos).

**¿Se confía en la suite?** Parcialmente:

- **Sí** para el motor estadístico, que está bien probado con datos reales y sintéticos.
- **No** para la capa que traduce el resultado al operador: estado, búsqueda, paginación y formato de horas. Ahí la suite pasa en verde con cuatro defectos, y uno de sus tests fija un comportamiento incorrecto.

## Tests propuestos

Escritos y ejecutados, sin tocar código productivo. Fallan hoy por el defecto que nombran y pasarían con la corrección. No rompen las suites normales:

- **Go:** la build tag `defects` los excluye de `go test ./...`.
- **Vitest:** `it.fails` invierte el resultado mientras el defecto exista.

| Defecto | Test | Qué afirma |
|---|---|---|
| BUG-01 | `backend/internal/meter/meter_defects_test.go` · `TestBUG01_FalsePositiveIsNormal`, `TestBUG01_AlertFilterExcludesFalsePositive` | `StatusOf(FALSE_POSITIVE) = NORMAL`; el filtro `ALERT` devuelve solo M-104 |
| BUG-04 | `meter_defects_test.go` · `TestBUG04_SearchIgnoresCase` | `m-109` y `m-1` devuelven lo mismo que en mayúsculas |
| BUG-05 | `backend/internal/httpx/paging_defects_test.go` · `TestBUG05_NegativePageIsRejected`, `TestBUG05_PaginateDoesNotPanicOnNegativePage` | `page < 1` es un error de validación; `Paginate` no entra en pánico |
| BUG-10 | `backend/internal/analysis/classify/severity_defects_test.go` · `TestBUG10_SeverityBoundariesAreExclusive` | 50,0 % → `MEDIUM`, 50,01 % → `HIGH`, 20,0 % → `LOW`, 20,01 % → `MEDIUM` |
| BUG-02 | `frontend/src/lib/format.defects.test.ts` | Con `TZ=America/Bogota`, `formatPlantTime` devuelve 12/09 14:00 y 14/09 23:00 |
| BUG-03 | `frontend/src/features/meters/components/Pagination.defects.test.tsx` | Con 12 medidores y páginas de 10, Siguiente está habilitado en la página 1; incluye controles con 20 medidores y con la página 2 |

Comandos (salida en [`go-test-defects.txt`](evidencias/caja-blanca/go-test-defects.txt) y [`vitest.txt`](evidencias/caja-blanca/vitest.txt)):

```bash
# backend: suite normal en verde; los de defectos fallan nombrando el BUG
cd backend && go test ./... && go test -tags defects -run BUG ./internal/meter ./internal/httpx ./internal/analysis/classify

# frontend: 14 pasan y 3 "expected fail" (BUG-02 x2, BUG-03)
cd frontend && pnpm test
```

Resultado: `go test ./...` en verde; con `-tags defects`, 6 tests fallan con mensajes que nombran BUG-01, BUG-04, BUG-05 y BUG-10. `pnpm test`: 14 pasan y 3 son fallos esperados.

Recomendación para el equipo de desarrollo, al corregir cada defecto:

- Quitar la tag o el `.fails`, para que el test se vuelva de regresión.
- Cambiar `server_test.go:131` a 9/1/2.
- Agregar una ejecución de Vitest con `TZ=America/Bogota` en CI.

## Riesgos no revisados

- `ai/narrator.go:34-36`: la barrera anti-cifras compara cifras después de quitar `.` y `,`. "110,5", "1.105" y "11,05" cuentan como la misma cifra. Solo aplica con `OPENAI_API_KEY`, que está fuera del alcance del plan; queda como riesgo abierto.
- `auth` tiene 28,3 % de cobertura. La caja negra (TC-01, TC-04, TC-22) no encontró fallos, pero el middleware no tiene tests de rutas mal formadas.
