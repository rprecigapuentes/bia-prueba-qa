import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { MetersQuery, TokenResponse } from './energia.types';

const V1 = '/api/v1';

/**
 * Typed client over the EnergIA REST API. Methods return the raw response so a test can assert
 * the status code and the error body as well as the happy-path payload.
 */
export class EnergiaApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token: string | null = null,
  ) {}

  withToken(token: string | null): EnergiaApi {
    return new EnergiaApi(this.request, token);
  }

  withoutToken(): EnergiaApi {
    return this.withToken(null);
  }

  health(): Promise<APIResponse> {
    return this.request.get('/health');
  }

  login(email: string, password: string): Promise<APIResponse> {
    return this.request.post(`${V1}/auth/login`, { data: { email, password } });
  }

  async tokenFor(email: string, password: string): Promise<string> {
    const response = await this.login(email, password);
    if (!response.ok()) {
      throw new Error(`Login failed with ${response.status()}: ${await response.text()}`);
    }
    return ((await response.json()) as TokenResponse).access_token;
  }

  me(): Promise<APIResponse> {
    return this.request.get(`${V1}/auth/me`, { headers: this.headers() });
  }

  meterParams(): Promise<APIResponse> {
    return this.request.get(`${V1}/meter/getParams`, { headers: this.headers() });
  }

  meters(query?: MetersQuery): Promise<APIResponse> {
    return this.request.post(`${V1}/meter/getAll`, { headers: this.headers(), data: query });
  }

  meter(meterId: string): Promise<APIResponse> {
    return this.request.get(`${V1}/meter/getById/${encodeURIComponent(meterId)}`, { headers: this.headers() });
  }

  anomalies(): Promise<APIResponse> {
    return this.request.get(`${V1}/anomaly/getAll`, { headers: this.headers() });
  }

  dashboardSummary(): Promise<APIResponse> {
    return this.request.get(`${V1}/dashboard/getSummary`, { headers: this.headers() });
  }

  startAnalysis(): Promise<APIResponse> {
    return this.request.post(`${V1}/ai/analyze`, { headers: this.headers() });
  }

  analysis(id: string): Promise<APIResponse> {
    return this.request.get(`${V1}/ai/analysis/${encodeURIComponent(id)}`, { headers: this.headers() });
  }

  latestAnalysis(): Promise<APIResponse> {
    return this.request.get(`${V1}/ai/analysis/latest`, { headers: this.headers() });
  }

  private headers(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}
