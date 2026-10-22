import type { ApiError, MetersPage } from '../../src/api/energia.types';
import {
  ACCEPTED_PAGE_BOUNDARIES,
  ACCEPTED_SIZE_BOUNDARIES,
  REJECTED_SIZE_BOUNDARIES,
} from '../../src/data/boundaries.data';
import { TOTAL_METERS } from '../../src/data/oracle.data';
import { expect, test } from '../../src/fixtures/test';

// qa/03-casos-caja-negra.md, section 3.2: boundary values of pagination.size and pagination.page.
test.describe('Valores límite de la paginación de la API', { tag: '@regression' }, () => {
  for (const row of [...ACCEPTED_SIZE_BOUNDARIES, ...ACCEPTED_PAGE_BOUNDARIES]) {
    test(`${row.id} Verifica que ${row.description}`, async ({ api }) => {
      const response = await api.meters({ pagination: row.pagination });
      expect(response.status()).toBe(200);

      const body = (await response.json()) as MetersPage;
      expect(body.count).toBe(TOTAL_METERS);
      expect(body.rows.map((meter) => meter.meter_id)).toEqual(row.expectedIds);
    });
  }

  for (const row of REJECTED_SIZE_BOUNDARIES) {
    test(`${row.id} Verifica que ${row.description}`, async ({ api }) => {
      const response = await api.meters({ pagination: row.pagination });
      expect(response.status()).toBe(400);

      const body = (await response.json()) as ApiError;
      expect(body).toMatchObject({ status_code: 400, path: '/api/v1/meter/getAll' });
      expect(body.errors?.join(' ')).toContain(row.errorField);
    });
  }
});
