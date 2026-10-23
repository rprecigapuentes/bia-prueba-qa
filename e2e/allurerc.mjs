import { defineConfig } from 'allure';

// Allure 3 report as a single HTML file, so it opens with a double click (no server needed).
export default defineConfig({
  name: 'EnergIA · Suite de Playwright',
  output: './allure-report',
  plugins: {
    awesome: {
      options: {
        singleFile: true,
        reportLanguage: 'en',
      },
    },
  },
});
