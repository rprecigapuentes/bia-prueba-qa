# Sesiones exploratorias

Exploración por sesiones (*session-based testing*): cada sesión tiene un charter (misión), dura 10 minutos y deja notas de qué se probó, qué se vio y qué se sospecha. App en http://localhost:3000, usuario `admin@energia.local` / `admin123`, navegador con la zona horaria del equipo (Bogotá).

Registro del 2026-10-22. Cada hallazgo sigue el formato `[pantalla] qué se hizo → qué se vio → qué se esperaba`. **Ejecutor:** las sesiones 1 y 4 las ejecutó Rosemberth a mano en su navegador; las sesiones 2 y 3 las ejecutó el agente (Claude Code) con Playwright en Chromium (`America/Bogota`, `es-CO`), con las capturas enlazadas. Cada hallazgo indica el caso de caja negra o el defecto que originó.

## Sesión 1 · Libro de medidores

- **Charter:** explorar filtros, búsqueda, orden y paginación de `/medidores` para descubrir medidores inalcanzables o resultados que no coinciden con lo pedido.
- **Duración:** 10 min.
- **Ideas a probar:**
  1. Contar cuántos medidores puedes ver en total. La documentación dice 12 (M-101 a M-112). ¿Llegas a M-111 y M-112 con los botones de paginación?
  2. Buscar `109`, `M-109`, `m-109`, ` 109 ` (con espacios) y `M-999`.
  3. Filtrar por Normales, Alertas y Críticas. Contar cuántos salen en cada uno y anotar cuáles.
  4. Ordenar por Consumo, Variación y Severidad en las dos direcciones. ¿El orden es correcto?
  5. Con un filtro puesto, recargar la página (F5) y usar el botón Atrás del navegador. ¿Se conserva?
- **Hallazgos:**
  - [Libro] Paginación sin filtros → se ven M-101 a M-110; "Anterior" y "Siguiente" no responden y el cursor muestra el ícono de "no permitido" → se esperaba poder pasar a la página 2 (12 medidores). Origen de TC-12 y BUG-03.
  - [Libro] Buscar `111` → aparece M-111. Es la única forma de llegar a M-111 desde el libro sin filtros.
  - [Libro] Buscar `M 111` (espacio en vez de guion) → "Ningún medidor coincide" → no es un defecto según la documentación (búsqueda por subcadena), pero un operador puede escribirlo así. Observación de usabilidad (User desires).
  - [Libro] Filtros → Normales 8, Alertas 2, Críticas 2 (total 12) → la documentación pide 9 / 1 / 2, porque M-106 es falso positivo y cuenta como Normal. En la sesión el total cuadró y el conteo pareció correcto; contra el oráculo es BUG-01 (TC-09, TC-17).
  - [Libro] Ordenar por consumo, variación y severidad, de mayor a menor y de menor a mayor → orden correcto.
  - [Libro] F5 con un filtro puesto → el filtro se conserva en la URL y en la tabla (TC-21).

## Sesión 2 · Despacho y KPIs

- **Charter:** comparar lo que muestra Despacho con lo que promete la documentación, para descubrir conteos o prioridades incoherentes.
- **Duración:** 10 min.
- **Ideas a probar:**
  1. Leer los KPIs de "Estado de la planta" (normales, alerta, críticas). Según la doc: M-106 es falso positivo y debe contar como normal.
  2. Leer el subtítulo ("N órdenes abiertas") y el encabezado de la primera orden ("Orden 1 de N"). ¿Cuadran?
  3. Ver la tarjeta de M-106: ¿qué estado y qué acción muestra? Comparar con la fila de M-106 en el libro de abajo.
  4. Click en "Filtrar y ordenar", "Ver medidor" y "Abrir investigación". ¿Llevan a donde dicen?
- **Hallazgos:**
  - [Despacho] KPI "Medidores" → "8 normales · 2 alerta · 2 críticas" → se esperaba 9 / 1 / 2 (BUG-01). Evidencia: [`../TC-17/`](../TC-17/).
  - [Despacho] Subtítulo "3 órdenes abiertas" y primera tarjeta "Orden 1 de 4", con 4 tarjetas → se esperaba el mismo total (BUG-08). Evidencia: [`../TC-18/ui-1-despacho-ordenes.png`](../TC-18/ui-1-despacho-ordenes.png).
  - [Despacho] Tarjeta de M-106 con "No escalar"; en el libro de abajo, la fila de M-106 tiene el sello "Alerta" → la misma pantalla se contradice (BUG-01, oráculo Product). Evidencia: [`../smoke/SM-09-despacho.png`](../smoke/SM-09-despacho.png).
  - [Despacho] "Filtrar y ordenar", "Ver medidor" y "Abrir investigación" → llevan a `/medidores`, `/medidores/M-109` y `/anomalias/M-109`. Correcto.

## Sesión 3 · Detalle e investigación de M-109 y M-106

- **Charter:** verificar cifras y horas del detalle y de la investigación contra el README, para descubrir datos mal calculados o mal presentados.
- **Duración:** 10 min.
- **Ideas a probar:**
  1. En `/medidores/M-109`: consumo 24 h 2.207,6 kWh, baseline 1.052,15 kWh y variación +109,8 % (README del backend).
  2. Comparar las horas: la doc dice que el cambio empezó el **12/09 a las 14:00** y que las horas se muestran tal cual, sin convertir. ¿Qué hora muestra cada parte de la pantalla (texto de la IA, "Detectada", "Desde", eventos, última lectura)?
  3. En `/anomalias/M-109`: confianza 0,95, prioridad 1 de 4, 58 h. ¿Coincide?
  4. Repetir con M-106: ¿qué estado muestra el detalle?
  5. ¿Algún texto aparece en inglés?
- **Hallazgos:**
  - [Detalle M-109] Consumo 2.207,6 kWh, baseline 1.052,2 kWh, variación +109,8 % → coinciden con el README (TC-19). Evidencia: [`../TC-19/`](../TC-19/).
  - [Detalle e investigación M-109] El texto de la IA dice "desde 12/09 14:00"; "Detectada" y "Desde" dicen 12/09 09:00; "Última lectura" dice 14/09 18:00 → se esperaba la hora de planta tal cual, 14:00 y 23:00 (BUG-02, TC-20). Evidencia: [`../TC-20/`](../TC-20/).
  - [Investigación M-109] Confianza 0,95, "Prioridad 1 de 4", 58 h → coinciden con el README (TC-14, TC-15).
  - [Detalle M-106] Sello "Alerta" en un falso positivo → se esperaba "Normal" (BUG-01, TC-13). Evidencia: [`../TC-13/`](../TC-13/).
  - [Detalle M-104 y M-109] Textos en inglés ("No operational event reported", "New production line activated") y códigos `OPERATIONAL_CHANGE` / `SCHEDULED_OUTAGE` → se esperaba interfaz en español (BUG-09, TC-25). Evidencia: [`../TC-25/`](../TC-25/).

## Sesión 4 · Run AI Analysis y sesión

- **Charter:** estresar Run AI Analysis y la sesión, para descubrir estados inconsistentes o rutas mal protegidas.
- **Duración:** 10 min.
- **Ideas a probar:**
  1. Pulsar Run AI Analysis dos veces seguidas, rápido. ¿Qué pasa? ¿Se crean dos análisis?
  2. Abrir la hoja, cerrarla y volver a abrirla. ¿El "Último análisis" de la barra se actualiza?
  3. Cerrar sesión y pegar `http://localhost:3000/medidores/M-109` en la barra. ¿Te pide login? Después del login, ¿vuelves a M-109?
  4. Ir a `http://localhost:3000/medidores/M-999` y a `http://localhost:3000/no-existe`.
  5. Login con contraseña mala, con el email en mayúsculas (`ADMIN@energia.local`) y con los campos vacíos.
- **Hallazgos:**
  - [Barra] Run AI Analysis varias veces seguidas → se crean análisis nuevos y la barra muestra solo el último → coherente con "nunca corren dos a la vez": cada uno termina en milisegundos antes del siguiente (TC-23).
  - [Sesión] Cerrar sesión y abrir `/medidores/M-109` → pide login y no muestra datos ni un 404 (TC-22). Correcto.
  - [Rutas] Con sesión, `/medidores/M-999` → "No existe el medidor M-999"; `/no-existe` → página de "no existe". Correcto (TC-07).
  - [Login] Email en mayúsculas (`ADMIN@energia.local`) → entra. Correcto: los emails no distinguen mayúsculas (Standards) (TC-01).
  - [Cuenta] No hay forma de crear usuarios, cambiar de usuario ni editar los datos del perfil, como sí tienen productos comparables. No es defecto: `PRODUCT.md` declara "A single user (demo login). No roles." (Claims prevalece sobre Comparable products).
