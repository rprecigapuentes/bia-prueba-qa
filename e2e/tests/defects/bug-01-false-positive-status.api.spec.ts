import type { DashboardSummary, MeterSummary } from '../../src/api/energia.types';
import { EXPECTED_STATUS, EXPECTED_STATUS_COUNTS } from '../../src/data/oracle.data';
import { expect, test } from '../../src/fixtures/test';

// BUG-01: M-106 (FALSE_POSITIVE) reports ALERT, so the dashboard counts 8 / 2 / 2 instead of 9 / 1 / 2.
test.describe('Defecto BUG-01 en la API', {
  tag: '@defect',
  annotation: { type: 'issue', description: 'qa/05-defectos.md#bug-01' },
}, () => {
  test('BUG-01 Verifica que el detalle de M-106 (falso positivo) tiene estado NORMAL', async ({ api }) => {
    test.fail();

    const response = await api.meter('M-106');
    expect(response.status()).toBe(200);
    expect(((await response.json()) as MeterSummary).status).toBe(EXPECTED_STATUS['M-106']);
  });

  test('BUG-01 Verifica que el resumen del despacho cuenta 9 normales, 1 alerta y 2 críticas', async ({ api }) => {
    test.fail();

    const response = await api.dashboardSummary();
    expect(response.status()).toBe(200);
    expect(((await response.json()) as DashboardSummary).status_counts).toEqual(EXPECTED_STATUS_COUNTS);
  });
});
