// Boundary values of qa/03-casos-caja-negra.md, section 3.2 (API rows).
import { DEFAULT_PAGE_SIZE, METER_IDS } from './oracle.data';

interface BoundaryBase {
  id: 'TC-10' | 'TC-11';
  description: string;
  pagination: { page?: number; size?: number };
}

export interface AcceptedBoundary extends BoundaryBase {
  /** The meters on the requested page, in the default meter_id ASC order. */
  expectedIds: readonly string[];
}

export interface RejectedBoundary extends BoundaryBase {
  /** The field the 400 body must name. */
  errorField: string;
}

function pageOf(page: number, size: number): readonly string[] {
  return METER_IDS.slice((page - 1) * size, page * size);
}

// size 0 is left out: the API answers 200 with size 10 (BUG-06, manual case).
export const ACCEPTED_SIZE_BOUNDARIES: readonly AcceptedBoundary[] = [
  {
    id: 'TC-10',
    description: 'size 1 (mínimo) devuelve 1 fila y count 12',
    pagination: { size: 1 },
    expectedIds: pageOf(1, 1),
  },
  {
    id: 'TC-10',
    description: 'size 100 (máximo) devuelve las 12 filas',
    pagination: { size: 100 },
    expectedIds: pageOf(1, 100),
  },
];

export const REJECTED_SIZE_BOUNDARIES: readonly RejectedBoundary[] = [
  {
    id: 'TC-10',
    description: 'size 101 (sobre el máximo) responde 400 con el formato de error',
    pagination: { size: 101 },
    errorField: 'pagination.size',
  },
];

// page -1 is left out: the API answers 500 instead of 400 (BUG-05, tests/defects/).
export const ACCEPTED_PAGE_BOUNDARIES: readonly AcceptedBoundary[] = [
  {
    id: 'TC-11',
    description: 'page 1 con size 10 devuelve 10 filas',
    pagination: { page: 1, size: DEFAULT_PAGE_SIZE },
    expectedIds: pageOf(1, DEFAULT_PAGE_SIZE),
  },
  {
    id: 'TC-11',
    description: 'page 2 con size 10 (última página) devuelve M-111 y M-112',
    pagination: { page: 2, size: DEFAULT_PAGE_SIZE },
    expectedIds: pageOf(2, DEFAULT_PAGE_SIZE),
  },
  {
    id: 'TC-11',
    description: 'page 3 con size 10 (más allá de la última) devuelve 0 filas con count 12',
    pagination: { page: 3, size: DEFAULT_PAGE_SIZE },
    expectedIds: pageOf(3, DEFAULT_PAGE_SIZE),
  },
];
