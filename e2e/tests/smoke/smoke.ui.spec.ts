import { env } from '../../src/config/env';
import { expect, NO_SESSION, test } from '../../src/fixtures/test';

// qa/02-smoke.md, cases SM-09 and SM-10.
test.describe('Humo de la UI', { tag: '@smoke' }, () => {
  test.describe('sin sesión', () => {
    test.use({ storageState: NO_SESSION });

    test('SM-09 Verifica que el login por formulario lleva a Despacho con el estado de la planta', async ({
      loginPage,
      dispatchPage,
    }) => {
      await loginPage.open();
      await loginPage.login(env.operatorEmail, env.operatorPassword);

      await expect(dispatchPage.heading()).toHaveText('Despacho');
      await expect(dispatchPage.plantStatus()).toBeVisible();
      await expect(dispatchPage.orders().first()).toBeVisible();
    });
  });

  test('SM-10 Verifica que desde Medidores se abre el detalle de M-109', async ({
    dispatchPage,
    ledgerPage,
    meterDetailPage,
  }) => {
    await dispatchPage.open();
    await dispatchPage.header.goTo('Medidores');

    await expect(ledgerPage.heading()).toHaveText('Libro de medidores');
    await expect(ledgerPage.rows().first()).toBeVisible();

    await ledgerPage.openMeter('M-109');
    const detail = meterDetailPage('M-109');
    await expect(detail.heading()).toHaveText('M-109');
    await expect(detail.summaryRegion()).toBeVisible();
    await expect(detail.hourlyHistory()).toBeVisible();
  });
});
