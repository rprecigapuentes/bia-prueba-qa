import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** "/" Despacho: AI work orders by priority, plant KPIs and the severity-sorted ledger. */
export class DispatchPage extends BasePage {
  protected readonly path = '/';

  subtitle(): Locator {
    return this.main.getByText(/órdenes abiertas/);
  }

  orders(): Locator {
    return this.main.getByRole('region', { name: 'Órdenes emitidas por la IA' }).getByRole('article');
  }

  order(meterId: string): Locator {
    return this.orders().filter({ has: this.page.getByRole('heading', { name: meterId }) });
  }

  plantStatus(): Locator {
    return this.main.getByRole('region', { name: 'Estado de la planta' });
  }

  ledgerRows(): Locator {
    return this.main
      .getByRole('table', { name: 'Medidores ordenados por severidad' })
      .getByRole('rowgroup')
      .nth(1)
      .getByRole('row');
  }

  async openInvestigation(meterId: string): Promise<void> {
    await this.order(meterId).getByRole('link', { name: 'Abrir investigación' }).click();
  }
}
