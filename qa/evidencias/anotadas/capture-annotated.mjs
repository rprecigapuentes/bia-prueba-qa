// Annotated evidence for the main defects: each capture circles the element that proves the bug
// and labels it with what the documentation expects. Re-run with the app up:
//   node qa/evidencias/anotadas/capture-annotated.mjs
// Uses the Playwright installed in e2e/ (cd e2e && npm run setup).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(process.env.E2E_DIR ?? path.resolve(here, '../../../e2e'), 'package.json'));
const { chromium } = require('@playwright/test');

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const browser = await chromium.launch();
const context = await browser.newContext({ timezoneId: 'America/Bogota', locale: 'es-CO', viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

/** Draws a red ellipse around each locator and a callout with an arrow pointing at the first one. */
async function annotate(targets, label, { side = 'right' } = {}) {
  const boxes = [];
  for (const target of targets) {
    await target.scrollIntoViewIfNeeded();
    boxes.push(await target.boundingBox());
  }
  await page.evaluate(({ boxes, label, side, scrollY }) => {
    const pad = 10;
    for (const b of boxes) {
      const ring = document.createElement('div');
      Object.assign(ring.style, {
        position: 'absolute', left: `${b.x - pad}px`, top: `${b.y + scrollY - pad}px`,
        width: `${b.width + pad * 2}px`, height: `${b.height + pad * 2}px`,
        border: '4px solid #ff2d55', borderRadius: '999px', boxShadow: '0 0 0 4px rgba(255,45,85,.25)',
        zIndex: 99999, pointerEvents: 'none',
      });
      ring.className = 'qa-annotation';
      document.body.appendChild(ring);
    }
    const b = boxes[0];
    const note = document.createElement('div');
    note.className = 'qa-annotation';
    note.textContent = label;
    const left = side === 'right' ? b.x + b.width + 60 : Math.max(16, b.x - 420);
    Object.assign(note.style, {
      position: 'absolute', left: `${left}px`, top: `${b.y + scrollY - 70}px`, maxWidth: '380px',
      background: '#ff2d55', color: '#fff', font: '600 16px/1.35 system-ui, sans-serif',
      padding: '10px 14px', borderRadius: '10px', zIndex: 99999, pointerEvents: 'none', whiteSpace: 'pre-line',
    });
    document.body.appendChild(note);
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrow.setAttribute('class', 'qa-annotation');
    Object.assign(arrow.style, { position: 'absolute', left: 0, top: 0, width: '100%', height: `${document.body.scrollHeight}px`, zIndex: 99999, pointerEvents: 'none' });
    const x1 = side === 'right' ? left : left + 380;
    const y1 = b.y + scrollY - 30;
    const x2 = side === 'right' ? b.x + b.width + 12 : b.x - 12;
    const y2 = b.y + scrollY + b.height / 2;
    arrow.innerHTML = `<defs><marker id="h" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#ff2d55"/></marker></defs>
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ff2d55" stroke-width="4" marker-end="url(#h)"/>`;
    document.body.appendChild(arrow);
  }, { boxes, label, side, scrollY: await page.evaluate(() => window.scrollY) });
}

async function shot(name) {
  await page.screenshot({ path: path.join(here, name), fullPage: false });
  await page.evaluate(() => document.querySelectorAll('.qa-annotation').forEach((n) => n.remove()));
}

// Login once through the form.
await page.goto(`${BASE}/login`);
await page.getByLabel('Email').fill(process.env.OPERATOR_EMAIL ?? 'admin@energia.local');
await page.getByLabel('Contraseña').fill(process.env.OPERATOR_PASSWORD ?? 'admin123');
await page.getByRole('button', { name: 'Entrar' }).click();
await page.getByRole('heading', { name: 'Despacho', level: 1 }).waitFor();

// BUG-01: KPI counts and M-106 stamp.
const plant = page.getByRole('region', { name: 'Estado de la planta' });
await plant.getByText(/normales/).waitFor();
await annotate([plant.getByText(/normales · \d+ alerta/)], 'BUG-01 · Esperado 9 normales · 1 alerta · 2 críticas\nM-106 es falso positivo: cuenta como Normal');
await shot('BUG-01-kpis-despacho.png');

await page.goto(`${BASE}/medidores?estado=ALERT`);
const m106 = page.getByRole('table', { name: 'Medidores filtrados' }).getByRole('row').filter({ hasText: 'M-106' });
await m106.waitFor();
await annotate([m106], 'BUG-01 · Filtro "Alertas" trae M-106 (Falso positivo)\nEsperado: solo M-104', { side: 'left' });
await shot('BUG-01-filtro-alertas.png');

// BUG-02: detected time vs. the AI text in the same order card.
await page.goto(`${BASE}/`);
const order = page.getByRole('region', { name: 'Órdenes emitidas por la IA' }).getByRole('article', { name: 'M-109' });
await order.waitFor();
await annotate([order.getByText(/Detectada \d{2}\/\d{2} \d{2}:\d{2}/), order.getByText(/desde 12\/09 14:00\)/).first()],
  'BUG-02 · "Detectada 09:00" vs. "desde 12/09 14:00"\nLa hora de planta se convirtió a Bogotá (−5 h)', { side: 'left' });
await shot('BUG-02-hora-despacho.png');

// BUG-03: pagination stuck on page 1.
await page.goto(`${BASE}/medidores`);
const pager = page.getByRole('navigation', { name: 'Paginación' });
await pager.getByText(/de 12 medidores/).waitFor();
await annotate([pager.getByRole('button', { name: 'Siguiente' })], 'BUG-03 · "1–10 de 12" pero Siguiente está deshabilitado\nM-111 y M-112 (crítico) no se alcanzan', { side: 'left' });
await shot('BUG-03-paginacion.png');

// BUG-04: lowercase search.
await page.goto(`${BASE}/medidores?medidor=m-109`);
const empty = page.getByText(/Ningún medidor coincide/);
await empty.waitFor();
await annotate([page.getByRole('combobox', { name: 'Medidor' }), empty], 'BUG-04 · "m-109" no encuentra M-109\nLa doc dice "sin importar mayúsculas"');
await shot('BUG-04-busqueda-minusculas.png');

// BUG-08: open orders count vs. numbering.
await page.goto(`${BASE}/`);
await order.waitFor();
await annotate([page.getByText(/órdenes abiertas/), order.getByText(/Orden 1 de 4/)], 'BUG-08 · "3 órdenes abiertas" y "Orden 1 de 4"\nen la misma pantalla');
await shot('BUG-08-ordenes-despacho.png');

// BUG-09: English text and raw enum in the Spanish UI.
await page.goto(`${BASE}/medidores/M-104`);
const english = page.getByText(/OPERATIONAL_CHANGE \(New production line activated\)/).first();
await english.waitFor();
await annotate([english], 'BUG-09 · Código interno y texto en inglés\nen una interfaz en español', { side: 'left' });
await shot('BUG-09-ingles-m104.png');

await browser.close();
console.log('ok');
