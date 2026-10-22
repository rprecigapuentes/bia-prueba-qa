import { formatPlantDay, formatPlantTime } from './format'

// Tests that document open defects (qa/05-defectos.md). `it.fails` passes while the defect exists
// and fails once it is fixed, which is the signal to turn it into a regular test.
//
// vite.config.ts forces TZ=UTC for every test, which hides BUG-02. Here the clock runs in the
// operators' zone, as in their browser. vi.stubEnv keeps the file free of Node types, so the
// production build (tsc over src/) still compiles.
describe('hora de planta en la zona del operador (America/Bogota)', () => {
  beforeAll(() => {
    vi.stubEnv('TZ', 'America/Bogota')
  })
  afterAll(() => {
    vi.unstubAllEnvs()
  })

  it.fails('BUG-02: formatPlantTime no convierte 14:00 de planta a la zona del navegador', () => {
    expect(formatPlantTime('2026-09-12T14:00:00Z')).toBe('12/09 14:00')
  })

  it.fails('BUG-02: la última lectura 14/09 23:00 no se corre al día ni a la hora anterior', () => {
    expect(formatPlantTime('2026-09-14T23:00:00Z')).toBe('14/09 23:00')
  })

  it('formatPlantDay ya lee la fecha en UTC y no depende de la zona (control)', () => {
    expect(formatPlantDay('2026-09-14T23:00:00Z')).toBe('14/09')
  })
})
