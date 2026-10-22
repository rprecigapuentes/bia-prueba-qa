// Subset of the API contract (http://localhost:8080/docs/openapi.json) that the suite reads.
import type { AnomalyType, MeterStatus, Severity } from '../data/oracle.data';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface ApiError {
  status_code: number;
  message: string;
  errors?: string[];
  timestamp: string;
  path: string;
}

export type SortField = 'meter_id' | 'consumption' | 'variation' | 'severity';
export type SortOrder = 'ASC' | 'DESC';

export interface MetersQuery {
  pagination?: { page?: number; size?: number };
  filter?: { meter_id?: string; status?: string; sort_by?: string; sort_order?: string };
}

export interface MeterSummary {
  meter_id: string;
  status: MeterStatus;
  anomaly_type?: AnomalyType;
  severity?: Severity;
  priority?: number;
  consumption_kwh: number;
  baseline_kwh: number;
  variation_pct: number;
  last_reading_at: string;
}

export interface MetersPage {
  count: number;
  page: number;
  size: number;
  rows: MeterSummary[];
}

export interface Anomaly {
  meter_id: string;
  anomaly: boolean;
  type: AnomalyType;
  severity: Severity;
  confidence: number;
  priority: number;
  detected_at: string;
  reason: string;
  recommended_action: string;
  narrated_by: string;
}

export interface DashboardSummary {
  total_meters: number;
  status_counts: { normal: number; alert: number; critical: number };
  anomalies_detected: number;
  requiring_attention: number;
}

export interface AnalysisRun {
  id: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  steps: { key: string; label: string; status: string; detail?: string }[];
}
