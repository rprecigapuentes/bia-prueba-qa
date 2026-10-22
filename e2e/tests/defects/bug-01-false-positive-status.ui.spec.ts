import { EXPECTED_STATUS, STATUS_LABEL } from '../../src/data/oracle.data';
import { expect, test } from '../../src/fixtures/test';

// BUG-01: the ledger stamps M-106 (FALSE_POSITIVE) as Alerta instead of Normal.
test.describe('Defecto BUG-01 en la UI', {
  tag: '@defect',
  annotation: { type: 'issue', description: 'qa/05-defectos.md#bug-01' },
}, () => {
  test('BUG-01 Verifica que el libro muestra a M-106 (falso positivo) con el estado Normal', async ({ ledgerPage }) => {
    test.fail();

    await ledgerPage.open();
    await expect(ledgerPage.cell('M-106', 'Estado')).toHaveText(STATUS_LABEL[EXPECTED_STATUS['M-106']]);
  });
});
