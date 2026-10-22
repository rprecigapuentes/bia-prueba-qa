# Tasks

## 1. Contenido del plan

- [ ] 1.1 Escribir alcance, exclusiones con su razón, entorno y datos en `qa/01-plan-de-pruebas.md`; verificar que cada exclusión tiene razón
- [ ] 1.2 Escribir la matriz de riesgos por área (impacto × probabilidad), ordenada, con el impacto expresado para el operador; verificar que todas las pantallas y endpoints del oráculo caen en alguna fila
- [ ] 1.3 Escribir tipos de prueba por capa (pirámide) y técnicas por área; verificar que aparecen EP, BVA, tabla de decisión, pairwise y consistencia entre capas
- [ ] 1.4 Escribir criterios de entrada (ligado al smoke), suspensión y salida; verificar que cada criterio es comprobable con un resultado observable
- [ ] 1.5 Escribir la sección de uso de IA y reservar la sección "Resumen ejecutivo"; verificar que el documento no pasa de dos páginas sin el resumen

## 2. Cierre

- [ ] 2.1 Ejecutar `openspec validate qa-plan-de-pruebas --strict` y verificar que pasa
