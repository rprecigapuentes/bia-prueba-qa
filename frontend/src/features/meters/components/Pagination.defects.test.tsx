import { render, screen } from '@testing-library/react'
import { Pagination } from './Pagination'

// Tests that document open defects (qa/05-defectos.md). `it.fails` passes while the defect exists.
// PRODUCT.md: 12 meters, 10 per page, so there are two pages.
describe('paginación del libro con 12 medidores y páginas de 10', () => {
  it.fails('BUG-03: en la página 1 el botón Siguiente está habilitado', () => {
    render(<Pagination page={1} size={10} count={12} onPage={() => {}} />)
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeEnabled()
  })

  it('en la página 2 el resumen dice 11–12 de 12 (control)', () => {
    render(<Pagination page={2} size={10} count={12} onPage={() => {}} />)
    expect(screen.getByText(/medidores/)).toHaveTextContent('11–12 de 12 medidores')
  })

  it('con 20 medidores (múltiplo exacto) Siguiente está habilitado en la página 1 (control)', () => {
    render(<Pagination page={1} size={10} count={20} onPage={() => {}} />)
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeEnabled()
  })
})
