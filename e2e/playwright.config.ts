import { defineConfig, devices } from '@playwright/test';
import { env, OPERATOR_CONTEXT, STORAGE_STATE } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: env.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // PW_VIDEO=on and PW_SLOWMO=<ms> record a watchable run for the delivery video.
    video: process.env.PW_VIDEO === 'on' ? 'on' : 'retain-on-failure',
    launchOptions: { slowMo: Number(process.env.PW_SLOWMO ?? 0) },
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], ...OPERATOR_CONTEXT },
    },
    {
      name: 'chromium',
      testMatch: /.*\.ui\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], ...OPERATOR_CONTEXT, storageState: STORAGE_STATE },
    },
    {
      name: 'firefox',
      testMatch: /.*\.ui\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'], ...OPERATOR_CONTEXT, storageState: STORAGE_STATE },
    },
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: { baseURL: env.apiUrl },
    },
  ],
});
