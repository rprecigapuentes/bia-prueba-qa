# Proposal

## Why

La Parte C pesa, junto con los defectos, más de la mitad de la nota, y se evalúa por el criterio y no por la cantidad: técnicas de diseño aplicadas de forma explícita, cobertura guiada por riesgo y ejecución sobre la UI y la API. Además tiene que hacerse "sin mirar el código", así que cada caso debe salir de la documentación, del Swagger, de la UI y del exploratorio, no de la revisión del código.

## What Changes

- `qa/03-casos-caja-negra.md`. En el orden de aplicación de las técnicas, incluye:
  1. Las sesiones exploratorias: charter, duración y hallazgos.
  2. La derivación de cada técnica antes de los casos:
     - particiones de equivalencia de login, búsqueda y filtro de estado;
     - valores límite de paginación (API y UI);
     - tablas de decisión tipo → estado, severidad y prioridad;
     - el modelo PICT con sus combinaciones;
     - la matriz de consistencia doc vs. API vs. UI.
  3. Entre 20 y 25 casos con el formato `ID · Título · Precondición · Pasos · Datos · Resultado esperado · Resultado obtenido · Estado`, más técnica, riesgo (R1–R9 del plan), capa, **oráculo** (HICCUPPS, según la tabla de `qa/01`) y evidencia.
  4. Un resumen de ejecución y los candidatos a defecto (`BUG-xx`) que alimentan el change `qa-reporte-defectos`.
- `qa/03-casos-caja-negra.csv` con los mismos casos, para abrir en una hoja de cálculo.
- Evidencias de ejecución en `qa/evidencias/<TC-xx>/`:
  - `curl -i` en los casos de API;
  - capturas en Chromium con zona horaria `America/Bogota` en los de UI;
  - salida de PICT y resultados del pairwise.
- Reparto de ejecución:
  - el agente ejecuta los casos de API y el pairwise;
  - Rosemberth ejecuta y confirma los casos de UI y aporta las notas del exploratorio;
  - las capturas de UI se generan con un script de Playwright.
- Fuera de alcance:
  - automatizar estos casos en `e2e/` (change `e2e-flujo-negocio-y-api`);
  - reportes completos de defecto (change `qa-reporte-defectos`);
  - cualquier lectura de `backend/` o `frontend/src/`.

## Capabilities

### New Capabilities
- `qa-black-box`: el documento de casos de caja negra, cómo se derivan, qué cubren y cómo se registra su ejecución.

### Modified Capabilities

## Impact

- Nuevos: `qa/03-casos-caja-negra.md`, `qa/03-casos-caja-negra.csv`, `qa/evidencias/TC-*/` y el modelo PICT en `qa/evidencias/pairwise/`.
- PICT se compila desde `microsoft/pict` en WSL. No se agrega como dependencia del repo.
- No toca `backend/`, `frontend/` ni `e2e/`.
