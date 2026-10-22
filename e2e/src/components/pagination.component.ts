import type { Locator } from '@playwright/test';

/** Pager under a table: "1–10 de 12 medidores" plus Anterior / Siguiente. */
export class Pagination {
  private readonly root: Locator;

  constructor(scope: Locator) {
    this.root = scope.getByRole('navigation', { name: 'Paginación' });
  }

  summary(): Locator {
    return this.root.getByText(/de \d+ medidores/);
  }

  previousButton(): Locator {
    return this.root.getByRole('button', { name: 'Anterior' });
  }

  nextButton(): Locator {
    return this.root.getByRole('button', { name: 'Siguiente' });
  }

  async next(): Promise<void> {
    await this.nextButton().click();
  }

  async previous(): Promise<void> {
    await this.previousButton().click();
  }
}
