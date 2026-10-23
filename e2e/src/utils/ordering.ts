import type { MeterSummary, SortField, SortOrder } from '../api/energia.types';
import { SEVERITY_RANK } from '../data/oracle.data';

function sortKey(row: MeterSummary, sortBy: SortField): string | number {
  switch (sortBy) {
    case 'meter_id':
      return row.meter_id;
    case 'consumption':
      return row.consumption_kwh;
    case 'variation':
      return row.variation_pct;
    case 'severity':
      return row.severity ? SEVERITY_RANK[row.severity] : 0;
  }
}

/** True when the rows are monotonic by `sortBy` in the requested direction; ties may sit in any order. */
export function isSortedBy(rows: readonly MeterSummary[], sortBy: SortField, order: SortOrder): boolean {
  return rows.every((row, index) => {
    if (index === 0) return true;
    const previous = sortKey(rows[index - 1], sortBy);
    const current = sortKey(row, sortBy);
    return order === 'ASC' ? previous <= current : previous >= current;
  });
}
