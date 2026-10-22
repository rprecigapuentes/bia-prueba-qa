import { expect, test } from '../src/fixtures/test';

// Starting point for the Playwright agents (planner, generator, healer): an authenticated
// operator on Despacho, built on the same fixtures as the rest of the suite.
test('seed: el operador autenticado aterriza en Despacho', async ({ dispatchPage }) => {
  await dispatchPage.open();
  await expect(dispatchPage.heading()).toHaveText('Despacho');
});
