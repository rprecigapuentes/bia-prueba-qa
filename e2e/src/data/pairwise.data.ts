// The 30 pairwise combinations of POST /meter/getAll, read from the PICT output that qa/ versions,
// so the model and the suite cannot drift apart (qa/03-casos-caja-negra.md, section 4).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { MetersQuery, SortField, SortOrder } from '../api/energia.types';
import { EXPECTED_STATUS, METER_IDS, type MeterStatus } from './oracle.data';

const PICT_OUTPUT = path.resolve(__dirname, '../../../qa/evidencias/pairwise/getall.pict.out.tsv');
const OMITTED = 'omitido';

export interface PairwiseRow {
  /** 1-based position in the PICT output. */
  index: number;
  status?: MeterStatus;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  meterId?: string;
}

const STATUSES: readonly string[] = ['NORMAL', 'ALERT', 'CRITICAL'];
const SORT_FIELDS: readonly string[] = ['meter_id', 'consumption', 'variation', 'severity'];
const SORT_ORDERS: readonly string[] = ['ASC', 'DESC'];

function optional<T extends string>(value: string, allowed: readonly string[] | null, column: string): T | undefined {
  if (value === OMITTED) return undefined;
  if (allowed && !allowed.includes(value)) throw new Error(`Unknown ${column} "${value}" in ${PICT_OUTPUT}`);
  return value as T;
}

export function readPairwiseRows(): PairwiseRow[] {
  const [header, ...lines] = readFileSync(PICT_OUTPUT, 'utf8').trim().split(/\r?\n/);
  const columns = header.split('\t');
  return lines.map((line, position) => {
    const cells = Object.fromEntries(line.split('\t').map((cell, i) => [columns[i], cell.trim()]));
    return {
      index: position + 1,
      status: optional<MeterStatus>(cells.status, STATUSES, 'status'),
      sortBy: optional<SortField>(cells.sort_by, SORT_FIELDS, 'sort_by'),
      sortOrder: optional<SortOrder>(cells.sort_order, SORT_ORDERS, 'sort_order'),
      meterId: optional(cells.meter_id, null, 'meter_id'),
    };
  });
}

export const PAIRWISE_ROWS: readonly PairwiseRow[] = readPairwiseRows();

export function pairwiseLabel(row: PairwiseRow): string {
  const value = (v: string | undefined) => v ?? OMITTED;
  return `status=${value(row.status)}, sort_by=${value(row.sortBy)}, sort_order=${value(row.sortOrder)}, meter_id=${value(row.meterId)}`;
}

/** Request for the row: every page of 12 meters fits in one page of 100. */
export function pairwiseQuery(row: PairwiseRow): MetersQuery {
  return {
    filter: {
      ...(row.status && { status: row.status }),
      ...(row.sortBy && { sort_by: row.sortBy }),
      ...(row.sortOrder && { sort_order: row.sortOrder }),
      ...(row.meterId && { meter_id: row.meterId }),
    },
    pagination: { page: 1, size: 100 },
  };
}

function matchesSearch(meterId: string, term: string | undefined): boolean {
  return !term || meterId.toLowerCase().includes(term.toLowerCase());
}

/** Meters that satisfy the status filter (table 2.1) and the case-insensitive search at the same time. */
export function expectedMeterIds(row: PairwiseRow): string[] {
  return METER_IDS.filter(
    (meterId) => (!row.status || EXPECTED_STATUS[meterId] === row.status) && matchesSearch(meterId, row.meterId),
  );
}

/** Open defects that make the documented expectation of this row unattainable today. */
export function knownDefects(row: PairwiseRow): string[] {
  const defects: string[] = [];
  // BUG-01: M-106 reports ALERT instead of NORMAL, so it moves between the NORMAL and ALERT results.
  if ((row.status === 'NORMAL' || row.status === 'ALERT') && matchesSearch('M-106', row.meterId)) {
    defects.push('BUG-01');
  }
  // BUG-04: a search term with lowercase letters matches nothing.
  if (row.meterId && row.meterId !== row.meterId.toUpperCase() && expectedMeterIds(row).length > 0) {
    defects.push('BUG-04');
  }
  return defects;
}
