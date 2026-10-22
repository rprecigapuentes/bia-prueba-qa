# Proposal

## Why

La Parte D pide abrir el código, revisar al menos dos módulos de riesgo (ramas, condiciones, validaciones, casos borde), juzgar los tests existentes y proponer los que faltan. La caja negra (`qa/03`) ya mostró síntomas en R1 (estado), R2 (horas) y R3 (libro); la caja blanca debe llegar a la causa raíz de esos síntomas y explicar por qué la suite actual no los detecta.

## What Changes

- `qa/04-caja-blanca.md` con:
  - **Módulos revisados**, elegidos por riesgo, cada uno con sus ramas y condiciones, los casos borde y su relación con los casos de caja negra:
    1. Estado por medidor, filtros y búsqueda del backend (`internal/meter`).
    2. Paginación del backend (`internal/httpx`) y del frontend (componente de paginación del libro).
    3. Formato de horas de planta del frontend (`lib/format.ts`).
    4. Límites de severidad del motor (`internal/analysis/classify`), que la caja negra no puede alcanzar con el dataset fijo.
  - **Análisis de la suite existente:**
    - qué cubre `go test ./...` y qué cubre `pnpm test`;
    - la cobertura por paquete;
    - qué tests fijan el comportamiento incorrecto;
    - qué configuración oculta defectos;
    - si se puede confiar en la suite.
  - **Tests unitarios propuestos y escritos**, uno por causa raíz, que fallan hoy y pasarían con la corrección.
- Archivos de test nuevos, sin tocar código productivo:
  - En Go: `*_defects_test.go` con la build tag `defects`, para que `go test ./...` siga en verde y `go test -tags defects ./...` muestre los defectos.
  - En el frontend: `*.defects.test.ts` con `it.fails`.
- Salida de los comandos (cobertura y ejecución) en `qa/evidencias/caja-blanca/`.
- **Fuera de alcance:**
  - corregir código de la aplicación;
  - revisar los módulos no listados (AI narrator, config, store), salvo una mención de riesgo;
  - mutación o fuzzing.

## Capabilities

### New Capabilities
- `qa-white-box`: el análisis de caja blanca de la entrega, la evaluación de la suite existente y los tests unitarios propuestos para los defectos.

### Modified Capabilities

## Impact

- Nuevos: `qa/04-caja-blanca.md`, `qa/evidencias/caja-blanca/`, `backend/internal/**/*_defects_test.go` y `frontend/src/**/*.defects.test.ts`.
- `go test` y `pnpm test` se ejecutan en contenedores (`golang:1.26`, `node:22`) porque WSL no tiene Go ni pnpm.
- No se modifica código productivo de `backend/` ni de `frontend/`.
