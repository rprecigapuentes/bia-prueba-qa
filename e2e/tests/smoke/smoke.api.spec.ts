import type { AnalysisRun, Anomaly, ApiError, DashboardSummary, MetersPage, TokenResponse } from '../../src/api/energia.types';
import { env } from '../../src/config/env';
import { TOTAL_METERS } from '../../src/data/oracle.data';
import { expect, test } from '../../src/fixtures/test';

// qa/02-smoke.md, cases SM-01 to SM-08: availability and plausible data, not business rules.
test.describe('Humo de la API', { tag: '@smoke' }, () => {
  test('SM-01 Verifica que /health responde 200 con status ok', async ({ api }) => {
    const response = await api.health();
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  test('SM-02 Verifica que el login con credenciales válidas devuelve un access_token', async ({ api }) => {
    const response = await api.login(env.operatorEmail, env.operatorPassword);
    expect(response.status()).toBe(200);
    const body = (await response.json()) as TokenResponse;
    expect(body.access_token).toBeTruthy();
  });

  test('SM-03 Verifica que el libro de medidores sin token responde 401 con el formato de error', async ({ api }) => {
    const response = await api.withoutToken().meters();
    expect(response.status()).toBe(401);
    const body = (await response.json()) as ApiError;
    expect(body).toMatchObject({ status_code: 401, path: '/api/v1/meter/getAll' });
    expect(body.message).toBeTruthy();
  });

  test('SM-04 Verifica que el libro de medidores con token devuelve los 12 medidores', async ({ api }) => {
    const response = await api.meters();
    expect(response.status()).toBe(200);
    const body = (await response.json()) as MetersPage;
    expect(body.count).toBe(TOTAL_METERS);
    expect(body.rows.length).toBeGreaterThan(0);
  });

  test('SM-05 Verifica que el detalle de M-109 responde 200 con su meter_id', async ({ api }) => {
    const response = await api.meter('M-109');
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ meter_id: 'M-109' });
  });

  test('SM-06 Verifica que la lista de anomalías responde 200 y no está vacía', async ({ api }) => {
    const response = await api.anomalies();
    expect(response.status()).toBe(200);
    expect(((await response.json()) as Anomaly[]).length).toBeGreaterThan(0);
  });

  test('SM-07 Verifica que el resumen del despacho responde 200 con el total de medidores', async ({ api }) => {
    const response = await api.dashboardSummary();
    expect(response.status()).toBe(200);
    expect(((await response.json()) as DashboardSummary).total_meters).toBeGreaterThan(0);
  });

  test('SM-08 Verifica que Run AI Analysis responde 202 y el análisis llega a COMPLETED', async ({ api }) => {
    const started = await api.startAnalysis();
    expect(started.status()).toBe(202);
    const { id } = (await started.json()) as AnalysisRun;

    await expect
      .poll(async () => ((await (await api.analysis(id)).json()) as AnalysisRun).status, { timeout: 30_000 })
      .toBe('COMPLETED');
  });
});
