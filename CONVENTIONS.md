# Convenciones

Reglas de cómo se escribe, se revisa y se integra este repositorio. Adaptadas de las convenciones de los proyectos de automatización del bootcamp de Jalasoft (`gitea-ui-automation`, `trello-api-bdd`) a una entrega de una persona con revisión propia.

## Idioma

| Qué | Idioma |
|---|---|
| Entregables de QA (`qa/`), READMEs, artefactos de OpenSpec, PRs | Español |
| Identificadores, comentarios de código, mensajes de commit | Inglés |
| Títulos de tests | Español, con el formato de *Nombres de casos y tests* |

## Flujo de trabajo

Cada entregable es un *change* de OpenSpec y pasa por dos pull requests:

1. **Propuesta**: rama `openspec/<change>`, con `proposal.md`, specs, `tasks.md` y `design.md` si aplica. Se revisa y se integra antes de implementar.
2. **Implementación**: rama `apply/<change>`, con el trabajo, las tareas marcadas y el change archivado (`openspec archive`). Se revisa y se integra.

Cambios que no son un change de OpenSpec (documentación del repo, ajustes menores) usan `docs/<tema>`, `fix/<tema>` o `chore/<tema>`.

- Las ramas salen de `main` y nunca se hace commit directo en `main`.
- Quien revisa e integra es Rosemberth. El agente abre el PR y no lo integra.
- Una responsabilidad por PR. Un prerrequisito grande va en su propio PR.

## Commits

Conventional Commits: `type(scope): subject`, en imperativo, en inglés y con menos de 72 caracteres. Sin trailer `Co-Authored-By` ni atribución a agentes: los commits son del autor.

| Tipo | Uso | Ejemplo |
|---|---|---|
| `feat` | Capacidad nueva del framework | `feat(e2e): add meter ledger page object` |
| `test` | Tests nuevos o ajustados | `test(e2e): cover pagination boundaries` |
| `docs` | Documentos, entregables de QA, OpenSpec | `docs(qa): black-box cases with evidence` |
| `fix` | Corrección en tests o documentos | `fix(e2e): wait for ledger response before asserting` |
| `refactor` | Reestructura sin cambio de comportamiento | `refactor(e2e): extract pagination component` |
| `chore` | Dependencias, herramientas | `chore(e2e): add eslint-plugin-playwright` |
| `ci` | Pipeline | `ci(actions): run e2e suite on push` |

Scopes: `qa`, `e2e`, `openspec`, `ci`, `repo`.

## Pull requests

- **Título:** `<change>: <descripción corta>`, por ejemplo `e2e-framework: base de la automatización con Playwright`.
- **Descripción:**

```markdown
## Summary
Qué resuelve, en dos o tres líneas.

## Changes
- Added: ...
- Changed: ...
- Removed: ...

## Decisiones para revisar
Lo que el revisor debe validar o puede querer cambiar.

## Evidence
Salida de los tests, capturas o `openspec validate --strict`.
```

## Identificadores

| Prefijo | Qué es | Dónde |
|---|---|---|
| `R1`…`R9` | Riesgo del plan | `qa/01-plan-de-pruebas.md` |
| `SM-xx` | Caso de humo | `qa/02-smoke.md` |
| `TC-xx` | Caso de caja negra | `qa/03-casos-caja-negra.md` |
| `BUG-xx` | Defecto | `qa/05-defectos.md` y su issue |

Las evidencias van en `qa/evidencias/<ID>/`. Un archivo de evidencia de API es la salida de `curl -i` con el comando arriba. Un archivo de evidencia de UI es una captura PNG con el ID en el nombre.

## Nombres de casos y tests

```text
<ID> Verifica que <acción> <condición> <resultado esperado>
```

- Mal: `TC-07 Verifica que la búsqueda funciona`.
- Bien: `TC-07 Verifica que buscar "m-109" en minúsculas devuelve el medidor M-109`.

El resultado esperado es lo que convierte el título en una prueba. Nunca termina en "funciona" ni en "devuelve lo esperado". Un test que evidencia un defecto abierto lleva el `BUG-xx` en el título y `test.fail()` con una línea de razón.

## Código de `e2e/`

- **Archivos:** kebab-case con sufijo de rol: `meter-ledger.page.ts`, `pagination.component.ts`, `energia.api.ts`, `oracle.data.ts`, `smoke.ui.spec.ts`, `smoke.api.spec.ts`.
- **Nombres:** `camelCase` para variables y funciones, `PascalCase` para clases y tipos, `UPPER_CASE` para constantes.
- **Capas:** `tests → fixtures → pages/components/api → config/data`. Un test no importa `@playwright/test` directo; importa `test` y `expect` desde las fixtures.
- **Page Objects:** exponen acciones y consultas, nunca aserciones. Los locators son campos privados de solo lectura del Page Object que los posee.
- **Locators:** `getByRole` con nombre accesible, luego `getByLabel`, luego `getByText`. CSS o XPath solo con un comentario que explique por qué.
- **Esperas:** sin `waitForTimeout` ni esperas fijas. Se usan aserciones web-first o `waitForResponse`. El lint lo hace cumplir.
- **Datos esperados:** salen de `oracle.data.ts`, que cita la documentación. Nunca se compara contra lo que devuelve la propia app.
- **Configuración:** URLs y credenciales por variables de entorno con valores por defecto para local (`e2e/.env.example`). `.env` y `.auth/` no se suben.

## Código de la aplicación

`backend/` y `frontend/` no se modifican para corregir defectos: se reportan. Solo se agregan archivos de test (`*_test.go`, `*.test.ts(x)`).
