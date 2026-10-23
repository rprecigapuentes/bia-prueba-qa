import type { Locator } from '@playwright/test';
import { Pagination } from '../components/pagination.component';
import { BasePage } from './base.page';

export type StatusFilter = 'Todos' | 'Normales' | 'Alertas' | 'Críticas';
export type SortOption = 'Medidor' | 'Consumo' | 'Variación' | 'Severidad';

export const LEDGER_COLUMNS = [
  'Medidor',
  'Estado',
  'Consumo 24 h',
  'Baseline',
  'Variación',
  'Severidad',
  'Anomalía',
  'Última lectura',
] as const;
export type LedgerColumn = (typeof LEDGER_COLUMNS)[number];

/** "/medidores" Libro de medidores: status filter, search, sort and pagination, all kept in the URL. */
export class MeterLedgerPage extends BasePage {
  protected readonly path = '/medidores';
  readonly pagination: Pagination;
  private readonly table: Locator;
  private readonly searchBox: Locator;
  private readonly sortSelect: Locator;

  constructor(...args: ConstructorParameters<typeof BasePage>) {
    super(...args);
    this.table = this.main.getByRole('table', { name: 'Medidores filtrados' });
    this.searchBox = this.main.getByRole('search').getByRole('combobox', { name: 'Medidor' });
    this.sortSelect = this.main.getByRole('combobox', { name: 'Ordenar por' });
    this.pagination = new Pagination(this.main);
  }

  async openWithQuery(query: string): Promise<void> {
    await this.page.goto(`${this.path}?${query}`);
  }

  async filterByStatus(status: StatusFilter): Promise<void> {
    // The radio is visually hidden (sr-only) inside its label, so the click goes to the label text.
    await this.main.getByRole('group', { name: 'Estado' }).getByText(status, { exact: true }).click();
  }

  async search(term: string): Promise<void> {
    await this.searchBox.fill(term);
    await this.main.getByRole('search').getByRole('button', { name: 'Buscar medidor' }).click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption({ label: option });
  }

  async toggleDirection(): Promise<void> {
    await this.main.getByRole('button', { name: /^Dirección:/ }).click();
  }

  rows(): Locator {
    return this.table.getByRole('rowgroup').nth(1).getByRole('row');
  }

  row(meterId: string): Locator {
    return this.rows().filter({ has: this.page.getByRole('rowheader', { name: meterId, exact: true }) });
  }

  meterIds(): Locator {
    return this.rows().getByRole('rowheader');
  }

  cell(meterId: string, column: LedgerColumn): Locator {
    // The first column is a rowheader, so the remaining ones are offset by one among the cells.
    const index = LEDGER_COLUMNS.indexOf(column);
    return index === 0 ? this.row(meterId).getByRole('rowheader') : this.row(meterId).getByRole('cell').nth(index - 1);
  }

  emptyState(): Locator {
    return this.main.getByText(/Ningún medidor coincide/);
  }

  async openMeter(meterId: string): Promise<void> {
    await this.row(meterId).getByRole('link', { name: meterId, exact: true }).click();
  }
}
