import { LAST_READING_PLANT_TIME, M109 } from '../../src/data/oracle.data';
import { expect, test } from '../../src/fixtures/test';

// BUG-02: the UI converts plant times to the browser timezone (09:00 instead of 14:00, 18:00 instead of 23:00).
test.describe('Defecto BUG-02 en la UI', {
  tag: '@defect',
  annotation: { type: 'issue', description: 'https://github.com/rprecigapuentes/bia-prueba-qa/issues/14' },
}, () => {
  test('BUG-02 Verifica que la investigación de M-109 muestra la detección a la hora de planta 12/09 14:00', async ({
    investigationPage,
  }) => {
    test.fail();

    const investigation = investigationPage(M109.meterId);
    await investigation.open();
    await expect(investigation.detectedAt()).toContainText(`Detectada ${M109.detectedAtPlantTime}`);
  });

  test('BUG-02 Verifica que el libro muestra la última lectura de M-101 a la hora de planta 14/09 23:00', async ({
    ledgerPage,
  }) => {
    test.fail();

    await ledgerPage.open();
    await expect(ledgerPage.cell('M-101', 'Última lectura')).toHaveText(LAST_READING_PLANT_TIME);
  });
});
