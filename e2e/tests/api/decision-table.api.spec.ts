import type { Anomaly, MeterSummary } from '../../src/api/energia.types';
import { SEVERITY_DECISION_TABLE, STATUS_DECISION_TABLE } from '../../src/data/decision-table.data';
import { EXPECTED_ANOMALIES } from '../../src/data/oracle.data';
import { expect, test } from '../../src/fixtures/test';

// qa/03-casos-caja-negra.md, tables 2.1 and 2.2.
test.describe('Tablas de decisión de la API', { tag: '@regression' }, () => {
  // Rows with a known defect (D2, BUG-01) are exercised in tests/defects/.
  for (const row of STATUS_DECISION_TABLE.filter((rule) => !rule.knownDefect)) {
    test(`${row.id} Verifica que la regla ${row.rule} deja a ${row.meterId} en estado ${row.expectedStatus}`, async ({
      api,
    }) => {
      const response = await api.meter(row.meterId);
      expect(response.status()).toBe(200);

      const meter = (await response.json()) as MeterSummary;
      expect(meter.status).toBe(row.expectedStatus);
      expect(meter.anomaly_type ?? null).toBe(row.type ?? null);
      expect(meter.severity ?? null).toBe(row.severity ?? null);
    });
  }

  for (const row of SEVERITY_DECISION_TABLE.filter((rule) => rule.meterId)) {
    test(`${row.id} Verifica que ${row.type} con ${row.condition} tiene severidad ${row.expectedSeverity} en ${row.meterId}`, async ({
      api,
    }) => {
      const anomalies = (await (await api.anomalies()).json()) as Anomaly[];
      const anomaly = anomalies.find((candidate) => candidate.meter_id === row.meterId);
      const expected = EXPECTED_ANOMALIES.find((candidate) => candidate.meterId === row.meterId);

      expect(anomaly).toBeDefined();
      expect(anomaly?.type).toBe(row.type);
      expect(anomaly?.severity).toBe(row.expectedSeverity);
      expect(anomaly?.confidence).toBe(expected?.confidence);
    });
  }
});
