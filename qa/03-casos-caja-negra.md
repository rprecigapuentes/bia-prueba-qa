# Casos de caja negra · EnergIA

Diseñados solo desde la documentación (`README.md`, `backend/README.md`, `frontend/README.md`, `frontend/PRODUCT.md`), el Swagger, la UI en ejecución y las sesiones exploratorias. Ningún caso cita código de la aplicación. Build `026b991`, app en Docker, UI en Chromium con `America/Bogota` y `es-CO`. Los riesgos `R1`–`R9` y los oráculos HICCUPPS son los de [`01-plan-de-pruebas.md`](01-plan-de-pruebas.md). La versión tabular está en [`03-casos-caja-negra.csv`](03-casos-caja-negra.csv).

Orden de aplicación: exploratorio → funcional (tablas de decisión y consistencia entre capas) → dominio (partición de equivalencia y valores límite) → combinatorio (pairwise).

## 1. Exploratorio

Cuatro sesiones de 10 minutos con charter. El registro completo está en [`evidencias/exploratorio/sesiones.md`](evidencias/exploratorio/sesiones.md).

| Sesión | Charter | Ejecutor | Hallazgos que llevaron a casos |
|---|---|---|---|
| 1 | Libro de medidores: filtros, búsqueda, orden y paginación | Rosemberth (manual) | Paginación bloqueada en la página 1 (TC-12); conteo por estado 8/2/2 contra 9/1/2 documentado (TC-09, TC-17); búsqueda y estado en la URL (TC-05, TC-21); "M 111" con espacio no encuentra nada (observación de usabilidad) |
| 2 | Despacho y KPIs contra la documentación | Agente, con Playwright | KPIs 8/2/2 (TC-17); "3 órdenes abiertas" frente a "Orden 1 de 4" (TC-18); M-106 "No escalar" con sello "Alerta" (TC-13) |
| 3 | Cifras y horas de detalle e investigación | Agente, con Playwright | Cifras de M-109 correctas (TC-19); horas corridas 5 h frente al texto de la IA (TC-20); textos en inglés (TC-25) |
| 4 | Run AI Analysis, sesión y rutas | Rosemberth (manual) | Análisis repetidos sin solaparse (TC-23); ruta protegida pide login (TC-22); medidor y ruta inexistentes (TC-07); email en mayúsculas (TC-01); sin gestión de usuarios, que `PRODUCT.md` declara fuera del producto |

Rosemberth confirmó a mano, además, los resultados de TC-12 (paginación), TC-21 (filtros tras F5), TC-22, TC-07 y TC-01.

## 2. Funcional

### 2.1 Tabla de decisión: tipo de anomalía → estado del medidor

Fuente: `backend/README.md`, "Estado de alerta de un medidor". Condiciones: si hay anomalía, su tipo y su severidad. Acción: el estado.

| Regla | ¿Anomalía? | Tipo | Severidad | Estado esperado | Medidor que la ejerce |
|---|---|---|---|---|---|
| D1 | No | — | — | `NORMAL` | M-101 (y los otros 7 sanos) |
| D2 | Sí | `FALSE_POSITIVE` | `LOW` | `NORMAL` | M-106 |
| D3 | Sí | `REAL_ANOMALY` | `HIGH` | `CRITICAL` | M-109 |
| D4 | Sí | `DATA_QUALITY` | `HIGH` | `CRITICAL` | M-112 |
| D5 | Sí | `EXPLAINABLE_ANOMALY` | `MEDIUM` | `ALERT` | M-104 |

La regla "severidad `HIGH` → `CRITICAL`" se evalúa antes que "cualquier otra anomalía → `ALERT`". D2 es la regla excepcional: un falso positivo tiene anomalía, pero su estado es `NORMAL`. Consecuencia esperada sobre el dataset: **9 `NORMAL`, 1 `ALERT`, 2 `CRITICAL`**.

### 2.2 Tabla de decisión: severidad por tipo

Fuente: `backend/README.md`, "8. Severidad". En el dataset solo es observable una combinación por tipo; los límites exactos (20 %, 50 %, 12 h) no se alcanzan con datos fijos y se cubren con tests unitarios en la caja blanca (`04-caja-blanca.md`).

| Tipo | Condición | Severidad esperada | Caso en el dataset |
|---|---|---|---|
| `REAL_ANOMALY` | variación > 50 % y activa | `HIGH` | M-109 (+110,5 %, activa) |
| `REAL_ANOMALY` | variación > 20 % | `MEDIUM` | — |
| `REAL_ANOMALY` | resto | `LOW` | — |
| `DATA_QUALITY` | ≥ 12 h sospechosas | `HIGH` | M-112 (16 h) |
| `DATA_QUALITY` | < 12 h | `MEDIUM` | — |
| `EXPLAINABLE_ANOMALY` | siempre | `MEDIUM` | M-104 |
| `FALSE_POSITIVE` | siempre | `LOW` | M-106 |

### 2.3 Tabla de decisión: prioridad

Fuente: `backend/README.md`, "10. Priorización". Orden: severidad, luego energía en juego, luego confianza.

| Posición | Medidor | Severidad | Energía en juego | Confianza | Desempate aplicado |
|---|---|---|---|---|---|
| 1 | M-109 | `HIGH` | 2.825 kWh | 0,95 | Energía: 2.825 > 0 |
| 2 | M-112 | `HIGH` | 0 kWh | 0,95 | Energía |
| 3 | M-104 | `MEDIUM` | — | 0,86 | Severidad |
| 4 | M-106 | `LOW` | — | 0,86 | Severidad |

### 2.4 Matriz de consistencia entre capas

Oráculos: Claims (documentación) y Product (el mismo dato en otra capa o pantalla). Cada fila se compara en las tres fuentes.

| Dato | Documentación | API | UI |
|---|---|---|---|
| Conteo por estado | 9 / 1 / 2 (tabla 2.1) | `dashboard/getSummary.status_counts` | KPI "Medidores" de Despacho |
| Órdenes abiertas | 4 anomalías, 2 prioritarias; M-106 "No escalar" | `anomaly/getAll` | Subtítulo de Despacho y "Orden 1 de N" |
| Cifras de M-109 | 2.207,6 kWh · 1.052,15 kWh · +109,8 % | `meter/getById/M-109` | Detalle y libro |
| Hora de detección de M-109 | 12/09 14:00, hora de planta sin convertir | `detected_at` = `2026-09-12T14:00:00Z` | Despacho, Anomalías, Investigación |
| Última lectura | 14/09 23:00 (14 días de lecturas horarias desde 01/09 00:00) | `last_reading_at` | Libro y detalle |
| Estado de M-106 | `NORMAL` (regla D2) | `status` en `getAll` y `getById` | Sello en libro y detalle |

## 3. Dominio

### 3.1 Partición de equivalencia

| Variable | Clase | Representante | Válida | Resultado esperado | Fuente |
|---|---|---|---|---|---|
| Login | Credenciales correctas | `admin@energia.local` / `admin123` | Sí | 200 + token | `backend/README.md`, Login |
| Login | Email con otra capitalización | `ADMIN@energia.local` | Sí | 200 (el email no distingue mayúsculas) | Standards: RFC 5321 en la práctica |
| Login | Contraseña incorrecta | `admin123` → `mala` | No | 401, formato de error | Formato de error del README |
| Login | Email inexistente | `otro@energia.local` | No | 401, mismo mensaje que contraseña incorrecta | Standards: OWASP, no revelar qué campo falla |
| Login | Campos vacíos | `""` / `""` | No | 400 con `errors` | Formato de error del README |
| `meter_id` (búsqueda) | Parcial | `109` | Sí | M-109 | README: "`109` encuentra `M-109`" |
| `meter_id` | Exacta | `M-109` | Sí | M-109 | README |
| `meter_id` | Minúsculas | `m-109` | Sí | M-109 | README: "sin importar mayúsculas" |
| `meter_id` | Sin coincidencia | `M-999` | Sí | 200, `count` 0 | README (búsqueda, no error) |
| `status` | Valor del dominio | `NORMAL`, `ALERT`, `CRITICAL` | Sí | Solo medidores de ese estado | README, tabla de estados |
| `status` | Fuera del dominio | `critical`, `FOO` | No | 400 "filter.status debe ser NORMAL, ALERT o CRITICAL" | README, ejemplo de error |
| `getById` | Inexistente | `M-999` | No | 404, formato de error | Standards: HTTP |
| Token | Ausente / alterado / sin `Bearer` | — | No | 401 | README: "Todas las demás rutas lo exigen" |

### 3.2 Valores límite

| Variable | Dominio documentado | Puntos elegidos | Esperado | Fuente |
|---|---|---|---|---|
| `pagination.size` | 1–100 | 0, 1, 100, 101 | 400, 1 fila, 12 filas, 400 | Swagger (`minimum: 1`, `maximum: 100`) |
| `pagination.page` | ≥ 1 | -1, 1, 2, 3 | 400; 10 filas; 2 filas; 0 filas con `count` 12 | Swagger (`minimum: 1`) |
| Paginación UI (12 medidores, 10 por página) | páginas 1–2 | fila 10, fila 11, última página | "1–10 de 12", "11–12 de 12", Siguiente deshabilitado en la página 2 | README (12 medidores, página de 10) |

## 4. Combinatorio

Modelo PICT de `POST /meter/getAll` en [`evidencias/pairwise/getall.pict`](evidencias/pairwise/getall.pict): 4 parámetros (estado 4 valores, `sort_by` 5, `sort_order` 3, `meter_id` 6). Exhaustivo serían 360 combinaciones; PICT cubre los 119 pares con **30** ([`getall.pict.out.tsv`](evidencias/pairwise/getall.pict.out.tsv)).

Oráculo de cada combinación, calculado desde la documentación y no desde la respuesta:

1. **Filtro:** cada fila tiene el estado pedido según la tabla 2.1.
2. **Búsqueda:** cada `meter_id` contiene el término sin distinguir mayúsculas.
3. **Conteo:** `count` es igual al número de medidores que cumplen 1 y 2 a la vez.
4. **Orden:** las filas son monótonas según `sort_by` y `sort_order` (por defecto `meter_id` `ASC`; severidad `HIGH` > `MEDIUM` > `LOW` > sin anomalía).

## 5. Casos

| ID | Título | Técnica | Riesgo | Capa | Estado | Defecto |
|---|---|---|---|---|---|---|
| [TC-01](#tc-01) | Verifica que el login con contraseña incorrecta o email inexistente responde 401 con el mismo mensaje | Partición de equivalencia | R7 | API | PASA | — |
| [TC-02](#tc-02) | Verifica que el login con campos vacíos responde 400 con el detalle en errors | Partición de equivalencia (negativa) | R6 | API | PASA | — |
| [TC-03](#tc-03) | Verifica que el login con contraseña incorrecta en la UI muestra el error y no sale de /login | Partición de equivalencia (negativa) | R7 | UI | PASA | — |
| [TC-04](#tc-04) | Verifica que una ruta protegida rechaza con 401 un token ausente, alterado o sin prefijo Bearer | Partición de equivalencia (negativa) | R7 | API | PASA | — |
| [TC-05](#tc-05) | Verifica que buscar 109 devuelve solo M-109 | Partición de equivalencia | R3 | API | PASA | — |
| [TC-06](#tc-06) | Verifica que buscar m-109 en minúsculas devuelve M-109 en la API y en el libro | Partición de equivalencia | R3 | API + UI | FALLA | BUG-04 |
| [TC-07](#tc-07) | Verifica que un medidor inexistente da lista vacía en la búsqueda y 404 en el detalle | Partición de equivalencia | R3 | API + UI | PASA | — |
| [TC-08](#tc-08) | Verifica que un estado fuera del dominio responde 400 con el mensaje documentado | Partición de equivalencia (negativa) | R6 | API | FALLA | BUG-07 (retirado) |
| [TC-09](#tc-09) | Verifica que filtrar por ALERT devuelve solo M-104 | Tabla de decisión (D2, D5) | R1 | API + UI | FALLA | BUG-01 |
| [TC-10](#tc-10) | Verifica que size fuera de 1–100 responde 400 y en los límites devuelve 1 y 12 filas | Valores límite | R3 | API | FALLA | BUG-06 |
| [TC-11](#tc-11) | Verifica que page por debajo de 1 responde 400 y la última página trae los 2 medidores restantes | Valores límite | R3 | API | FALLA | BUG-05 |
| [TC-12](#tc-12) | Verifica que desde la paginación del libro se llega a la página 2 con M-111 y M-112 | Valores límite | R3 | UI | FALLA | BUG-03 |
| [TC-13](#tc-13) | Verifica que el estado de cada medidor cumple la tabla tipo → estado | Tabla de decisión (D1–D5) | R1 | API + UI | FALLA | BUG-01 |
| [TC-14](#tc-14) | Verifica que las anomalías salen en el orden de prioridad M-109, M-112, M-104, M-106 | Tabla de decisión (prioridad) | R4 | API + UI | PASA | — |
| [TC-15](#tc-15) | Verifica que tipo, severidad y confianza de las 4 anomalías coinciden con la tabla del README | Tabla de decisión (severidad) | R4 | API | PASA | — |
| [TC-16](#tc-16) | Verifica que las 30 combinaciones pairwise de getAll cumplen filtro, búsqueda, conteo y orden | Combinatorio (pairwise, PICT) | R3 | API | FALLA | BUG-01, BUG-04 |
| [TC-17](#tc-17) | Verifica que el conteo por estado es 9 normales, 1 alerta y 2 críticas en la doc, la API y Despacho | Consistencia entre capas | R1 | API + UI | FALLA | BUG-01 |
| [TC-18](#tc-18) | Verifica que Despacho cuenta las mismas órdenes en el subtítulo y en la numeración de las órdenes | Consistencia entre capas | R5 | UI | FALLA | BUG-08 |
| [TC-19](#tc-19) | Verifica que las cifras de M-109 coinciden entre el README, la API y la UI | Consistencia entre capas | R4 | API + UI | PASA | — |
| [TC-20](#tc-20) | Verifica que las horas de planta se muestran tal como vienen, sin convertir a la zona del navegador | Consistencia entre capas | R2 | API + UI | FALLA | BUG-02 |
| [TC-21](#tc-21) | Verifica que los filtros del libro se conservan en la URL al recargar y al volver | Funcional (estado) | R3 | UI | PASA | — |
| [TC-22](#tc-22) | Verifica que una ruta protegida sin sesión redirige a /login | Funcional (estado) | R7 | UI | PASA | — |
| [TC-23](#tc-23) | Verifica que dos Run AI Analysis simultáneos no corren dos análisis a la vez | Funcional (concurrencia) | R8 | API | PASA | — |
| [TC-24](#tc-24) | Verifica que la hoja de Run AI Analysis muestra los 7 pasos completados y el resumen | Funcional | R8 | UI | PASA | — |
| [TC-25](#tc-25) | Verifica que la interfaz muestra los textos en español y las cifras con formato es-CO | Funcional (presentación) | R9 | UI | FALLA | BUG-09 |

### TC-01

**Verifica que el login con contraseña incorrecta o email inexistente responde 401 con el mismo mensaje**

- **Técnica:** Partición de equivalencia · **Riesgo:** R7 · **Capa:** API
- **Oráculo:** Claims (formato de error, backend/README.md); Standards (OWASP: no revelar qué campo falla)
- **Precondición:** API arriba
- **Pasos:** POST /api/v1/auth/login con cada dato
- **Datos:** admin@energia.local/mala; otro@energia.local/admin123; ADMIN@energia.local/admin123
- **Resultado esperado:** 401 con status_code, message, timestamp y path, mismo message en los dos inválidos; el email en mayúsculas responde 200
- **Resultado obtenido:** POST login con admin@energia.local/mala y con otro@energia.local/admin123: 401 en ambos, mismo message 'Email o contraseña incorrectos', con status_code, timestamp y path. ADMIN@energia.local/admin123: 200 con access_token. Evidencia: TC-01/api.txt.
- **Estado:** PASA
- **Evidencia:** [evidencias/TC-01/](evidencias/TC-01/)

### TC-02

**Verifica que el login con campos vacíos responde 400 con el detalle en errors**

- **Técnica:** Partición de equivalencia (negativa) · **Riesgo:** R6 · **Capa:** API
- **Oráculo:** Claims (formato de error con errors, backend/README.md)
- **Precondición:** API arriba
- **Pasos:** POST /api/v1/auth/login con email y contraseña vacíos; luego con body vacío
- **Datos:** {"email":"","password":""}; sin body
- **Resultado esperado:** 400 con errors que nombra los campos faltantes
- **Resultado obtenido:** Con {"email":"","password":""} y sin body: 400, message 'Datos inválidos', errors ['email es obligatorio','password es obligatorio'], con timestamp y path. Evidencia: TC-02/api.txt.
- **Estado:** PASA
- **Evidencia:** [evidencias/TC-02/](evidencias/TC-02/)

### TC-03

**Verifica que el login con contraseña incorrecta en la UI muestra el error y no sale de /login**

- **Técnica:** Partición de equivalencia (negativa) · **Riesgo:** R7 · **Capa:** UI
- **Oráculo:** User desires (el operador entiende por qué no entró); Standards (WCAG: error anunciado)
- **Precondición:** Sin sesión
- **Pasos:** Abrir /login, escribir admin@energia.local y mala, pulsar Entrar
- **Datos:** admin@energia.local / mala
- **Resultado esperado:** Mensaje de error visible con rol alert; la URL sigue en /login; el campo email conserva el valor
- **Resultado obtenido:** Con admin@energia.local / mala: se muestra un elemento role=alert con 'Email o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.'; la URL sigue en /login; el campo Email conserva admin@energia.local. Evidencia: TC-03/ui-1-formulario-lleno.png, ui-2-error-alert.png.
- **Estado:** PASA
- **Evidencia:** [evidencias/TC-03/](evidencias/TC-03/)

### TC-04

**Verifica que una ruta protegida rechaza con 401 un token ausente, alterado o sin prefijo Bearer**

- **Técnica:** Partición de equivalencia (negativa) · **Riesgo:** R7 · **Capa:** API
- **Oráculo:** Claims (backend/README.md: todas las rutas de /api/v1 exigen el token)
- **Precondición:** Token válido obtenido
- **Pasos:** GET /api/v1/auth/me con cada variante de header
- **Datos:** sin header; token con la firma alterada; token sin 'Bearer '
- **Resultado esperado:** 401 con formato de error en las tres variantes
- **Resultado obtenido:** GET /auth/me: sin header 401 'Falta el token de autenticación'; token con los últimos 4 caracteres alterados 401 'Token inválido o expirado'; token sin 'Bearer ' 401 'Falta el token de autenticación'. Las tres con status_code, message, timestamp y path. Control con token válido: 200. Evidencia: TC-04/api.txt.
- **Estado:** PASA
- **Evidencia:** [evidencias/TC-04/](evidencias/TC-04/)

### TC-05

**Verifica que buscar 109 devuelve solo M-109**

- **Técnica:** Partición de equivalencia · **Riesgo:** R3 · **Capa:** API
- **Oráculo:** Claims (backend/README.md: "109 encuentra M-109")
- **Precondición:** Token válido
- **Pasos:** POST /api/v1/meter/getAll con filter.meter_id
- **Datos:** 109
- **Resultado esperado:** 200, count 1, rows[0].meter_id = M-109
- **Resultado obtenido:** getAll con meter_id '109': 200, count 1, rows[0].meter_id M-109 (CRITICAL, 2207.6 kWh). Evidencia: TC-05/api.txt.
- **Estado:** PASA
- **Evidencia:** [evidencias/TC-05/](evidencias/TC-05/)

### TC-06

**Verifica que buscar m-109 en minúsculas devuelve M-109 en la API y en el libro**

- **Técnica:** Partición de equivalencia · **Riesgo:** R3 · **Capa:** API + UI
- **Oráculo:** Claims (backend/README.md y Swagger: "sin importar mayúsculas"); Product (getById sí acepta minúsculas)
- **Precondición:** Token válido / sesión iniciada
- **Pasos:** API: getAll con meter_id m-109. UI: en /medidores escribir m-109 y pulsar Buscar medidor
- **Datos:** m-109
- **Resultado esperado:** API count 1 con M-109; la UI muestra la fila M-109
- **Resultado obtenido:** API: getAll con meter_id 'm-109' devuelve 200 con count 0 y rows [] (el README dice que no distingue mayúsculas). UI: /medidores?medidor=m-109 muestra 'Ningún medidor coincide con los filtros. No hay medidores que contengan "m-109"'. Evidencia: TC-06/api.txt, TC-06/ui-1-busqueda-m-109.png.
- **Estado:** FALLA · **Defecto:** BUG-04
- **Evidencia:** [evidencias/TC-06/](evidencias/TC-06/)

### TC-07

**Verifica que un medidor inexistente da lista vacía en la búsqueda y 404 en el detalle**

- **Técnica:** Partición de equivalencia · **Riesgo:** R3 · **Capa:** API + UI
- **Oráculo:** Claims (búsqueda parcial); Standards (HTTP 404 para recurso inexistente)
- **Precondición:** Token válido / sesión iniciada
- **Pasos:** API: getAll con meter_id M-999 y getById/M-999. UI: buscar M-999 y abrir /medidores/M-999
- **Datos:** M-999
- **Resultado esperado:** getAll 200 con count 0; getById 404 con formato de error; la UI muestra estado vacío y una pantalla de 'no encontrado'
- **Resultado obtenido:** getAll con M-999: 200, count 0, rows []. getById/M-999: 404 'Medidor no encontrado' con status_code, timestamp y path. UI: la búsqueda M-999 muestra 'Ningún medidor coincide con los filtros'; /medidores/M-999 muestra 'No existe el medidor M-999' con el botón 'Ir al libro de medidores'. Evidencia: TC-07/api.txt, ui-1-busqueda-m-999-vacio.png, ui-2-detalle-m-999-no-encontrado.png.
- **Estado:** PASA
- **Evidencia:** [evidencias/TC-07/](evidencias/TC-07/)

### TC-08

**Verifica que un estado fuera del dominio responde 400 con el mensaje documentado**

- **Técnica:** Partición de equivalencia (negativa) · **Riesgo:** R6 · **Capa:** API
- **Oráculo:** Claims (backend/README.md, ejemplo de error de getAll)
- **Precondición:** Token válido
- **Pasos:** POST getAll con filter.status inválido; repetir con sort_by inválido
- **Datos:** status critical; status FOO; sort_by nombre
- **Resultado esperado:** 400, message "Filtros inválidos", errors con "filter.status debe ser NORMAL, ALERT o CRITICAL" (o el equivalente para sort_by)
- **Resultado obtenido:** status 'FOO': 400 'Filtros inválidos' con 'filter.status debe ser NORMAL, ALERT o CRITICAL' (correcto). sort_by 'nombre': 400 con 'filter.sort_by debe ser meter_id, consumption, variation o severity' (correcto). status 'critical' (minúsculas): 200 con count 2 (M-109 y M-112) en lugar de 400. Evidencia: TC-08/api.txt.
- **Estado:** FALLA · **Defecto:** BUG-07, retirado después de la caja blanca: la conversión a mayúsculas es intencional (`meter/dto.go:49`, `meter/service_test.go:61`). Queda como observación de contrato; ver [`05-defectos.md`](05-defectos.md).
- **Evidencia:** [evidencias/TC-08/](evidencias/TC-08/)

### TC-09

**Verifica que filtrar por ALERT devuelve solo M-104**

- **Técnica:** Tabla de decisión (D2, D5) · **Riesgo:** R1 · **Capa:** API + UI
- **Oráculo:** Claims (backend/README.md, estado de alerta: FALSE_POSITIVE → NORMAL)
- **Precondición:** Token válido / sesión iniciada
- **Pasos:** API: getAll con status ALERT y size 100. UI: en /medidores elegir Alertas
- **Datos:** ALERT / Alertas
- **Resultado esperado:** Solo M-104 (count 1); M-106 aparece con filtro NORMAL
- **Resultado obtenido:** API: status ALERT devuelve count 2, M-104 (MEDIUM) y M-106 (LOW, FALSE_POSITIVE) en lugar de solo M-104; con NORMAL count 8 y M-106 no aparece. UI: el filtro Alertas muestra '1–2 de 2 medidores' con M-104 y M-106 (ambos sello Alerta). Evidencia: TC-09/api.txt, ui-1-filtro-alertas.png, ui-2-filtro-normales.png.
- **Estado:** FALLA · **Defecto:** BUG-01
- **Evidencia:** [evidencias/TC-09/](evidencias/TC-09/)

### TC-10

**Verifica que size fuera de 1–100 responde 400 y en los límites devuelve 1 y 12 filas**

- **Técnica:** Valores límite · **Riesgo:** R3 · **Capa:** API
- **Oráculo:** Claims (Swagger: size minimum 1, maximum 100)
- **Precondición:** Token válido
- **Pasos:** POST getAll con pagination.size en cada punto
- **Datos:** size 0, 1, 100, 101
- **Resultado esperado:** 0 → 400; 1 → 1 fila y count 12; 100 → 12 filas; 101 → 400
- **Resultado obtenido:** size 0: 200 con size 10 y 10 filas (esperado 400). size 1: 1 fila, count 12. size 100: 12 filas. size 101: 400 'pagination.size debe estar entre 1 y 100'. Evidencia: TC-10/api.txt.
- **Estado:** FALLA · **Defecto:** BUG-06
- **Evidencia:** [evidencias/TC-10/](evidencias/TC-10/)

### TC-11

**Verifica que page por debajo de 1 responde 400 y la última página trae los 2 medidores restantes**

- **Técnica:** Valores límite · **Riesgo:** R3 · **Capa:** API
- **Oráculo:** Claims (Swagger: page minimum 1; formato de error 400 del README)
- **Precondición:** Token válido
- **Pasos:** POST getAll con size 10 y page en cada punto
- **Datos:** page -1, 1, 2, 3
- **Resultado esperado:** -1 → 400 con formato de error; 1 → 10 filas; 2 → 2 filas (M-111, M-112); 3 → 0 filas con count 12
- **Resultado obtenido:** page -1: 500 'Error interno del servidor' (esperado 400). page 1: 10 filas. page 2: 2 filas (M-111, M-112). page 3: 0 filas con count 12. Evidencia: TC-11/api.txt.
- **Estado:** FALLA · **Defecto:** BUG-05
- **Evidencia:** [evidencias/TC-11/](evidencias/TC-11/)

### TC-12

**Verifica que desde la paginación del libro se llega a la página 2 con M-111 y M-112**

- **Técnica:** Valores límite · **Riesgo:** R3 · **Capa:** UI
- **Oráculo:** Claims (PRODUCT.md: 12 medidores; página de 10); Product (la API sí devuelve la página 2)
- **Precondición:** Sesión iniciada, /medidores sin filtros
- **Pasos:** Leer el resumen de la paginación; pulsar Siguiente
- **Datos:** 12 medidores, 10 por página
- **Resultado esperado:** "1–10 de 12 medidores" con Siguiente habilitado; en la página 2, "11–12 de 12 medidores" con M-111 y M-112
- **Resultado obtenido:** El resumen dice '1–10 de 12 medidores' con 10 filas, pero los botones Anterior y Siguiente están deshabilitados (atributo disabled); al forzar el clic no cambia nada y sigue '1–10 de 12'. La página 2 solo se alcanza editando la URL (/medidores?pagina=2: '11–12 de 12 medidores' con M-111 y M-112; Siguiente deshabilitado, Anterior habilitado). Evidencia: TC-12/ui-1-pagina-1.png, ui-2-tras-pulsar-siguiente.png, ui-3-pagina-2-por-url.png.
- **Estado:** FALLA · **Defecto:** BUG-03
- **Evidencia:** [evidencias/TC-12/](evidencias/TC-12/)

### TC-13

**Verifica que el estado de cada medidor cumple la tabla tipo → estado**

- **Técnica:** Tabla de decisión (D1–D5) · **Riesgo:** R1 · **Capa:** API + UI
- **Oráculo:** Claims (backend/README.md, estado de alerta)
- **Precondición:** Token válido / sesión iniciada
- **Pasos:** API: getById de M-101, M-106, M-109, M-112 y M-104. UI: sello de estado en el libro y en el detalle
- **Datos:** Reglas D1–D5
- **Resultado esperado:** M-101 NORMAL, M-106 NORMAL, M-109 CRITICAL, M-112 CRITICAL, M-104 ALERT; la UI muestra Normal, Normal, Crítica, Crítica, Alerta
- **Resultado obtenido:** API getById: M-101 NORMAL, M-106 ALERT (esperado NORMAL), M-109 CRITICAL, M-112 CRITICAL, M-104 ALERT. UI (libro y detalle): M-101 Normal, M-106 Alerta (esperado Normal), M-109 Crítica, M-112 Crítica, M-104 Alerta. Solo M-106 incumple. Evidencia: TC-13/api.txt, ui-1-libro-estados.png, ui-2-libro-criticas-m-112.png, ui-3..7-detalle-*.png.
- **Estado:** FALLA · **Defecto:** BUG-01
- **Evidencia:** [evidencias/TC-13/](evidencias/TC-13/)

### TC-14

**Verifica que las anomalías salen en el orden de prioridad M-109, M-112, M-104, M-106**

- **Técnica:** Tabla de decisión (prioridad) · **Riesgo:** R4 · **Capa:** API + UI
- **Oráculo:** Claims (backend/README.md, priorización y tabla de resultados)
- **Precondición:** Token válido / sesión iniciada
- **Pasos:** API: anomaly/getAll. UI: tabla de /anomalias
- **Datos:** —
- **Resultado esperado:** priority 1..4 = M-109, M-112, M-104, M-106 en la API y en la UI
- **Resultado obtenido:** API anomaly/getAll: priority 1..4 = M-109, M-112, M-104, M-106. UI /anomalias: filas Prior. 1 M-109, 2 M-112, 3 M-104, 4 M-106. Evidencia: TC-14/api.txt, ui-1-tabla-anomalias.png.
- **Estado:** PASA
- **Evidencia:** [evidencias/TC-14/](evidencias/TC-14/)

### TC-15

**Verifica que tipo, severidad y confianza de las 4 anomalías coinciden con la tabla del README**

- **Técnica:** Tabla de decisión (severidad) · **Riesgo:** R4 · **Capa:** API
- **Oráculo:** Claims (backend/README.md, resultado sobre el dataset)
- **Precondición:** Token válido
- **Pasos:** GET anomaly/getAll
- **Datos:** Tabla 2.2
- **Resultado esperado:** M-109 REAL_ANOMALY HIGH 0,95; M-112 DATA_QUALITY HIGH 0,95; M-104 EXPLAINABLE_ANOMALY MEDIUM 0,86; M-106 FALSE_POSITIVE LOW 0,86
- **Resultado obtenido:** anomaly/getAll: M-109 REAL_ANOMALY HIGH 0.95; M-112 DATA_QUALITY HIGH 0.95; M-104 EXPLAINABLE_ANOMALY MEDIUM 0.86; M-106 FALSE_POSITIVE LOW 0.86. Evidencia: TC-15/api.txt.
- **Estado:** PASA
- **Evidencia:** [evidencias/TC-15/](evidencias/TC-15/)

### TC-16

**Verifica que las 30 combinaciones pairwise de getAll cumplen filtro, búsqueda, conteo y orden**

- **Técnica:** Combinatorio (pairwise, PICT) · **Riesgo:** R3 · **Capa:** API
- **Oráculo:** Claims (backend/README.md, body de getAll y tabla de estados)
- **Precondición:** Token válido
- **Pasos:** Ejecutar cada fila de getall.pict.out.tsv contra getAll con size 100 y evaluar las 4 reglas del oráculo
- **Datos:** evidencias/pairwise/getall.pict.out.tsv
- **Resultado esperado:** Las 30 combinaciones cumplen las 4 reglas
- **Resultado obtenido:** 19 de 30 combinaciones cumplen las 4 reglas; 11 fallan. Regla 1 (filtro) falla en 2 (#12 y #13: ALERT devuelve M-106). Regla 2 (búsqueda) 0 fallos. Regla 3 (conteo) falla en 11 (#3,5,7,8,12,13,14,22,26,27,29): 5 por la búsqueda 'm-10' en minúsculas (count 0), 4 por NORMAL con 8 en lugar de 9 (M-106 fuera) y 2 por ALERT con 2 en lugar de 1. Regla 4 (orden) 0 fallos; severity ordena sin anomalía < LOW < MEDIUM < HIGH en ASC y al revés en DESC. Evidencia: pairwise/getall.results.csv, pairwise/severity-sentido.txt.
- **Estado:** FALLA · **Defecto:** BUG-01, BUG-04
- **Evidencia:** [evidencias/pairwise/](evidencias/pairwise/)

### TC-17

**Verifica que el conteo por estado es 9 normales, 1 alerta y 2 críticas en la doc, la API y Despacho**

- **Técnica:** Consistencia entre capas · **Riesgo:** R1 · **Capa:** API + UI
- **Oráculo:** Claims (tabla 2.1); Product (API vs. Despacho)
- **Precondición:** Token válido / sesión iniciada
- **Pasos:** API: dashboard/getSummary. UI: KPI Medidores en Despacho
- **Datos:** —
- **Resultado esperado:** status_counts normal 9, alert 1, critical 2; la UI muestra 9 normales · 1 alerta · 2 críticas
- **Resultado obtenido:** API dashboard/getSummary: status_counts normal 8, alert 2, critical 2 (esperado 9/1/2). UI Despacho, KPI Medidores: '12 · 8 normales · 2 alerta · 2 críticas'. API y UI coinciden entre sí pero no con la documentación. Evidencia: TC-17/api.txt, ui-1-despacho-kpi.png, ui-2-kpi-estado-planta.png.
- **Estado:** FALLA · **Defecto:** BUG-01
- **Evidencia:** [evidencias/TC-17/](evidencias/TC-17/)

### TC-18

**Verifica que Despacho cuenta las mismas órdenes en el subtítulo y en la numeración de las órdenes**

- **Técnica:** Consistencia entre capas · **Riesgo:** R5 · **Capa:** UI
- **Oráculo:** Product (subtítulo vs. tarjetas de la misma pantalla); Purpose (M-106 es No escalar)
- **Precondición:** Sesión iniciada
- **Pasos:** Abrir Despacho; leer el subtítulo y el encabezado de la primera orden
- **Datos:** —
- **Resultado esperado:** El número de órdenes abiertas del subtítulo coincide con el total de la numeración ("Orden 1 de N")
- **Resultado obtenido:** El subtítulo de Despacho dice '3 órdenes abiertas, ordenadas por prioridad' y la primera orden dice 'Orden 1 de 4 · Prioridad máxima'; la región muestra 4 tarjetas (M-109, M-112, M-104, M-106 'No escalar'). 3 no coincide con 4. Evidencia: TC-18/ui-1-despacho-ordenes.png, ui-2-despacho-completo.png.
- **Estado:** FALLA · **Defecto:** BUG-08
- **Evidencia:** [evidencias/TC-18/](evidencias/TC-18/)

### TC-19

**Verifica que las cifras de M-109 coinciden entre el README, la API y la UI**

- **Técnica:** Consistencia entre capas · **Riesgo:** R4 · **Capa:** API + UI
- **Oráculo:** Claims (backend/README.md, ejemplo M-109); Product (API vs. libro vs. detalle)
- **Precondición:** Token válido / sesión iniciada
- **Pasos:** API: getById/M-109. UI: fila de M-109 en el libro y detalle
- **Datos:** M-109
- **Resultado esperado:** consumo 2.207,6 kWh, baseline 1.052,15 kWh (1.052,2 redondeado en UI), variación +109,8 %
- **Resultado obtenido:** API getById/M-109: consumption_kwh 2207.6, baseline_kwh 1052.15, variation_pct 109.82. UI libro y detalle: 2.207,6 kWh, 1.052,2 kWh, +109,8 %. Evidencia: TC-19/api.txt, ui-1-libro-m-109.png, ui-2-detalle-m-109.png.
- **Estado:** PASA
- **Evidencia:** [evidencias/TC-19/](evidencias/TC-19/)

### TC-20

**Verifica que las horas de planta se muestran tal como vienen, sin convertir a la zona del navegador**

- **Técnica:** Consistencia entre capas · **Riesgo:** R2 · **Capa:** API + UI
- **Oráculo:** Claims (frontend/README.md y PRODUCT.md: horas sin convertir); Product (texto de la IA vs. 'Detectada'); User desires (operador en Bogotá)
- **Precondición:** Sesión iniciada, navegador en America/Bogota
- **Pasos:** API: detected_at y last_reading_at de M-109. UI: 'Detectada' en Despacho, Anomalías e Investigación; 'Última lectura' en libro y detalle
- **Datos:** detected_at 2026-09-12T14:00:00Z; última lectura 2026-09-14T23:00:00Z
- **Resultado esperado:** La UI muestra 12/09 14:00 como detección y 14/09 23:00 como última lectura, igual que el texto de la IA
- **Resultado obtenido:** API: detected_at 2026-09-12T14:00:00Z y last_reading_at 2026-09-14T23:00:00Z. UI con navegador America/Bogota: 'Detectada 12/09 09:00' en Despacho, Anomalías e Investigación (M-112 12/09 19:00 frente a 13/09 00:00Z) y 'Última lectura 14/09 18:00' en libro y detalle. La UI resta 5 h (convierte a la zona del navegador) y contradice el texto de la IA, que dice 'desde 12/09 14:00'. Evidencia: TC-20/api.txt, ui-1..5.
- **Estado:** FALLA · **Defecto:** BUG-02
- **Evidencia:** [evidencias/TC-20/](evidencias/TC-20/)

### TC-21

**Verifica que los filtros del libro se conservan en la URL al recargar y al volver**

- **Técnica:** Funcional (estado) · **Riesgo:** R3 · **Capa:** UI
- **Oráculo:** Claims (frontend/README.md: los filtros viven en la URL)
- **Precondición:** Sesión iniciada
- **Pasos:** En /medidores elegir Críticas, ordenar por Consumo y buscar M-1; recargar; ir a un detalle y volver con Atrás
- **Datos:** Críticas, Consumo, M-1
- **Resultado esperado:** La URL contiene los tres filtros y la tabla los mantiene tras recargar y tras volver
- **Resultado obtenido:** Tras elegir Críticas, ordenar por Consumo y buscar M-1 la URL es /medidores?estado=CRITICAL&orden=consumption&medidor=M-1 y la tabla muestra M-112 y M-109 ('1–2 de 2'). Tras recargar y tras ir al detalle de M-109 y volver con Atrás, la URL, el radio Críticas, el selector Consumo, el campo M-1 y las dos filas se mantienen. Evidencia: TC-21/ui-1..3.
- **Estado:** PASA
- **Evidencia:** [evidencias/TC-21/](evidencias/TC-21/)

### TC-22

**Verifica que una ruta protegida sin sesión redirige a /login**

- **Técnica:** Funcional (estado) · **Riesgo:** R7 · **Capa:** UI
- **Oráculo:** Claims (frontend/README.md: ruta protegida); Standards (control de acceso)
- **Precondición:** Sin sesión
- **Pasos:** Abrir /medidores/M-109 sin sesión
- **Datos:** /medidores/M-109
- **Resultado esperado:** Redirige a /login sin mostrar datos del medidor
- **Resultado obtenido:** Sin sesión, /medidores/M-109 redirige a /login y se ve el formulario de acceso; el texto de la página no contiene datos del medidor. Evidencia: TC-22/ui-1-redireccion-login.png.
- **Estado:** PASA
- **Evidencia:** [evidencias/TC-22/](evidencias/TC-22/)

### TC-23

**Verifica que dos Run AI Analysis simultáneos no corren dos análisis a la vez**

- **Técnica:** Funcional (concurrencia) · **Riesgo:** R8 · **Capa:** API
- **Oráculo:** Claims (backend/README.md: nunca corren dos análisis a la vez)
- **Precondición:** Token válido
- **Pasos:** Enviar dos POST /api/v1/ai/analyze en paralelo y consultar ambos ids
- **Datos:** 2 peticiones simultáneas
- **Resultado esperado:** Las dos respuestas apuntan al mismo análisis, o la segunda es rechazada; nunca hay dos RUNNING a la vez
- **Resultado obtenido:** Dos POST /ai/analyze en paralelo devolvieron el mismo id AN-0007 (uno con 202 y otro con 200); ambos GET dan COMPLETED. Ronda extra con 5 peticiones simultáneas: 3 análisis distintos, con started_at y finished_at secuenciales sin solaparse; nunca dos RUNNING a la vez. Evidencia: TC-23/api.txt.
- **Estado:** PASA
- **Evidencia:** [evidencias/TC-23/](evidencias/TC-23/)

### TC-24

**Verifica que la hoja de Run AI Analysis muestra los 7 pasos completados y el resumen**

- **Técnica:** Funcional · **Riesgo:** R8 · **Capa:** UI
- **Oráculo:** Claims (frontend/README.md y backend/README.md: 7 pasos del motor)
- **Precondición:** Sesión iniciada
- **Pasos:** Pulsar Run AI Analysis en la barra
- **Datos:** —
- **Resultado esperado:** Hoja con Lecturas, Baseline, Detección, Correlación, Eventos, Explicación y Recomendación en Hecho, y '4 anomalías · 2 prioritarias'
- **Resultado obtenido:** La hoja 'Análisis de IA' (AN-0011) muestra los 7 pasos Lecturas, Baseline, Detección, Correlación, Eventos, Explicación y Recomendación, los 7 en 'Hecho', y la insignia '4 anomalías · 2 prioritarias' con '4 anomalías detectadas · 2 requieren atención prioritaria'. Evidencia: TC-24/ui-1-hoja-abierta.png, ui-2-hoja-completada.png.
- **Estado:** PASA
- **Evidencia:** [evidencias/TC-24/](evidencias/TC-24/)

### TC-25

**Verifica que la interfaz muestra los textos en español y las cifras con formato es-CO**

- **Técnica:** Funcional (presentación) · **Riesgo:** R9 · **Capa:** UI
- **Oráculo:** Claims (PRODUCT.md: interfaz en español con coma decimal); User desires
- **Precondición:** Sesión iniciada
- **Pasos:** Revisar detalle e investigación de M-109 y M-104
- **Datos:** M-109, M-104
- **Resultado esperado:** Todos los textos visibles en español; cifras con coma decimal y punto de miles
- **Resultado obtenido:** Cifras con formato es-CO correcto (4.032, 2.207,6, 1.052,2, 0,95; sin decimales con punto) y textos de interfaz en español. Pero se ven textos en inglés: 'No operational event reported' (M-109), 'New production line activated' y el token OPERATIONAL_CHANGE dentro del texto de la IA (M-104). Además el texto de la IA escribe '+110,5%' sin espacio y la UI '+109,8 %'. Evidencia: TC-25/ui-1..4.
- **Estado:** FALLA · **Defecto:** BUG-09
- **Evidencia:** [evidencias/TC-25/](evidencias/TC-25/)

## 6. Resumen de ejecución

Ejecución del 2026-10-22 sobre `026b991`: **25 casos, 13 PASA, 12 FALLA, 0 BLOQUEADO**. Pairwise: 19 de 30 combinaciones cumplen las 4 reglas ([`getall.results.csv`](evidencias/pairwise/getall.results.csv)).

| Riesgo | Casos | PASA | FALLA |
|---|---|---|---|
| R1 Estado de alerta | TC-09, TC-13, TC-17 | 0 | 3 |
| R2 Horas de planta | TC-20 | 0 | 1 |
| R3 Libro de medidores | TC-05, TC-06, TC-07, TC-10, TC-11, TC-12, TC-16, TC-21 | 3 | 5 |
| R4 Priorización y cifras | TC-14, TC-15, TC-19 | 3 | 0 |
| R5 Consistencia | TC-18 | 0 | 1 |
| R6 Validación de entradas | TC-02, TC-08 | 1 | 1 |
| R7 Autenticación | TC-01, TC-03, TC-04, TC-22 | 4 | 0 |
| R8 Run AI Analysis | TC-23, TC-24 | 2 | 0 |
| R9 Presentación | TC-25 | 0 | 1 |

Candidatos a defecto. La severidad y la prioridad aquí son preliminares; las finales y el reporte completo están en [`05-defectos.md`](05-defectos.md).

| Defecto | Resumen | Casos | Severidad preliminar |
|---|---|---|---|
| BUG-01 | M-106 (`FALSE_POSITIVE`) tiene estado `ALERT` en vez de `NORMAL`; el conteo queda 8/2/2 en lugar de 9/1/2 | TC-09, TC-13, TC-16, TC-17 | Alta |
| BUG-02 | Las horas de planta se convierten a la zona del navegador: con `America/Bogota` se ven 5 h antes (detección 09:00 en vez de 14:00) | TC-20 | Alta |
| BUG-03 | La paginación del libro deja Anterior y Siguiente deshabilitados: M-111 y M-112 no se alcanzan desde la UI | TC-12 | Alta |
| BUG-04 | La búsqueda por `meter_id` distingue mayúsculas (`m-109` → 0 resultados) | TC-06, TC-16 | Media |
| BUG-05 | `page: -1` responde 500 "Error interno del servidor" en vez de 400 | TC-11 | Media |
| BUG-06 | `size: 0` se acepta y se trata como 10 en vez de responder 400 | TC-10 | Baja |
| BUG-07 | `status` en minúsculas (`critical`) se acepta aunque el contrato lo define en mayúsculas | TC-08 | Retirado en caja blanca: es tolerancia intencional |
| BUG-08 | Despacho dice "3 órdenes abiertas" y numera "Orden 1 de 4" | TC-18 | Baja |
| BUG-09 | Textos en inglés y códigos crudos (`OPERATIONAL_CHANGE`) visibles en una interfaz en español | TC-25 | Baja |

Decisiones tomadas durante la ejecución:

- **TC-08:** aceptar `critical` en minúsculas puede ser tolerancia deliberada. Se reporta como defecto bajo porque el README y el Swagger definen el dominio en mayúsculas y el mensaje de error dice "debe ser NORMAL, ALERT o CRITICAL". La API no es coherente con su propio contrato.
- **TC-25:** los textos en inglés vienen de `events.csv`, que es dato y no interfaz. Aun así se reporta, porque `PRODUCT.md` promete una interfaz en español y el operador los lee igual.
- **Observaciones que no son defecto:**
  - Un segundo `POST /ai/analyze` mientras otro está en curso responde 200 con el análisis existente en lugar de 202. El README no dice qué responde en ese caso, y la regla "nunca dos a la vez" se cumple.
  - El texto de la IA dice "+110,5 %" y la tabla "+109,8 %". Son métricas distintas, documentadas como tales (la ventana del cambio frente a las últimas 24 h).
- **Entorno:** la ejecución lanzó varios Run AI Analysis, así que el "Último análisis" pasó de AN-0005 a AN-0019. No cambia ningún dato del motor.
