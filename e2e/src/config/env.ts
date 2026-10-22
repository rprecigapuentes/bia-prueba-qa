import path from 'node:path';

try {
  process.loadEnvFile(path.resolve(__dirname, '../../.env'));
} catch {
  // No .env: the local defaults below apply.
}

export const env = {
  baseUrl: process.env.BASE_URL ?? 'http://localhost:3000',
  apiUrl: process.env.API_URL ?? 'http://localhost:8080',
  operatorEmail: process.env.OPERATOR_EMAIL ?? 'admin@energia.local',
  operatorPassword: process.env.OPERATOR_PASSWORD ?? 'admin123',
} as const;

export const OPERATOR_CONTEXT = {
  timezoneId: 'America/Bogota',
  locale: 'es-CO',
} as const;

export const STORAGE_STATE = path.resolve(__dirname, '../../.auth/operator.json');
