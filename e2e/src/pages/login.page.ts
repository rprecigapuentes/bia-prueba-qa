import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Contraseña');
    this.submitButton = page.getByRole('button', { name: 'Entrar' });
  }

  async open(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  heading(): Locator {
    return this.page.getByRole('heading', { name: 'Iniciar sesión' });
  }

  errorMessage(): Locator {
    return this.page.getByRole('alert');
  }
}
