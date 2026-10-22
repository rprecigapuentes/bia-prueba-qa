import type { Locator, Page } from '@playwright/test';
import { AppHeader } from '../components/app-header.component';
import { AnalysisSheet } from '../components/analysis-sheet.component';

/** Shared shape of the authenticated screens: header, analysis sheet and the level-1 heading. */
export abstract class BasePage {
  readonly header: AppHeader;
  readonly analysisSheet: AnalysisSheet;
  protected readonly main: Locator;

  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {
    this.header = new AppHeader(page);
    this.analysisSheet = new AnalysisSheet(page);
    this.main = page.getByRole('main');
  }

  async open(): Promise<void> {
    await this.page.goto(this.path);
  }

  heading(): Locator {
    return this.main.getByRole('heading', { level: 1 });
  }

  currentUrl(): string {
    return this.page.url();
  }
}
