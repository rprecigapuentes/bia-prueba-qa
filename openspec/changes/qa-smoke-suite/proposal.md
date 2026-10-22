# Proposal

## Why

La Parte B pide el conjunto mínimo de verificaciones que dicen "este build se puede probar". El plan de pruebas usa ese resultado como criterio de entrada: sin una suite de humo ejecutada y documentada, no hay forma de distinguir un defecto funcional de un entorno roto.

## What Changes

- Se crea `qa/02-smoke.md` con 8–10 casos de humo. Cada caso declara qué verifica, por qué es imprescindible (qué bloquearía si fallara) y su resultado contra el commit bajo prueba.
- Los casos se ejecutan ahora, contra la app levantada con Docker, por API (`curl`) y por UI (navegador), y la evidencia queda en `qa/evidencias/smoke/`.
- Cada caso se marca como candidato a automatizar con la etiqueta `@smoke`; la automatización llega en el change `e2e-framework`.
- Fuera de alcance: validar reglas de negocio en detalle (cifras, orden, filtros combinados). Eso es caja negra (Parte C). El humo solo comprueba que cada área responde y muestra datos plausibles.

## Capabilities

### New Capabilities
- `qa-smoke`: la suite de humo de la entrega, su criterio de selección, su ejecución y su evidencia.

### Modified Capabilities

## Impact

- Nuevos `qa/02-smoke.md` y `qa/evidencias/smoke/`. No toca `backend/`, `frontend/` ni `e2e/`.
- Su resultado alimenta el criterio de entrada de `qa/01-plan-de-pruebas.md`.
