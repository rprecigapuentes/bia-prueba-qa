// Display strings of the es-CO interface, derived from the oracle numbers.
const MINUS_SIGN = '−';

const oneDecimal = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const signedOneDecimal = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: 'always',
});
const twoDecimals = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 2207.6 -> '2.207,6 kWh' */
export function formatKwh(value: number): string {
  return `${oneDecimal.format(value)} kWh`;
}

/** 109.8 -> '+109,8 %'; the interface prints negatives with U+2212, not a hyphen. */
export function formatVariation(value: number): string {
  return `${signedOneDecimal.format(value).replace('-', MINUS_SIGN)} %`;
}

/** 0.95 -> '0,95' */
export function formatConfidence(value: number): string {
  return twoDecimals.format(value);
}
