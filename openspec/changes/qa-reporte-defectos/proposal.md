# Proposal

## Why

La Parte E pesa el 30 % de la nota: defectos encontrados y calidad de sus reportes. La caja negra dejó 9 candidatos (`BUG-01`…`BUG-09`) con evidencia, pero sin reporte completo: falta argumentar con oráculos, separar severidad de prioridad, dar entorno exacto, causa raíz y forma de detectarlo automáticamente. Además, el cierre de la prueba exige el resumen ejecutivo, que depende de este reporte.

## What Changes

- `qa/05-defectos.md` con un reporte por defecto, siguiendo la anatomía del bug report y RIMGEA. Cada reporte trae:
  - título claro;
  - severidad y prioridad por separado, cada una con su razón;
  - entorno: navegador, SO, zona horaria y commit;
  - pasos y datos;
  - resultado esperado citando el oráculo HICCUPPS y su fuente, frente al obtenido;
  - evidencia: captura y request/response;
  - causa raíz probable, con archivo y línea, desde `qa/04`;
  - el test que lo detecta automáticamente;
  - el ejercicio de *maximize*: cómo se buscó si el síntoma era parte de algo mayor.
- Un issue de GitHub por defecto en el repo de entrega, con etiquetas de severidad y prioridad y enlace al reporte. `qa/05` lleva la tabla índice con los enlaces.
- Reproducción manual de cada defecto por Rosemberth antes de publicar el issue, y la severidad y prioridad finales decididas por él.
- La sección "Resumen ejecutivo" de `qa/01-plan-de-pruebas.md`, completa: si se libera el build, por qué y los riesgos abiertos.
- **Fuera de alcance:**
  - los tests de Playwright que evidencian defectos, que van en `e2e-flujo-negocio-y-api` y que este reporte solo enlaza;
  - corregir defectos.

## Capabilities

### New Capabilities
- `qa-defects`: el reporte de defectos de la entrega, su contenido mínimo, su publicación como issues y el resumen ejecutivo que de él se deriva.

### Modified Capabilities

## Impact

- Nuevos: `qa/05-defectos.md` y los issues de GitHub del repo `rprecigapuentes/bia-prueba-qa`, con etiquetas `severidad:*` y `prioridad:*`.
- Modificado: `qa/01-plan-de-pruebas.md` (resumen ejecutivo).
- Depende de `qa-caja-blanca` (causa raíz) y de `e2e-flujo-negocio-y-api` (tests que detectan).
