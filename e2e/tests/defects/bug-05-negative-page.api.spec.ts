import type { ApiError } from '../../src/api/energia.types';
import { expect, test } from '../../src/fixtures/test';

// BUG-05: pagination.page -1 answers 500 instead of a 400 validation error.
test.describe('Defecto BUG-05 en la API', {
  tag: '@defect',
  annotation: { type: 'issue', description: 'https://github.com/rprecigapuentes/bia-prueba-qa/issues/17' },
}, () => {
  test('BUG-05 Verifica que page -1 responde 400 con el formato de error', async ({ api }) => {
    test.fail();

    const response = await api.meters({ pagination: { page: -1, size: 10 } });
    expect(response.status()).toBe(400);

    const body = (await response.json()) as ApiError;
    expect(body).toMatchObject({ status_code: 400, path: '/api/v1/meter/getAll' });
    expect(body.message).toBeTruthy();
    expect(body.timestamp).toBeTruthy();
  });
});
