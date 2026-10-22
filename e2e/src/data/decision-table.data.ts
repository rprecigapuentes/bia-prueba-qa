// Decision tables of qa/03-casos-caja-negra.md, sections 2.1 and 2.2.
import type { AnomalyType, MeterStatus, Severity } from './oracle.data';

export interface StatusRule {
  id: 'TC-13';
  rule: 'D1' | 'D2' | 'D3' | 'D4' | 'D5';
  meterId: string;
  type?: AnomalyType;
  severity?: Severity;
  expectedStatus: MeterStatus;
  /** Open defect that breaks the row today; the row is exercised in tests/defects/ instead. */
  knownDefect?: 'BUG-01';
}

// Table 2.1: anomaly type and severity -> meter status.
export const STATUS_DECISION_TABLE: readonly StatusRule[] = [
  { id: 'TC-13', rule: 'D1', meterId: 'M-101', expectedStatus: 'NORMAL' },
  { id: 'TC-13', rule: 'D2', meterId: 'M-106', type: 'FALSE_POSITIVE', severity: 'LOW', expectedStatus: 'NORMAL', knownDefect: 'BUG-01' },
  { id: 'TC-13', rule: 'D3', meterId: 'M-109', type: 'REAL_ANOMALY', severity: 'HIGH', expectedStatus: 'CRITICAL' },
  { id: 'TC-13', rule: 'D4', meterId: 'M-112', type: 'DATA_QUALITY', severity: 'HIGH', expectedStatus: 'CRITICAL' },
  { id: 'TC-13', rule: 'D5', meterId: 'M-104', type: 'EXPLAINABLE_ANOMALY', severity: 'MEDIUM', expectedStatus: 'ALERT' },
];

export interface SeverityRule {
  id: 'TC-15';
  type: AnomalyType;
  condition: string;
  expectedSeverity: Severity;
  /** Meter that exercises the rule in the dataset; the other rows only fit unit tests (qa/04). */
  meterId?: string;
}

// Table 2.2: severity by anomaly type.
export const SEVERITY_DECISION_TABLE: readonly SeverityRule[] = [
  { id: 'TC-15', type: 'REAL_ANOMALY', condition: 'variación > 50 % y activa', expectedSeverity: 'HIGH', meterId: 'M-109' },
  { id: 'TC-15', type: 'REAL_ANOMALY', condition: 'variación > 20 %', expectedSeverity: 'MEDIUM' },
  { id: 'TC-15', type: 'REAL_ANOMALY', condition: 'resto', expectedSeverity: 'LOW' },
  { id: 'TC-15', type: 'DATA_QUALITY', condition: '>= 12 h sospechosas', expectedSeverity: 'HIGH', meterId: 'M-112' },
  { id: 'TC-15', type: 'DATA_QUALITY', condition: '< 12 h', expectedSeverity: 'MEDIUM' },
  { id: 'TC-15', type: 'EXPLAINABLE_ANOMALY', condition: 'siempre', expectedSeverity: 'MEDIUM', meterId: 'M-104' },
  { id: 'TC-15', type: 'FALSE_POSITIVE', condition: 'siempre', expectedSeverity: 'LOW', meterId: 'M-106' },
];
