import type { Anomaly } from '../../src/api/energia.types';
import { EXPECTED_ANOMALIES } from '../../src/data/oracle.data';
import { expect, test } from '../../src/fixtures/test';

// qa/03-casos-caja-negra.md, table 2.3: severity, then energy at stake, then confidence.
test.describe('Orden de prioridad de las anomalías', { tag: '@regression' }, () => {
  for (const expected of EXPECTED_ANOMALIES) {
    test(`TC-14 Verifica que la posición ${expected.priority} de las anomalías es ${expected.meterId} con priority ${expected.priority}`, async ({
      api,
    }) => {
      const response = await api.anomalies();
      expect(response.status()).toBe(200);

      const anomalies = (await response.json()) as Anomaly[];
      expect(anomalies).toHaveLength(EXPECTED_ANOMALIES.length);
      expect(anomalies[expected.priority - 1]).toMatchObject({
        meter_id: expected.meterId,
        priority: expected.priority,
      });
    });
  }
});
