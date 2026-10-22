# Tasks

## 1. Suite existente

- [ ] 1.1 Ejecutar `go test -cover ./...` y `-coverpkg=./internal/...` en `golang:1.26`, y `pnpm test` en `node:22`, guardando la salida en `qa/evidencias/caja-blanca/`; verificar que los archivos existen y la suite pasa
- [ ] 1.2 Leer los tests existentes y registrar qué cubren, cuáles fijan comportamiento contrario al oráculo y qué configuración oculta defectos; verificar que cada afirmación cita archivo y línea

## 2. Módulos

- [ ] 2.1 Revisar `internal/meter` (estado, filtros, búsqueda, validación) y documentar ramas, bordes y causa raíz de BUG-01, BUG-04 y BUG-07; verificar que cada causa cita archivo y línea
- [ ] 2.2 Revisar `internal/httpx` (paginación) y la paginación del libro en el frontend, y documentar BUG-03, BUG-05 y BUG-06; verificar igual
- [ ] 2.3 Revisar `lib/format.ts` y su configuración de test, y documentar BUG-02; verificar igual
- [ ] 2.4 Revisar los límites de severidad de `internal/analysis/classify` contra el README; verificar que el hallazgo, o su ausencia, queda justificado

## 3. Tests propuestos

- [ ] 3.1 Escribir `*_defects_test.go` (tag `defects`) para las causas del backend y verificar que `go test ./...` pasa y `go test -tags defects ./...` falla nombrando cada `BUG-xx`
- [ ] 3.2 Escribir `*.defects.test.ts` con `it.fails` para las causas del frontend y verificar que `pnpm test` sigue en verde y reporta los fallos esperados

## 4. Documento

- [ ] 4.1 Escribir `qa/04-caja-blanca.md` con módulos, suite existente, tests propuestos, comandos y conclusión; verificar que no modifica código productivo (`git diff --stat` solo muestra tests y docs)
