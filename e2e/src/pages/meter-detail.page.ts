import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/** "/medidores/:id" Detalle: key figures, current order, electrical variables, history and events. */
export class MeterDetailPage extends BasePage {
  protected readonly path: string;
  private readonly summary: Locator;

  constructor(page: Page, private readonly meterId: string) {
    super(page);
    this.path = `/medidores/${encodeURIComponent(meterId)}`;
    this.summary = this.main.getByRole('region', { name: meterId, exact: true });
  }

  summaryRegion(): Locator {
    return this.summary;
  }

  status(): Locator {
    return this.summary.getByText(/^(Normal|Alerta|Crítica)$/);
  }

  lastReading(): Locator {
    return this.summary.getByText(/Última lectura/);
  }

  order(): Locator {
    return this.main.getByRole('region', { name: /^Orden \d/ });
  }

  electricalVariables(): Locator {
    return this.main.getByRole('heading', { name: 'Variables eléctricas' });
  }

  hourlyHistory(): Locator {
    return this.main.getByRole('heading', { name: 'Histórico por hora' });
  }

  events(): Locator {
    // The events list has no accessible name; XPath picks the element right after its heading.
    return this.main.getByRole('heading', { name: 'Eventos registrados' }).locator('xpath=following-sibling::*[1]').getByRole('listitem');
  }

  async openInvestigation(): Promise<void> {
    await this.order().getByRole('link', { name: 'Abrir investigación' }).click();
  }

  id(): string {
    return this.meterId;
  }
}
