import type { ApiError, MetersPage, TokenResponse } from '../../src/api/energia.types';
import { env } from '../../src/config/env';
import {
  ACCEPTED_LOGIN_PARTITIONS,
  INVALID_FILTER_PARTITIONS,
  REJECTED_LOGIN_PARTITIONS,
  SEARCH_PARTITIONS,
  UNKNOWN_METER_PARTITIONS,
  VALID_STATUS_PARTITIONS,
} from '../../src/data/partitions.data';
import { expect, test } from '../../src/fixtures/test';

// qa/03-casos-caja-negra.md, section 3.1: one test per equivalence class representative.
test.describe('Particiones de equivalencia de la API', { tag: '@regression' }, () => {
  for (const row of ACCEPTED_LOGIN_PARTITIONS) {
    test(`${row.id} Verifica que ${row.description}`, async ({ api }) => {
      const response = await api.login(row.email, row.password);

      expect(response.status()).toBe(200);
      expect(((await response.json()) as TokenResponse).access_token).toBeTruthy();
    });
  }

  for (const row of REJECTED_LOGIN_PARTITIONS) {
    test(`${row.id} Verifica que ${row.description}`, async ({ api }) => {
      const response = await api.login(row.email, row.password);
      expect(response.status()).toBe(row.expectedStatus);

      const body = (await response.json()) as ApiError;
      expect(body).toMatchObject({ status_code: row.expectedStatus, path: '/api/v1/auth/login' });
      expect(body.message).toBeTruthy();
      expect(body.timestamp).toBeTruthy();
      for (const field of row.errorsMention ?? []) {
        expect(body.errors?.join(' ')).toContain(field);
      }
    });
  }

  test('TC-01 Verifica que la contraseña incorrecta y el email inexistente responden 401 con el mismo message', async ({
    api,
  }) => {
    const wrongPassword = await api.login(env.operatorEmail, 'mala');
    const unknownEmail = await api.login('otro@energia.local', env.operatorPassword);

    expect(wrongPassword.status()).toBe(401);
    expect(unknownEmail.status()).toBe(401);
    expect(((await unknownEmail.json()) as ApiError).message).toBe(((await wrongPassword.json()) as ApiError).message);
  });

  test('TC-02 Verifica que el login sin body responde 400 y nombra los campos en errors', async ({ api }) => {
    const response = await api.loginWithoutBody();

    expect(response.status()).toBe(400);
    const body = (await response.json()) as ApiError;
    expect(body.errors?.join(' ')).toContain('email');
    expect(body.errors?.join(' ')).toContain('password');
  });

  for (const row of SEARCH_PARTITIONS) {
    test(`${row.id} Verifica que ${row.description}`, async ({ api }) => {
      const response = await api.meters({ filter: { meter_id: row.term }, pagination: { size: 100 } });
      expect(response.status()).toBe(200);

      const body = (await response.json()) as MetersPage;
      expect(body.count).toBe(row.expectedIds.length);
      expect(body.rows.map((meter) => meter.meter_id)).toEqual(row.expectedIds);
    });
  }

  for (const row of VALID_STATUS_PARTITIONS) {
    test(`${row.id} Verifica que ${row.description}`, async ({ api }) => {
      const response = await api.meters({ filter: { status: row.status }, pagination: { size: 100 } });
      expect(response.status()).toBe(200);

      const body = (await response.json()) as MetersPage;
      expect(body.count).toBe(row.expectedIds.length);
      expect(body.rows.map((meter) => meter.meter_id)).toEqual(row.expectedIds);
    });
  }

  for (const row of INVALID_FILTER_PARTITIONS) {
    test(`${row.id} Verifica que ${row.description}`, async ({ api }) => {
      const response = await api.meters({ filter: row.filter });
      expect(response.status()).toBe(400);

      const body = (await response.json()) as ApiError;
      expect(body).toMatchObject({ status_code: 400, message: 'Filtros inválidos', path: '/api/v1/meter/getAll' });
      expect(body.errors).toContain(row.expectedError);
    });
  }

  for (const row of UNKNOWN_METER_PARTITIONS) {
    test(`${row.id} Verifica que ${row.description}`, async ({ api }) => {
      const response = await api.meter(row.meterId);
      expect(response.status()).toBe(404);

      const body = (await response.json()) as ApiError;
      expect(body).toMatchObject({ status_code: 404, path: `/api/v1/meter/getById/${row.meterId}` });
      expect(body.message).toBeTruthy();
    });
  }
});
