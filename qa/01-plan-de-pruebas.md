# Plan de pruebas · EnergIA

Producto: plataforma que monitorea 12 medidores eléctricos y clasifica anomalías de consumo (backend Go, frontend React). Build bajo prueba: commit `026b991` de `biaenergy/prueba-qa`. Oráculo: `README.md`, `backend/README.md`, `frontend/README.md`, `frontend/PRODUCT.md` y Swagger. Usuarios: operadores de planta en Colombia (`America/Bogota`).

## Alcance

**Dentro:**

- Autenticación (login, sesión, rutas protegidas) en API y UI.
- Libro de medidores: filtro por estado, búsqueda por `meter_id`, orden, paginación y estado en la URL.
- Detalle de medidor, Despacho (KPIs y órdenes), Anomalías e Investigación.
- Reglas de negocio documentadas: tipo → estado, severidad, priorización, cifras de evidencia (consumo 24 h, baseline, variación, confianza).
- Run AI Analysis: pipeline de 7 pasos, polling y no concurrencia.
- Contrato de la API: códigos, formato de error y validación de entradas.
- Consistencia entre documentación, API y UI, incluida la presentación de horas de planta.
- Revisión de código y de los tests existentes de los módulos de mayor riesgo.

**Fuera, y por qué:**

| Exclusión | Razón |
|---|---|
| Redacción con OpenAI | Dependencia externa y sin API key en el entorno; la barrera anti-cifras se revisa por caja blanca |
| Rendimiento y carga | Dataset fijo de 4.032 lecturas en memoria: no representa producción y no hay requisito de rendimiento |
| Validez estadística del motor (MAD, umbral 3,5) | Es decisión de diseño documentada; se prueba que el código cumple la metodología, no si la metodología es la mejor |
| Pentesting más allá de autenticación | Fuera del tiempo disponible; se cubren token ausente, alterado y rutas protegidas |
| Móvil y navegadores fuera de Chromium y Firefox | `PRODUCT.md` define uso en escritorio |
| Despliegue en servidor | No forma parte del build entregado para prueba |

## Oráculos

Un oráculo es la heurística con la que se decide si un resultado es correcto (Kaner). Ningún oráculo es suficiente por sí solo: se combinan, y cuando se contradicen decide el criterio humano. Se usan los oráculos de consistencia HICCUPPS que aplican a este build.

| Oráculo | Fuente en EnergIA | Uso |
|---|---|---|
| **Claims** (lo que el producto afirma) | `README.md`, `backend/README.md`, `frontend/README.md`, `PRODUCT.md`, Swagger | Resultado esperado de casi todos los casos; prevalece si contradice a otro oráculo |
| **Product** (dentro del producto) | La misma cifra o estado en API, Despacho, libro, detalle e investigación | Matriz de consistencia entre capas |
| **Purpose** (para qué existe) | "Qué revisar primero, por qué y qué hacer" (`PRODUCT.md`) | Juzgar si un comportamiento que no contradice la doc frustra al operador |
| **User desires** (lo que espera el usuario) | Operador de planta en Colombia, `America/Bogota`, sesiones cortas | Horas, idioma y lectura rápida del estado |
| **Standards** | WCAG 2.1 AA (declarado en `PRODUCT.md`), formato es-CO, HTTP (401, 400, 404) | Accesibilidad, formato numérico, códigos de la API |
| History, Image, Comparable products | No aplican | Hay un solo build, no hay marca publicada ni producto comparable de referencia |

Cada caso de `qa/03` y cada defecto de `qa/05` nombra el oráculo que respalda su resultado esperado.

## Riesgos

Impacto contado para el operador de planta. Escala 1–3; riesgo = impacto × probabilidad.

| # | Área | Impacto | Prob. | Riesgo | Por qué importa |
|---|---|---|---|---|---|
| R1 | Estado de alerta por medidor (tipo → NORMAL / ALERT / CRITICAL) | 3 | 2 | 6 | Un falso positivo marcado como alerta hace escalar lo que el motor dice "no escalar"; una anomalía real marcada normal se ignora |
| R2 | Horas de planta en pantalla | 3 | 2 | 6 | Una hora corrida manda a investigar en sitio la ventana equivocada |
| R3 | Libro: búsqueda, filtros, orden, paginación | 2 | 3 | 6 | Un medidor inalcanzable es una alerta invisible; mucha lógica de límites |
| R4 | Priorización y cifras de evidencia | 3 | 2 | 6 | Define qué se revisa primero y con qué argumento |
| R5 | Consistencia Despacho / libro / detalle / doc | 2 | 2 | 4 | Conteos o cifras distintas entre pantallas destruyen la confianza en la herramienta |
| R6 | Validación de entradas y errores de la API | 2 | 2 | 4 | Un 500 donde va un 400 oculta el motivo y puede tumbar integraciones |
| R7 | Autenticación y rutas protegidas | 3 | 1 | 3 | Impacto alto, pero un solo usuario y JWT estándar |
| R8 | Run AI Analysis | 2 | 1 | 2 | No cambia el resultado (el motor ya corrió al arrancar); riesgo de UX y concurrencia |
| R9 | Formato es-CO y accesibilidad | 1 | 2 | 2 | Legibilidad; el estado no debe depender solo del color |

R1–R4 reciben la mayoría de los casos y de la automatización.

## Tipos de prueba por capa

Pirámide: la mayor parte de las verificaciones en capas baratas y estables, la UI solo para lo que únicamente la UI puede romper.

| Capa | Herramienta | Qué se prueba | Riesgos |
|---|---|---|---|
| Unitario | `go test`, Vitest (caja blanca) | Límites de reglas (severidad 20 % y 50 %, calidad de datos 12 h), estado por tipo, paginación, formato de hora bajo `America/Bogota` | R1, R2, R4, R6 |
| API | Playwright `request` | Contrato, validación, EP/BVA, tabla de decisión, pairwise | R1, R3, R4, R6, R7 |
| UI (E2E) | Playwright, Chromium y Firefox, `timezoneId: America/Bogota` | Flujo de negocio, paginación visible, horas de planta, estado en la URL | R2, R3, R5 |
| Exploratorio | Manual, por charters | Lo que el oráculo no anticipa | Todos |

Técnicas, en el orden de aplicación: exploratorio, funcional, dominio y combinatorio.

| Área | Técnica |
|---|---|
| Login, búsqueda, filtro de estado | Partición de equivalencia |
| Paginación (`page` ≥ 1, `size` 1–100, 12 medidores) | Análisis de valores límite |
| Tipo → estado, severidad, prioridad | Tablas de decisión |
| Filtro × orden × dirección × clase de búsqueda | Pairwise (PICT), ejecutado como test data-driven de API |
| Token, cuerpos y parámetros inválidos | Pruebas negativas |
| KPIs, cifras y horas | Consistencia entre capas: doc vs. API vs. UI |

## Criterios

- **Entrada:** la app levanta con `docker compose up -d --build` y la suite de humo (`qa/02-smoke.md`) pasa en sus casos bloqueantes: salud, login API, listado de medidores y login UI.
- **Suspensión:** falla un caso bloqueante del humo o el servicio cae durante la ejecución. Se reporta como bloqueo y se reanuda al volver a pasar el humo.
- **Salida:**
  - Todos los casos diseñados están ejecutados, con resultado y evidencia.
  - Cada defecto tiene reporte completo.
  - Cada defecto de severidad alta tiene un test automatizado que lo evidencia.
  - R1–R4 están cubiertos en al menos dos capas.
  - La suite de Playwright pasa, salvo los `test.fail()` declarados.

## Entorno, datos y herramientas

- **Entorno:** Windows 11 con WSL Ubuntu 26.04, Docker Compose, zona horaria `America/Bogota`, Chromium y Firefox de Playwright 1.64.
- **Datos:** dataset fijo del repo (`readings.csv`, `events.csv`: 12 medidores, 1–14 sep 2026). No se crean datos: la API es de solo lectura.
- **Herramientas:** `curl` para evidencias de API, Playwright + TypeScript (`e2e/`), PICT para pairwise, Go y Vitest para tests unitarios.

## Uso de IA

- **Claude Code** como par de trabajo para:
  - leer el oráculo y proponer casos;
  - ejecutar y registrar pruebas de API;
  - capturar evidencias;
  - escribir el framework de Playwright.
- **Spec-Driven Development con OpenSpec:** cada entregable es un *change* con propuesta, spec y tareas, revisado en un pull request antes de integrarse (`openspec/changes/archive/`).
- **Agentes de Playwright** (planner, generator, healer) sobre el MCP de Playwright, para explorar la UI, generar tests sobre los Page Objects y reparar locators.
- **Decisiones humanas:**
  - alcance, matriz de riesgos, severidad y prioridad de cada defecto;
  - el veredicto de liberación;
  - la reproducción manual de cada defecto antes de reportarlo.
- **Transparencia:** al inicio, un agente hizo un barrido estático del código para ubicar módulos de riesgo. Esos hallazgos se tratan como hipótesis de caja blanca (`qa/04`). Los casos de caja negra (`qa/03`) se diseñaron solo desde la documentación.

## Resumen ejecutivo

**Decisión: no se libera el build `026b991` a producción.** El motor detecta, clasifica y prioriza bien las cuatro anomalías del dataset: tipos, severidades, confianzas y orden coinciden con la documentación (TC-14, TC-15, TC-19). La capa que traduce ese resultado al operador, en cambio, le da información incorrecta en tres puntos que tocan las decisiones que el producto promete apoyar.

**Bloqueantes** (severidad o prioridad alta; cada uno se corrige en una o dos líneas):

| Defecto | Qué ve el operador | Riesgo |
|---|---|---|
| [BUG-01](05-defectos.md#bug-01) | El falso positivo M-106 aparece en Alerta; la planta muestra 8 / 2 / 2 en vez de 9 / 1 / 2 | R1: escala lo que el motor dice "no escalar" |
| [BUG-02](05-defectos.md#bug-02) | Todas las horas de planta corridas 5 h en Colombia; la detección de M-109 se ve a las 09:00 en vez de las 14:00 | R2: investiga en sitio la ventana equivocada |
| [BUG-03](05-defectos.md#bug-03) | El libro no pasa de la página 1; M-111 y M-112 (crítico) no aparecen sin filtrar | R3: un medidor crítico queda fuera de la vista principal |

**Para la siguiente iteración:**

- **Prioridad media:**
  - BUG-04: la búsqueda distingue mayúsculas.
  - BUG-08: los conteos de órdenes no coinciden en Despacho.
- **Prioridad baja:**
  - BUG-05: `page` negativa responde 500.
  - BUG-06: `size: 0` se acepta.
  - BUG-09: textos en inglés.
  - BUG-10: límites de severidad con `>=`.

**Cobertura alcanzada:**

- 10 casos de humo (10 / 10).
- 25 casos de caja negra (13 PASA, 12 FALLA).
- 30 combinaciones pairwise de `getAll`.
- 4 módulos revisados por caja blanca.
- 94 tests de Playwright en Chromium, Firefox y API con `America/Bogota`, más 6 tests unitarios de defectos, todos en CI.

Los riesgos R1–R4 quedaron cubiertos en al menos dos capas.

**Riesgos que siguen abiertos:**

- **La suite existente no protege la capa de presentación.** Cuatro funciones con 100 % de cobertura de líneas tienen defectos, `server_test.go:131` fija el conteo incorrecto y `vite.config.ts` fuerza `TZ=UTC`, lo que oculta BUG-02. Hasta corregirlo, un arreglo puede romperse sin que nadie lo note.
- **La redacción con OpenAI no se probó:** no hay API key en el entorno. Su barrera anti-cifras ignora `.` y `,` (`ai/narrator.go:34-36`).
- **Límites del motor sin datos reales:** 20 %, 50 % y 12 h solo se prueban con tests unitarios.
- **Rendimiento, carga, seguridad más allá de la autenticación, y móvil:** fuera de alcance.

**Condición para liberar:**

1. Corregir BUG-01, BUG-02 y BUG-03.
2. Convertir sus tests de defecto en tests de regresión (quitar `test.fail()`, `it.fails` y la tag `defects`).
3. Actualizar `server_test.go:131` a 9 / 1 / 2.
4. Volver a correr el humo y la suite completa en CI.
