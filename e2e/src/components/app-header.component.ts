import type { Locator, Page } from '@playwright/test';

export type Section = 'Despacho' | 'Medidores' | 'Anomalías IA';

/** Top bar shared by every authenticated screen: navigation, Run AI Analysis and session. */
export class AppHeader {
  private readonly banner: Locator;
  private readonly navigation: Locator;
  private readonly runAnalysisButton: Locator;
  private readonly logoutButton: Locator;

  constructor(page: Page) {
    this.banner = page.getByRole('banner');
    this.navigation = this.banner.getByRole('navigation', { name: 'Principal' });
    this.runAnalysisButton = this.banner.getByRole('button', { name: /Run AI Analysis/ });
    this.logoutButton = this.banner.getByRole('button', { name: 'Cerrar sesión' });
  }

  async goTo(section: Section): Promise<void> {
    await this.navigation.getByRole('link', { name: section, exact: true }).click();
  }

  async runAnalysis(): Promise<void> {
    await this.runAnalysisButton.click();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }

  lastAnalysis(): Locator {
    return this.banner.getByText(/Último análisis/);
  }
}
