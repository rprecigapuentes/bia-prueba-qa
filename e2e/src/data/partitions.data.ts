// Equivalence partitions of qa/03-casos-caja-negra.md, section 3.1. One row per class representative.
import { env } from '../config/env';
import type { MeterStatus } from './oracle.data';

export interface LoginPartition {
  id: 'TC-01' | 'TC-02';
  description: string;
  email: string;
  password: string;
}

export interface RejectedLoginPartition extends LoginPartition {
  expectedStatus: 400 | 401;
  /** Field names the 400 body must mention in `errors`. */
  errorsMention?: readonly string[];
}

export const ACCEPTED_LOGIN_PARTITIONS: readonly LoginPartition[] = [
  {
    id: 'TC-01',
    description: 'el login con el email en mayúsculas responde 200 con access_token',
    email: env.operatorEmail.toUpperCase(),
    password: env.operatorPassword,
  },
];

export const REJECTED_LOGIN_PARTITIONS: readonly RejectedLoginPartition[] = [
  {
    id: 'TC-01',
    description: 'el login con la contraseña incorrecta responde 401 con el formato de error',
    email: env.operatorEmail,
    password: 'mala',
    expectedStatus: 401,
  },
  {
    id: 'TC-01',
    description: 'el login con un email inexistente responde 401 con el formato de error',
    email: 'otro@energia.local',
    password: env.operatorPassword,
    expectedStatus: 401,
  },
  {
    id: 'TC-02',
    description: 'el login con email y contraseña vacíos responde 400 y nombra los campos en errors',
    email: '',
    password: '',
    expectedStatus: 400,
    errorsMention: ['email', 'password'],
  },
];

export interface SearchPartition {
  id: 'TC-05' | 'TC-07';
  description: string;
  term: string;
  expectedIds: readonly string[];
}

// The lowercase class ("m-109") is left out: it is BUG-04 and lives in tests/defects/.
export const SEARCH_PARTITIONS: readonly SearchPartition[] = [
  { id: 'TC-05', description: 'buscar "109" (parcial) devuelve solo M-109', term: '109', expectedIds: ['M-109'] },
  { id: 'TC-05', description: 'buscar "M-109" (exacta) devuelve solo M-109', term: 'M-109', expectedIds: ['M-109'] },
  { id: 'TC-07', description: 'buscar "M-999" (sin coincidencia) devuelve 200 con lista vacía', term: 'M-999', expectedIds: [] },
];

export interface ValidStatusPartition {
  id: 'TC-09';
  description: string;
  status: MeterStatus;
  expectedIds: readonly string[];
}

// NORMAL and ALERT are left out: M-106 changes both lists (BUG-01) and lives in tests/defects/.
export const VALID_STATUS_PARTITIONS: readonly ValidStatusPartition[] = [
  {
    id: 'TC-09',
    description: 'filtrar por CRITICAL devuelve solo M-109 y M-112',
    status: 'CRITICAL',
    expectedIds: ['M-109', 'M-112'],
  },
];

export interface InvalidFilterPartition {
  id: 'TC-08';
  description: string;
  filter: { status?: string; sort_by?: string };
  expectedError: string;
}

// Lowercase "critical" is left out: the API accepts it (BUG-07, manual case).
export const INVALID_FILTER_PARTITIONS: readonly InvalidFilterPartition[] = [
  {
    id: 'TC-08',
    description: 'filtrar por el estado "FOO" responde 400 con el mensaje documentado de filter.status',
    filter: { status: 'FOO' },
    expectedError: 'filter.status debe ser NORMAL, ALERT o CRITICAL',
  },
  {
    id: 'TC-08',
    description: 'ordenar por "nombre" responde 400 con el mensaje de filter.sort_by',
    filter: { sort_by: 'nombre' },
    expectedError: 'filter.sort_by debe ser meter_id, consumption, variation o severity',
  },
];

export interface UnknownMeterPartition {
  id: 'TC-07';
  description: string;
  meterId: string;
}

export const UNKNOWN_METER_PARTITIONS: readonly UnknownMeterPartition[] = [
  { id: 'TC-07', description: 'consultar el detalle de "M-999" responde 404 con el formato de error', meterId: 'M-999' },
];

export interface TokenPartition {
  id: 'TC-04';
  description: string;
  /** Builds the Authorization header from a valid token; null sends no header. */
  authorization: (validToken: string) => string | null;
}

export const TOKEN_PARTITIONS: readonly TokenPartition[] = [
  { id: 'TC-04', description: 'una ruta protegida sin header Authorization responde 401', authorization: () => null },
  {
    id: 'TC-04',
    description: 'una ruta protegida con la firma del token alterada responde 401',
    authorization: (token) => `Bearer ${token.slice(0, -4)}AAAA`,
  },
  {
    id: 'TC-04',
    description: 'una ruta protegida con el token sin el prefijo Bearer responde 401',
    authorization: (token) => token,
  },
];
