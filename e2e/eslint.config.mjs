import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

const forbiddenWaits = {
  'playwright/no-wait-for-timeout': 'error',
  'playwright/no-page-pause': 'error',
};

export default tseslint.config(
  { ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**', '.auth/**'] },
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    plugins: { playwright },
    rules: forbiddenWaits,
  },
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      ...forbiddenWaits,
      'playwright/no-raw-locators': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/expect-expect': ['warn', { assertFunctionNames: ['expect.poll'] }],
      'no-restricted-imports': [
        'error',
        { paths: [{ name: '@playwright/test', message: 'Import test and expect from src/fixtures/test.' }] },
      ],
    },
  },
);
