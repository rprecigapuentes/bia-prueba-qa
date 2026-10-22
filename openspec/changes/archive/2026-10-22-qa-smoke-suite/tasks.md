# Tasks

## 1. Diseño de la suite

- [x] 1.1 Seleccionar 8–10 casos que cubran las áreas del spec y escribir para cada uno ID, objetivo, por qué es imprescindible, pasos y datos en `qa/02-smoke.md`; verificar que ninguna área del spec queda sin caso

## 2. Ejecución

- [x] 2.1 Ejecutar los casos de API con `curl -i` contra http://localhost:8080 y guardar request/response en `qa/evidencias/smoke/`; verificar que cada caso de API tiene su archivo
- [x] 2.2 Ejecutar los casos de UI en Chromium con zona horaria America/Bogota y guardar capturas en `qa/evidencias/smoke/`; verificar que cada caso de UI tiene su captura
- [x] 2.3 Registrar resultado, fecha, commit, zona horaria y navegador por caso, y escribir el veredicto de entrada; verificar que el documento cierra con "se puede probar" o "no se puede probar"

## 3. Cierre

- [x] 3.1 Ejecutar `openspec validate qa-smoke-suite --strict` y verificar que pasa
