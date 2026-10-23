# Proposal

## Why

Un solo workflow que corre todo en cada PR mezcla dos necesidades distintas. Por un lado está el feedback rápido sobre un cambio (CI). Por otro, la verificación completa y periódica del producto (Continuous Testing). Además no ejecuta las pruebas unitarias, que son la base de la pirámide, ni aprovecha el paralelismo. Partir el pipeline hace visible la estrategia del plan (unitario → API → UI) y deja una ejecución completa diaria con evidencia consolidada.

## What Changes

- **BREAKING:** se elimina `.github/workflows/e2e.yml`.
- `.github/workflows/ci.yml`, que corre en PR, en push a `main` y a mano, en este orden:
  1. estáticos (lint y typecheck);
  2. unitarios de backend (`go test -cover`) y de frontend (Vitest);
  3. humo contra la app en Docker, solo si los anteriores pasan.

  Los tests unitarios de defectos (`-tags defects`) corren en un job aparte que no bloquea y lista los BUG abiertos en el resumen.
- `.github/workflows/continuous-testing.yml`, que corre a diario a las 06:00 de Bogotá, a mano con la suite a elegir y en los PR que lo modifican:
  - una matriz paralela de 5 jobs (API, Chromium 2 shards y Firefox 2 shards), cada uno con su propia app aislada;
  - un job que une los *blob reports* en un HTML y escribe el resumen.
- `e2e/README.md`: la sección de pipelines, con diagramas.
- Fuera de alcance:
  - publicar el reporte en GitHub Pages (requiere plan de pago en repos privados);
  - notificaciones;
  - pruebas de rendimiento.

## Capabilities

### New Capabilities

### Modified Capabilities
- `e2e-ci`: se separa en CI (rápido, por cambio, con la pirámide completa) y Continuous Testing (completo, programado, paralelo y aislado, con un reporte consolidado).

## Impact

- `.github/workflows/`: se agregan `ci.yml` y `continuous-testing.yml` y se elimina `e2e.yml`.
- `e2e/README.md`.
- No toca código de la app ni de los tests.
