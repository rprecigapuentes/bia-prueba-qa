// Expected values as the documentation states them. Tests compare against these, never against
// what the application itself returns.

export type AnomalyType = 'REAL_ANOMALY' | 'EXPLAINABLE_ANOMALY' | 'FALSE_POSITIVE' | 'DATA_QUALITY';
export type Severity = 'HIGH' | 'MEDIUM' | 'LOW';
export type MeterStatus = 'NORMAL' | 'ALERT' | 'CRITICAL';

export interface ExpectedAnomaly {
  meterId: string;
  priority: number;
  type: AnomalyType;
  severity: Severity;
  confidence: number;
  status: MeterStatus;
}

// backend/README.md, "Resultado sobre el dataset" and "Estado de alerta de un medidor".
export const EXPECTED_ANOMALIES: readonly ExpectedAnomaly[] = [
  { meterId: 'M-109', priority: 1, type: 'REAL_ANOMALY', severity: 'HIGH', confidence: 0.95, status: 'CRITICAL' },
  { meterId: 'M-112', priority: 2, type: 'DATA_QUALITY', severity: 'HIGH', confidence: 0.95, status: 'CRITICAL' },
  { meterId: 'M-104', priority: 3, type: 'EXPLAINABLE_ANOMALY', severity: 'MEDIUM', confidence: 0.86, status: 'ALERT' },
  { meterId: 'M-106', priority: 4, type: 'FALSE_POSITIVE', severity: 'LOW', confidence: 0.86, status: 'NORMAL' },
];

// frontend/PRODUCT.md, "Operating Context": M-101 to M-112.
export const METER_IDS = Array.from({ length: 12 }, (_, i) => `M-${101 + i}`);
export const TOTAL_METERS = METER_IDS.length;

// backend/README.md, "Estado de alerta de un medidor": 8 meters raise no alert, M-106 is NORMAL too.
export const EXPECTED_STATUS_COUNTS = { normal: 9, alert: 1, critical: 2 } as const;

// backend/README.md, body of POST /meter/getAll: page 1 of 10 when no pagination is sent.
export const DEFAULT_PAGE_SIZE = 10;

// backend/README.md, "Ejemplo completo: M-109" and the list/detail definitions.
export const M109 = {
  meterId: 'M-109',
  consumption24hKwh: 2207.6,
  baselineDailyKwh: 1052.15,
  variationPct: 109.8,
  changeVariationPct: 110.5,
  durationHours: 58,
  // Plant time, shown as received (frontend/README.md, "Diseño").
  detectedAtPlantTime: '12/09 14:00',
  detectedAtIso: '2026-09-12T14:00:00Z',
} as const;

// frontend/README.md, "Pantallas": the Run AI Analysis sheet shows the 7 engine steps.
export const ANALYSIS_STEPS = [
  'Lecturas',
  'Baseline',
  'Detección',
  'Correlación',
  'Eventos',
  'Explicación',
  'Recomendación',
] as const;

// UI labels for the API enums (es-CO interface, frontend/PRODUCT.md).
export const STATUS_LABEL: Record<MeterStatus, string> = {
  NORMAL: 'Normal',
  ALERT: 'Alerta',
  CRITICAL: 'Crítica',
};

// qa/03-casos-caja-negra.md, table 2.1: M-109 and M-112 CRITICAL, M-104 ALERT, every other meter NORMAL
// (M-106 included, rule D2).
export const EXPECTED_STATUS: Readonly<Record<string, MeterStatus>> = Object.fromEntries(
  METER_IDS.map((meterId) => [
    meterId,
    EXPECTED_ANOMALIES.find((anomaly) => anomaly.meterId === meterId)?.status ?? 'NORMAL',
  ]),
);

// qa/03-casos-caja-negra.md, section 4, rule 4: without anomaly < LOW < MEDIUM < HIGH, natural order.
export const SEVERITY_RANK: Readonly<Record<Severity, number>> = { LOW: 1, MEDIUM: 2, HIGH: 3 };

// qa/03-casos-caja-negra.md, table 2.4: 14 days of hourly readings from 01/09 00:00, plant time.
export const LAST_READING_PLANT_TIME = '14/09 23:00';
