# e2e-framework Specification

## Purpose
Define cómo está construida la automatización de `e2e/`: configuración, autenticación reutilizable, capas entre tests, fixtures, Page Objects y cliente de API, y las reglas de calidad que la mantienen robusta.

## Requirements

### Requirement: Ejecución con un solo comando
La suite SHALL poder instalarse y ejecutarse siguiendo `e2e/README.md`, y la ejecución completa MUST lanzarse con un solo comando contra la app levantada con Docker.

#### Scenario: Persona nueva corre la suite
- **WHEN** alguien con Node y la app corriendo sigue `e2e/README.md`
- **THEN** ejecuta toda la suite con un único comando y obtiene un reporte HTML

### Requirement: Login reutilizable
La autenticación de UI SHALL hacerse una sola vez por ejecución y reutilizarse mediante `storageState`, y solo los tests que prueban el login MUST pasar por el formulario.

#### Scenario: Test de UI autenticado
- **WHEN** corre un test de UI que no prueba el login
- **THEN** arranca ya autenticado, sin interactuar con el formulario de acceso

### Requirement: Tests sin acceso directo al navegador
Los tests SHALL interactuar con la UI solo a través de Page Objects o componentes y con la API solo a través del cliente de API, entregados por fixtures, y MUST NOT contener locators, URLs ni llamadas HTTP directas.

#### Scenario: Cambio de un locator
- **WHEN** cambia el nombre visible de un control de la UI
- **THEN** la corrección toca un solo Page Object o componente y ningún archivo de test

### Requirement: Locators robustos y esperas web-first
Los Page Objects SHALL preferir locators por rol, label o texto, y la suite MUST NOT usar esperas fijas; el lint MUST fallar ante `waitForTimeout`.

#### Scenario: Espera fija introducida
- **WHEN** alguien agrega un `waitForTimeout` en `e2e/`
- **THEN** `npm run lint` falla

### Requirement: Zona horaria y locale del operador
Todos los proyectos de UI SHALL ejecutarse con `timezoneId` `America/Bogota` y `locale` `es-CO`, y la suite MUST correr la UI en al menos Chromium y Firefox.

#### Scenario: Ejecución multi-navegador
- **WHEN** se ejecuta la suite completa
- **THEN** cada test de UI corre en Chromium y en Firefox con la zona horaria de Bogotá

### Requirement: Datos y configuración separados del test
URLs y credenciales SHALL venir de variables de entorno con valores por defecto para local, y los valores esperados MUST venir de un módulo de oráculo que cita la documentación de origen.

#### Scenario: Otro entorno
- **WHEN** la app corre en otra URL
- **THEN** basta con definir `BASE_URL` y `API_URL`, sin editar tests

### Requirement: Evidencia en fallo
La ejecución SHALL producir un reporte HTML y MUST conservar traza, captura y video de cada test fallido.

#### Scenario: Test falla
- **WHEN** un test falla
- **THEN** el reporte HTML enlaza su traza, su captura y su video

### Requirement: Suite de humo automatizada
Los casos de `qa/02-smoke.md` SHALL estar automatizados con la etiqueta `@smoke` y MUST poder ejecutarse solos.

#### Scenario: Solo humo
- **WHEN** se ejecuta `npm run test:smoke`
- **THEN** corren únicamente los tests `@smoke` y su resultado coincide con el de `qa/02-smoke.md`
