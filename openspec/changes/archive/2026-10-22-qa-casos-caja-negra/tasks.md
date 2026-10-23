# Tasks

## 1. Exploratorio

- [x] 1.1 Registrar las sesiones exploratorias de Rosemberth (charter, duración, hallazgos, capturas en `qa/evidencias/exploratorio/`); verificar que cada charter del plan de trabajo tiene sesión o razón para omitirla

## 2. Derivación

- [x] 2.1 Escribir las particiones de equivalencia (login, búsqueda, filtro de estado) y los valores límite (paginación API y UI) desde el README y el Swagger; verificar que cada clase y cada límite cita su fuente
- [x] 2.2 Escribir las tablas de decisión tipo → estado, severidad y prioridad desde `backend/README.md`; verificar que cubren los 4 tipos más "sin anomalía"
- [x] 2.3 Compilar PICT, escribir el modelo de `getAll` (estado × orden × dirección × búsqueda) y guardar modelo y salida en `qa/evidencias/pairwise/`; verificar que la salida cubre todos los pares
- [x] 2.4 Escribir la matriz de consistencia doc vs. API vs. UI (conteos, cifras de M-109, horas de planta); verificar que cada fila nombra las tres fuentes

## 3. Casos y ejecución

- [x] 3.1 Seleccionar 20–25 casos, escribirlos con el formato completo (incluido el oráculo HICCUPPS) y llevarlos al CSV; verificar que R1–R4 concentran la mayoría y que hay casos de UI, API y negativos
- [x] 3.2 Ejecutar los casos de API y el pairwise con `curl`, guardando la evidencia por caso; verificar que cada caso de API tiene su archivo
- [x] 3.3 Generar las capturas de los casos de UI con un script de Playwright en Chromium con `America/Bogota`, y registrar la confirmación manual de Rosemberth; verificar que cada caso de UI tiene captura
- [x] 3.4 Registrar resultado y estado de cada caso, enlazar `BUG-xx` en los que fallan y escribir el resumen de ejecución; verificar que el documento y el CSV coinciden

## 4. Cierre

- [x] 4.1 Ejecutar `openspec validate qa-casos-caja-negra --strict` y verificar que pasa
