import { env, STORAGE_STATE } from '../../src/config/env';
import { expect, test as setup } from '../../src/fixtures/test';

setup('Inicia sesión como operador y guarda la sesión', async ({ page, loginPage, dispatchPage }) => {
  await loginPage.open();
  await loginPage.login(env.operatorEmail, env.operatorPassword);
  await expect(dispatchPage.heading()).toHaveText('Despacho');
  await page.context().storageState({ path: STORAGE_STATE });
});
