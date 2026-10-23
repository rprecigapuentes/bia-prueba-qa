import { expect, test } from '../../src/fixtures/test';

// BUG-03: both pagination buttons are disabled on page 1, so page 2 is reachable only through the URL.
test.describe('Defecto BUG-03 en la UI', {
  tag: '@defect',
  annotation: { type: 'issue', description: 'https://github.com/rprecigapuentes/bia-prueba-qa/issues/15' },
}, () => {
  test('BUG-03 Verifica que Siguiente avanza a la página 2 del libro con M-111 y M-112', async ({ ledgerPage }) => {
    test.fail();

    await ledgerPage.open();
    await expect(ledgerPage.pagination.summary()).toHaveText('1–10 de 12 medidores');
    await expect(ledgerPage.pagination.nextButton()).toBeEnabled();

    await ledgerPage.pagination.next();
    await expect(ledgerPage.pagination.summary()).toHaveText('11–12 de 12 medidores');
    await expect(ledgerPage.meterIds()).toHaveText(['M-111', 'M-112']);
  });
});
