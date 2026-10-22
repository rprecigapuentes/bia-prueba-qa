# Spec Delta

## Purpose

Define la suite de humo de la entrega: el conjunto mínimo de verificaciones que decide si el build se puede probar, con la razón de cada caso, su resultado y su evidencia.

## ADDED Requirements

### Requirement: Suite mínima y justificada
La suite SHALL estar en `qa/02-smoke.md`, MUST tener como máximo 10 casos y cada caso MUST explicar qué bloquearía si fallara.

#### Scenario: Revisor cuestiona un caso
- **WHEN** un revisor pregunta por qué un caso está en el humo
- **THEN** el documento dice qué parte de la prueba quedaría bloqueada si ese caso fallara

### Requirement: Cobertura de las capas críticas
La suite SHALL cubrir la salud del servicio, la autenticación (API y UI), la protección de rutas, el libro de medidores, el detalle de un medidor, la lista de anomalías, el resumen del despacho y Run AI Analysis.

#### Scenario: Área sin humo
- **WHEN** una de esas áreas no responde o no muestra datos
- **THEN** algún caso de humo falla y lo señala

### Requirement: Ejecución registrada
Cada caso SHALL registrar resultado (`PASA` o `FALLA`), fecha, commit bajo prueba, zona horaria y navegador cuando aplica, y MUST enlazar su evidencia en `qa/evidencias/smoke/`.

#### Scenario: Reejecución
- **WHEN** otra persona ejecuta el humo sobre el mismo commit
- **THEN** puede repetir cada paso con los datos y comandos del documento y comparar contra el resultado registrado

### Requirement: Veredicto de entrada
El documento SHALL cerrar con un veredicto ("se puede probar" o "no se puede probar") y, si un caso falla, MUST indicar si el fallo bloquea la ejecución funcional o solo se registra como defecto.

#### Scenario: Humo con un fallo no bloqueante
- **WHEN** un caso de humo falla pero el resto del producto es utilizable
- **THEN** el veredicto es "se puede probar" y el fallo se lleva al reporte de defectos

### Requirement: Humo sin reglas de negocio detalladas
Los casos de humo SHALL comprobar disponibilidad y datos plausibles, y MUST NOT validar reglas de negocio en detalle (cifras exactas, orden de prioridad, combinaciones de filtros), que pertenecen a la caja negra.

#### Scenario: Cifra incorrecta en el detalle
- **WHEN** el detalle de un medidor carga pero una cifra difiere de la documentación
- **THEN** el caso de humo pasa y la diferencia se investiga en la caja negra
