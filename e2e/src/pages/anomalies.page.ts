import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export const ANOMALY_COLUMNS = [
  'Prior.',
  'Medidor',
  'Tipo',
  'Severidad',
  'Confianza',
  'Acción',
  'Detectada',
  'Redactó',
] as const;
export type AnomalyColumn = (typeof ANOMALY_COLUMNS)[number];

/** "/anomalias" Anomalías IA: one row per anomaly, ordered by priority. */
export class AnomaliesPage extends BasePage {
  protected readonly path = '/anomalias';

  private table(): Locator {
    return this.main.getByRole('table', { name: /Anomalías detectadas por la IA/ });
  }

  rows(): Locator {
    return this.table().getByRole('rowgroup').nth(1).getByRole('row');
  }

  meterIdsInOrder(): Locator {
    return this.rows().getByRole('rowheader');
  }

  row(meterId: string): Locator {
    return this.rows().filter({ has: this.page.getByRole('rowheader', { name: meterId, exact: true }) });
  }

  cell(meterId: string, column: AnomalyColumn): Locator {
    // "Medidor" is the rowheader; cells skip it.
    const index = ANOMALY_COLUMNS.indexOf(column);
    if (index === 1) return this.row(meterId).getByRole('rowheader');
    return this.row(meterId).getByRole('cell').nth(index === 0 ? 0 : index - 1);
  }

  async openInvestigation(meterId: string): Promise<void> {
    await this.row(meterId).getByRole('link', { name: meterId, exact: true }).click();
  }
}
