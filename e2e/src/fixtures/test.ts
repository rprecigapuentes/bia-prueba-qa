import { test as base, expect } from '@playwright/test';
import { EnergiaApi } from '../api/energia.api';
import { env } from '../config/env';
import { AnomaliesPage } from '../pages/anomalies.page';
import { DispatchPage } from '../pages/dispatch.page';
import { InvestigationPage } from '../pages/investigation.page';
import { LoginPage } from '../pages/login.page';
import { MeterDetailPage } from '../pages/meter-detail.page';
import { MeterLedgerPage } from '../pages/meter-ledger.page';

interface PageFixtures {
  loginPage: LoginPage;
  dispatchPage: DispatchPage;
  ledgerPage: MeterLedgerPage;
  anomaliesPage: AnomaliesPage;
  meterDetailPage: (meterId: string) => MeterDetailPage;
  investigationPage: (meterId: string) => InvestigationPage;
  /** Client authenticated as the operator. Use api.withoutToken() for negative cases. */
  api: EnergiaApi;
}

interface WorkerFixtures {
  operatorToken: string;
}

export const test = base.extend<PageFixtures, WorkerFixtures>({
  operatorToken: [
    async ({ playwright }, use) => {
      const request = await playwright.request.newContext({ baseURL: env.apiUrl });
      const token = await new EnergiaApi(request).tokenFor(env.operatorEmail, env.operatorPassword);
      await use(token);
      await request.dispose();
    },
    { scope: 'worker' },
  ],

  api: async ({ playwright, operatorToken }, use) => {
    const request = await playwright.request.newContext({ baseURL: env.apiUrl });
    await use(new EnergiaApi(request, operatorToken));
    await request.dispose();
  },

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  dispatchPage: async ({ page }, use) => use(new DispatchPage(page)),
  ledgerPage: async ({ page }, use) => use(new MeterLedgerPage(page)),
  anomaliesPage: async ({ page }, use) => use(new AnomaliesPage(page)),
  meterDetailPage: async ({ page }, use) => use((meterId) => new MeterDetailPage(page, meterId)),
  investigationPage: async ({ page }, use) => use((meterId) => new InvestigationPage(page, meterId)),
});

export { expect };

/** Browser context with no session, for tests that exercise the login itself. */
export const NO_SESSION = { cookies: [], origins: [] };
