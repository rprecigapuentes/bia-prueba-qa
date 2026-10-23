import type { ApiError } from '../../src/api/energia.types';
import { TOKEN_PARTITIONS } from '../../src/data/partitions.data';
import { expect, test } from '../../src/fixtures/test';

// qa/03-casos-caja-negra.md, TC-04: a protected route rejects a missing, tampered or prefix-less token.
test.describe('Negativas de autenticación de la API', { tag: '@regression' }, () => {
  for (const row of TOKEN_PARTITIONS) {
    test(`${row.id} Verifica que ${row.description} con el formato de error`, async ({ api, operatorToken }) => {
      const response = await api.meWithAuthorization(row.authorization(operatorToken));
      expect(response.status()).toBe(401);

      const body = (await response.json()) as ApiError;
      expect(body).toMatchObject({ status_code: 401, path: '/api/v1/auth/me' });
      expect(body.message).toBeTruthy();
      expect(body.timestamp).toBeTruthy();
    });
  }

  test('TC-04 Verifica que el mismo endpoint con el token válido responde 200', async ({ api }) => {
    const response = await api.me();
    expect(response.status()).toBe(200);
  });
});
