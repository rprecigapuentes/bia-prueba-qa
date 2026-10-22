// Ejecuta las 30 combinaciones pairwise de POST /api/v1/meter/getAll y evalúa las 4 reglas del oráculo
// (qa/03-casos-caja-negra.md, sección 4). Los estados esperados salen de la documentación, no de la API.
// Uso: node qa/evidencias/pairwise/run-pairwise.mjs   (API en http://localhost:8080, o API_BASE)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.API_BASE ?? 'http://localhost:8080';
const dir = dirname(fileURLToPath(import.meta.url));

// Tabla 2.1: M-109 y M-112 CRITICAL, M-104 ALERT, el resto NORMAL (incluido M-106, regla D2).
const ids = Array.from({ length: 12 }, (_, i) => `M-${101 + i}`);
const expectedStatus = Object.fromEntries(ids.map((id) => [id, 'NORMAL']));
Object.assign(expectedStatus, { 'M-109': 'CRITICAL', 'M-112': 'CRITICAL', 'M-104': 'ALERT' });
const RANK = { HIGH: 3, MEDIUM: 2, LOW: 1 };
const rank = (s) => RANK[s] ?? 0;

const login = await fetch(`${BASE}/api/v1/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@energia.local', password: 'admin123' }),
}).then((r) => r.json());
const token = login.access_token;

const lines = readFileSync(join(dir, 'getall.pict.out.tsv'), 'utf8').trim().split(/\r?\n/);
const header = lines.shift().split('\t');
const rows = lines.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [header[i], v.trim()])));

const keyOf = { meter_id: (r) => r.meter_id, consumption: (r) => r.consumption_kwh, variation: (r) => r.variation_pct, severity: (r) => rank(r.severity) };
const monotone = (vals, dirn) => vals.every((v, i) => i === 0 || (dirn === 'ASC' ? vals[i - 1] <= v : vals[i - 1] >= v));

const csvEsc = (v) => `"${String(v).replaceAll('"', '""')}"`;
const out = [['fila', 'status', 'sort_by', 'sort_order', 'meter_id', 'http', 'conteo_esperado', 'conteo_actual', 'regla1_filtro', 'regla2_busqueda', 'regla3_conteo', 'regla4_orden', 'nota_orden', 'ids_devueltos']];
let pass = 0;
const failsByRule = [0, 0, 0, 0];

for (const [i, r] of rows.entries()) {
  const filter = {};
  if (r.status !== 'omitido') filter.status = r.status;
  if (r.sort_by !== 'omitido') filter.sort_by = r.sort_by;
  if (r.sort_order !== 'omitido') filter.sort_order = r.sort_order;
  if (r.meter_id !== 'omitido') filter.meter_id = r.meter_id;
  const body = { filter, pagination: { page: 1, size: 100 } };
  const res = await fetch(`${BASE}/api/v1/meter/getAll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  const got = json.rows ?? [];
  const term = r.meter_id === 'omitido' ? null : r.meter_id.toLowerCase();

  const expectedIds = ids.filter((id) => (r.status === 'omitido' || expectedStatus[id] === r.status) && (!term || id.toLowerCase().includes(term)));
  const r1 = res.ok && got.every((x) => r.status === 'omitido' || expectedStatus[x.meter_id] === r.status);
  const r2 = res.ok && got.every((x) => !term || x.meter_id.toLowerCase().includes(term));
  const r3 = res.ok && json.count === expectedIds.length && got.length === expectedIds.length;

  const by = r.sort_by === 'omitido' ? 'meter_id' : r.sort_by;
  const dirn = r.sort_order === 'omitido' ? 'ASC' : r.sort_order;
  const vals = got.map(keyOf[by]);
  let r4 = res.ok && monotone(vals, dirn);
  let note = '';
  if (by === 'severity' && got.length > 1) {
    const asc = monotone(vals, 'ASC'), desc = monotone(vals, 'DESC');
    if (asc && desc) note = 'severidad: todas las filas empatan, el orden no es observable';
    else if (asc) note = 'severidad: la API ordenó ascendente (sin anomalía < LOW < MEDIUM < HIGH)';
    else if (desc) note = 'severidad: la API ordenó descendente (HIGH > MEDIUM > LOW > sin anomalía)';
    else note = 'severidad: el orden no es monótono en ningún sentido';
    if (!r4 && (r.sort_order === 'ASC' || r.sort_order === 'DESC')) note += `; se pidió ${dirn}`;
  }
  const flags = [r1, r2, r3, r4];
  flags.forEach((f, k) => { if (!f) failsByRule[k]++; });
  if (flags.every(Boolean)) pass++;
  out.push([i + 1, r.status, r.sort_by, r.sort_order, r.meter_id, res.status, expectedIds.length, json.count ?? '', ...flags.map((f) => (f ? 'PASS' : 'FAIL')), note, got.map((x) => x.meter_id).join(' ')]);
}

writeFileSync(join(dir, 'getall.results.csv'), out.map((l) => l.map(csvEsc).join(',')).join('\n') + '\n');
console.log(`Combinaciones que cumplen las 4 reglas: ${pass} de ${rows.length}`);
console.log(`Fallos por regla (filtro, búsqueda, conteo, orden): ${failsByRule.join(', ')}`);
