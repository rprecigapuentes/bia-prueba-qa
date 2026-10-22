# Proposal

## Why

La Parte A del enunciado pide una estrategia y un plan de pruebas breve antes de ejecutar nada. Sin un análisis de riesgos explícito, el tiempo disponible (un solo día) se reparte por igual entre áreas de impacto muy distinto, y el resto de entregables (smoke, caja negra, caja blanca, defectos) no tienen un criterio común de prioridad ni de salida.

## What Changes

- Se crea `qa/01-plan-de-pruebas.md` (1–2 páginas) con:
  - Alcance: qué se prueba y qué se deja fuera, con la razón de cada exclusión.
  - Matriz de riesgos (impacto × probabilidad) por área funcional del producto, priorizada.
  - Tipos de prueba por capa (unitario, API, UI) siguiendo la pirámide de pruebas, y técnicas de diseño por área.
  - Criterios de entrada, suspensión y salida.
  - Entorno, datos y herramientas, incluido el uso de IA.
  - Una sección "Resumen ejecutivo" reservada, que se completa al cerrar la prueba.
- Fuera de alcance de este change: ejecutar pruebas, diseñar casos individuales (Parte C) y el resumen ejecutivo final (se escribe con los resultados del change `qa-reporte-defectos`).

## Capabilities

### New Capabilities
- `qa-plan`: el documento de estrategia y plan de pruebas de la entrega, su estructura mínima y sus criterios.

### Modified Capabilities

## Impact

- Nuevo archivo `qa/01-plan-de-pruebas.md`. No toca `backend/`, `frontend/` ni `e2e/`.
- Fija las prioridades que usan los changes `qa-smoke-suite`, `qa-casos-caja-negra`, `qa-caja-blanca` y `qa-reporte-defectos`.
