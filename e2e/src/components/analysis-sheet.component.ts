import type { Locator, Page } from '@playwright/test';

/** Side sheet opened by Run AI Analysis: the 7 engine steps and the final status. */
export class AnalysisSheet {
  private readonly root: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('region', { name: /^Análisis de IA/ });
  }

  container(): Locator {
    return this.root;
  }

  steps(): Locator {
    return this.root.getByRole('list').getByRole('listitem');
  }

  step(label: string): Locator {
    return this.steps().filter({ hasText: label });
  }

  result(): Locator {
    return this.root.getByRole('status');
  }

  async openOrders(): Promise<void> {
    await this.result().getByRole('link', { name: 'Ver órdenes' }).click();
  }

  async close(): Promise<void> {
    await this.root.getByRole('button', { name: 'Cerrar la hoja del análisis' }).click();
  }
}
