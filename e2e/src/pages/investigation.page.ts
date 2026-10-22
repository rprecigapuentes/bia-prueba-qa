import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/** "/anomalias/:id" Investigación: what the AI found, the action, evidence, variables and events. */
export class InvestigationPage extends BasePage {
  protected readonly path: string;
  private readonly article: Locator;

  constructor(page: Page, meterId: string) {
    super(page);
    this.path = `/anomalias/${encodeURIComponent(meterId)}`;
    this.article = this.main.getByRole('article', { name: meterId });
  }

  heading(): Locator {
    return this.article.getByRole('heading', { level: 1 });
  }

  orderBanner(): Locator {
    return this.article.getByText(/Orden de trabajo · Prioridad/);
  }

  detectedAt(): Locator {
    return this.article.getByText(/Detectada \d{2}\/\d{2} \d{2}:\d{2}/);
  }

  anomalyType(): Locator {
    return this.article.getByRole('paragraph').first();
  }

  severity(): Locator {
    return this.article.getByRole('definition').first();
  }

  finding(): Locator {
    return this.article.getByRole('heading', { name: 'Qué encontró la IA' });
  }

  recommendedAction(): Locator {
    return this.article.getByRole('region', { name: 'Acción recomendada' });
  }

  evidenceSignals(): Locator {
    // The signal list has no accessible name; XPath picks the list right after its heading.
    return this.article.getByRole('heading', { name: 'Evidencia y confianza' }).locator('xpath=following-sibling::ul[1]').getByRole('listitem');
  }

  variablesTable(): Locator {
    return this.article.getByRole('table', { name: /Variables eléctricas durante la ventana/ });
  }
}
