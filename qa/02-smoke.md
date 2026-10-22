# Suite de humo

| Campo | Valor |
|---|---|
| Fecha de ejecución | 2026-10-22 |
| Commit bajo prueba | `026b991` (upstream `biaenergy`, merge del PR #2; el código de la app no se modificó) |
| Entorno | `docker compose up -d --build`; front http://localhost:3000, API http://localhost:8080 |
| Navegador (casos de UI) | Chromium 156.0.8078.4 headless (Playwright 1.64.1), viewport 1440x900, locale `es-CO` |
| Zona horaria | America/Bogota |
| Sistema operativo | WSL Ubuntu 26.04 sobre Windows 11 |
| Credenciales | `admin@energia.local` / `admin123` (README) |

## Criterio de selección

El humo contiene el mínimo de verificaciones cuyo fallo impediría o invalidaría la prueba funcional: que el servicio responda, que se pueda autenticar (por API y por la interfaz), que las rutas estén protegidas, y que cada área que consume la caja negra devuelva datos (libro de medidores, detalle, anomalías, resumen del despacho y Run AI Analysis). Se prefieren casos de API porque son rápidos y no dependen del renderizado; la UI se cubre con dos recorridos que atraviesan login, navegación, tabla y detalle. Cada caso comprueba disponibilidad y datos plausibles, no cifras exactas ni reglas de negocio: eso se verifica en `qa/03-casos-caja-negra.md`. Son 10 casos, el máximo permitido, y cada una de las áreas exigidas tiene al menos uno.

## Resultados

Todos los casos se ejecutaron el 2026-10-22 contra `026b991`. Las rutas de evidencia son relativas a `qa/`.

| ID | Capa | Verificación | Por qué es imprescindible | Resultado | Evidencia |
|---|---|---|---|---|---|
| SM-01 | API | `GET /health` responde 200 con `{"status":"ok"}` | Sin servicio vivo no hay nada que probar | PASA | [SM-01.txt](evidencias/smoke/SM-01.txt) |
| SM-02 | API | `POST /api/v1/auth/login` con credenciales válidas responde 200 con `access_token` | Sin token no se puede ejercer ninguna otra ruta de la API | PASA | [SM-02.txt](evidencias/smoke/SM-02.txt) |
| SM-03 | API | `POST /api/v1/meter/getAll` sin token responde 401 con el formato de error documentado | Si la ruta responde sin token, la protección de rutas no es fiable y las pruebas de seguridad pierden sentido | PASA | [SM-03.txt](evidencias/smoke/SM-03.txt) |
| SM-04 | API | `POST /api/v1/meter/getAll` con token y cuerpo vacío responde 200, `count` 12 y `rows` no vacío | Sin el libro de medidores no se pueden probar filtros, orden ni paginación | PASA | [SM-04.txt](evidencias/smoke/SM-04.txt) |
| SM-05 | API | `GET /api/v1/meter/getById/M-109` responde 200 con el detalle del medidor | Sin detalle no se puede probar la investigación de un medidor ni sus variables eléctricas | PASA | [SM-05.txt](evidencias/smoke/SM-05.txt) |
| SM-06 | API | `GET /api/v1/anomaly/getAll` responde 200 con una lista no vacía | Sin anomalías no se puede probar la pantalla de anomalías ni la apertura de investigación | PASA | [SM-06.txt](evidencias/smoke/SM-06.txt) |
| SM-07 | API | `GET /api/v1/dashboard/getSummary` responde 200 con el resumen | Sin resumen el despacho no muestra KPIs ni órdenes prioritarias | PASA | [SM-07.txt](evidencias/smoke/SM-07.txt) |
| SM-08 | API | `POST /api/v1/ai/analyze` responde 202 con un `id` y `GET /api/v1/ai/analysis/{id}` llega a `COMPLETED` | Sin análisis completado no se puede probar Run AI Analysis ni el estado "último análisis" | PASA | [SM-08.txt](evidencias/smoke/SM-08.txt) |
| SM-09 | UI | Login con el formulario (campos "Email" y "Contraseña") lleva a Despacho con KPIs visibles | Sin login por UI no se puede entrar a ninguna pantalla de la aplicación | PASA | [SM-09-despacho.png](evidencias/smoke/SM-09-despacho.png) |
| SM-10 | UI | Desde la navegación, Medidores (`/medidores`) muestra filas de la tabla y el detalle de M-109 se renderiza | Sin libro y detalle en la UI no se puede probar la consulta de medidores de extremo a extremo | PASA | [SM-10-libro.png](evidencias/smoke/SM-10-libro.png), [SM-10-detalle-M-109.png](evidencias/smoke/SM-10-detalle-M-109.png) |

## Reproducción

Prerrequisito: la app levantada con `docker compose up -d --build`. Los comandos de API usan la variable `TOKEN`; los archivos de evidencia guardan el JWT recortado a sus primeros 20 caracteres.

```bash
API=http://localhost:8080
TOKEN=$(curl -s -X POST $API/api/v1/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@energia.local","password":"admin123"}' | sed -E 's/.*"access_token":"([^"]+)".*/\1/')

# SM-01: esperado 200 {"status":"ok"}
curl -i $API/health

# SM-02: esperado 200 con access_token
curl -i -X POST $API/api/v1/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@energia.local","password":"admin123"}'

# SM-03: esperado 401 con status_code, message, timestamp y path
curl -i -X POST $API/api/v1/meter/getAll -H 'Content-Type: application/json'

# SM-04: esperado 200, count 12, rows no vacío
curl -i -X POST $API/api/v1/meter/getAll -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json'

# SM-05: esperado 200 con meter_id M-109
curl -i $API/api/v1/meter/getById/M-109 -H "Authorization: Bearer $TOKEN"

# SM-06: esperado 200, lista no vacía
curl -i $API/api/v1/anomaly/getAll -H "Authorization: Bearer $TOKEN"

# SM-07: esperado 200 con total_meters y priorities
curl -i $API/api/v1/dashboard/getSummary -H "Authorization: Bearer $TOKEN"

# SM-08: esperado 202 con id; luego sondeo hasta status COMPLETED (máximo 30 intentos)
ID=$(curl -s -X POST $API/api/v1/ai/analyze -H "Authorization: Bearer $TOKEN" | sed -E 's/.*"id":"([^"]+)".*/\1/')
for i in $(seq 1 30); do
  curl -s $API/api/v1/ai/analysis/$ID -H "Authorization: Bearer $TOKEN" | grep -q '"status":"COMPLETED"' && break
  sleep 1
done
```

SM-08 crea un análisis nuevo (en esta ejecución, `AN-0003`) y cambia el "último análisis" que muestra el front. Es la única verificación del humo que modifica estado.

Casos de UI (Chromium, zona horaria America/Bogota, viewport 1440x900):

1. SM-09: abrir http://localhost:3000, escribir `admin@energia.local` en "Email" y `admin123` en "Contraseña", pulsar "Entrar". Esperado: título "Despacho", panel "Estado de la planta" con KPIs (12 medidores, consumo del periodo, anomalías IA, alta prioridad, confianza IA) y el libro de medidores al pie.
2. SM-10: en la barra principal pulsar "Medidores". Esperado: URL `/medidores`, título "Libro de medidores" y 10 filas (página 1 de 12 medidores). Pulsar el enlace `M-109`. Esperado: URL `/medidores/M-109`, título "M-109", cifras clave, variables eléctricas e histórico por hora.

## Observaciones para caja negra

Estas observaciones no cambian el resultado de ningún caso de humo (el humo no juzga reglas de negocio). Quedan como candidatos a investigar en `qa/03-casos-caja-negra.md`.

- **M-106 en estado ALERT con anomalía `FALSE_POSITIVE`.** `backend/README.md` define que "sin anomalía, o `FALSE_POSITIVE`" corresponde a `NORMAL`. `getAll` y `getById` devuelven `status: "ALERT"` para M-106 (severidad `LOW`, prioridad 4), y la UI lo muestra como "Alerta". `anomaly/getAll` marca esa misma entrada con `anomaly: false`. Evidencia: [SM-04.txt](evidencias/smoke/SM-04.txt), [SM-06.txt](evidencias/smoke/SM-06.txt).
- **Contadores del despacho.** El resumen indica `status_counts` 8 normales, 2 alerta y 2 críticas, coherente con las filas del libro, pero el encabezado de Despacho dice "3 órdenes abiertas" mientras la orden principal dice "Orden 1 de 4". Las 4 incluyen el falso positivo; las 3 abiertas lo excluyen. Evidencia: [SM-09-despacho.png](evidencias/smoke/SM-09-despacho.png).
- **Hora de planta frente a UTC en los textos de la IA.** La orden de M-109 muestra "Detectada 12/09 09:00" (hora de Bogotá, API `2026-09-12T14:00:00Z`), pero el texto generado por el motor dice "desde 12/09 14:00" (UTC). La misma ventana se rotula con dos horas distintas en la misma pantalla. Evidencia: [SM-09-despacho.png](evidencias/smoke/SM-09-despacho.png), [SM-06.txt](evidencias/smoke/SM-06.txt).
- **Texto en inglés en una interfaz en español.** El evento registrado de M-109 muestra "No operational event reported". Evidencia: [SM-10-detalle-M-109.png](evidencias/smoke/SM-10-detalle-M-109.png).
- **Cuerpo del 401 sin `errors`.** El README muestra el formato de error con `status_code`, `message`, `errors`, `timestamp` y `path`; la respuesta 401 trae todos menos `errors`. Puede ser una omisión válida cuando no hay detalle, pero hay que confirmarlo. Evidencia: [SM-03.txt](evidencias/smoke/SM-03.txt).
- **Análisis instantáneo.** El análisis `AN-0003` pasó de `RUNNING` a `COMPLETED` en 28 ms y ya estaba completo en el primer sondeo. Con ese tiempo el estado intermedio que describe el README (pasos que avanzan, polling del front) es difícil de observar; se ejercita mejor con una intercepción de red en la caja negra. Evidencia: [SM-08.txt](evidencias/smoke/SM-08.txt).

## Automatización

Los 10 casos son candidatos a automatizarse con la etiqueta `@smoke` en el change `e2e-framework`. Las capturas y los archivos de `qa/evidencias/smoke/` son la línea base contra la que se compara esa automatización.

## Veredicto de entrada

**Se puede probar.** Los 10 casos pasan sobre `026b991`: el servicio responde, la autenticación funciona por API y UI, las rutas están protegidas, y el libro, el detalle, las anomalías, el resumen y Run AI Analysis devuelven datos plausibles. Ningún fallo bloquea la ejecución funcional. Las observaciones de la sección anterior no impiden probar y se llevan a la caja negra y al reporte de defectos.
