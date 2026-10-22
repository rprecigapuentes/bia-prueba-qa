import type { MetersPage } from '../../src/api/energia.types';
import { expect, test } from '../../src/fixtures/test';

// BUG-04: the meter_id search is case-sensitive, so "m-109" finds nothing.
test.describe('Defecto BUG-04 en la API', {
  tag: '@defect',
  annotation: { type: 'issue', description: 'https://github.com/rprecigapuentes/bia-prueba-qa/issues/16' },
}, () => {
  test('BUG-04 Verifica que buscar "m-109" en minúsculas devuelve el medidor M-109', async ({ api }) => {
    test.fail();

    const response = await api.meters({ filter: { meter_id: 'm-109' } });
    expect(response.status()).toBe(200);

    const body = (await response.json()) as MetersPage;
    expect(body.count).toBe(1);
    expect(body.rows.map((meter) => meter.meter_id)).toEqual(['M-109']);
  });
});
