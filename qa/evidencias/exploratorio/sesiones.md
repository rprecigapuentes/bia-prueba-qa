# Sesiones exploratorias

Exploración por sesiones (*session-based testing*): cada sesión tiene un charter (misión), dura 10 minutos y deja notas de qué se probó, qué se vio y qué se sospecha. App en http://localhost:3000, usuario `admin@energia.local` / `admin123`, navegador con la zona horaria del equipo (Bogotá).

Cómo llenar cada sesión: anota en **Hallazgos** una línea por cosa rara, con formato `[pantalla] qué hiciste → qué viste → qué esperabas`. Si algo te parece un bug, toma captura (Win+Shift+S) y guárdala aquí como `EX-<sesión>-<n>.png` (por ejemplo `EX-1-2.png`).

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
  -

## Sesión 2 · Despacho y KPIs

- **Charter:** comparar lo que muestra Despacho con lo que promete la documentación, para descubrir conteos o prioridades incoherentes.
- **Duración:** 10 min.
- **Ideas a probar:**
  1. Leer los KPIs de "Estado de la planta" (normales, alerta, críticas). Según la doc: M-106 es falso positivo y debe contar como normal.
  2. Leer el subtítulo ("N órdenes abiertas") y el encabezado de la primera orden ("Orden 1 de N"). ¿Cuadran?
  3. Ver la tarjeta de M-106: ¿qué estado y qué acción muestra? Comparar con la fila de M-106 en el libro de abajo.
  4. Click en "Filtrar y ordenar", "Ver medidor" y "Abrir investigación". ¿Llevan a donde dicen?
- **Hallazgos:**
  -

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
  -

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
  -
