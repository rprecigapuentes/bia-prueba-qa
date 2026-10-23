import type { MetersPage } from '../../src/api/energia.types';
import { EXPECTED_STATUS } from '../../src/data/oracle.data';
import {
  expectedMeterIds,
  knownDefects,
  PAIRWISE_ROWS,
  pairwiseLabel,
  pairwiseQuery,
} from '../../src/data/pairwise.data';
import { expect, test } from '../../src/fixtures/test';
import { isSortedBy } from '../../src/utils/ordering';

// qa/03-casos-caja-negra.md, TC-16 and section 4: the 30 PICT combinations of getAll against four rules.
// Severity sorts in its natural direction: ASC runs without anomaly, LOW, MEDIUM, HIGH.
test.describe('Pairwise de POST /meter/getAll', { tag: '@regression' }, () => {
  for (const row of PAIRWISE_ROWS) {
    test(`TC-16 Verifica que la combinación #${row.index} (${pairwiseLabel(row)}) cumple filtro, búsqueda, conteo y orden`, async ({
      api,
    }) => {
      const defects = knownDefects(row);
      test.fail(defects.length > 0, `${defects.join(' y ')}: la expectativa documentada de esta combinación no se cumple`);

      const response = await api.meters(pairwiseQuery(row));
      expect(response.status()).toBe(200);
      const { count, rows } = (await response.json()) as MetersPage;
      const expectedIds = expectedMeterIds(row);

      // Rule 1, filter: every returned meter has the requested status according to table 2.1.
      const wrongStatus = rows.filter((meter) => row.status && EXPECTED_STATUS[meter.meter_id] !== row.status);
      expect(wrongStatus.map((meter) => meter.meter_id)).toEqual([]);
      // Rule 2, search: every returned meter_id contains the term, ignoring case.
      for (const meter of rows) {
        expect(meter.meter_id.toLowerCase()).toContain((row.meterId ?? '').toLowerCase());
      }
      // Rule 3, count: the meters that satisfy rules 1 and 2 at once.
      expect(count).toBe(expectedIds.length);
      expect(rows.map((meter) => meter.meter_id).sort()).toEqual(expectedIds);
      // Rule 4, order: monotonic by sort_by and sort_order (defaults: meter_id, ASC).
      expect(isSortedBy(rows, row.sortBy ?? 'meter_id', row.sortOrder ?? 'ASC')).toBe(true);
    });
  }
});
