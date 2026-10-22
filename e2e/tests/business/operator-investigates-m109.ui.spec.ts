import { EXPECTED_ANOMALIES, M109, STATUS_LABEL } from '../../src/data/oracle.data';
import { expect, test } from '../../src/fixtures/test';
import { formatConfidence, formatKwh, formatVariation } from '../../src/utils/format';

// The operator's path from the ledger to the recommended action (qa/03-casos-caja-negra.md, TC-19 and TC-14).
// Plant times are not asserted here: the browser-timezone conversion is BUG-02 (tests/defects/).
const M109_EXPECTED = EXPECTED_ANOMALIES.find((anomaly) => anomaly.meterId === M109.meterId)!;

test.describe('Flujo de negocio del operador', { tag: '@regression' }, () => {
  test('TC-19 Verifica que el operador llega de Críticas a M-109 y ve estado, cifras e investigación que coinciden con el oráculo', async ({
    ledgerPage,
    meterDetailPage,
    investigationPage,
  }) => {
    await test.step('Abre el libro de medidores y filtra por Críticas', async () => {
      await ledgerPage.open();
      await ledgerPage.filterByStatus('Críticas');
      await expect(ledgerPage.meterIds()).toHaveText(['M-109', 'M-112']);
    });

    await test.step('Busca 109 y abre el detalle de M-109', async () => {
      await ledgerPage.search('109');
      await expect(ledgerPage.meterIds()).toHaveText([M109.meterId]);
      await ledgerPage.openMeter(M109.meterId);
    });

    const detail = meterDetailPage(M109.meterId);

    await test.step('Valida estado, consumo, baseline y variación del detalle', async () => {
      await expect(detail.heading()).toHaveText(M109.meterId);
      await expect(detail.status()).toHaveText(STATUS_LABEL[M109_EXPECTED.status]);
      await expect(detail.consumption()).toHaveText(formatKwh(M109.consumption24hKwh));
      await expect(detail.baseline()).toHaveText(formatKwh(M109.baselineDailyKwh));
      await expect(detail.variation()).toHaveText(formatVariation(M109.variationPct));
    });

    await test.step('Abre la investigación y valida tipo, severidad, confianza, prioridad y acción', async () => {
      await detail.openInvestigation();
      const investigation = investigationPage(M109.meterId);

      await expect(investigation.heading()).toHaveText(M109.meterId);
      await expect(investigation.anomalyType()).toHaveText('Anomalía real');
      await expect(investigation.severity()).toHaveText('Alta');
      await expect(investigation.confidence()).toContainText(formatConfidence(M109_EXPECTED.confidence));
      await expect(investigation.orderBanner()).toContainText(
        `Prioridad ${M109_EXPECTED.priority} de ${EXPECTED_ANOMALIES.length}`,
      );
      await expect(investigation.recommendedAction()).toContainText('Investigar');
    });
  });
});
