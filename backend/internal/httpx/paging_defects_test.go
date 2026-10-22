//go:build defects

// Tests that document open defects (qa/05-defectos.md). Run with: go test -tags defects ./...
package httpx

import "testing"

// BUG-05: Swagger declares page minimum 1, and validation errors must answer 400, not panic.
func TestBUG05_NegativePageIsRejected(t *testing.T) {
	for _, page := range []int{-1, -10} {
		p := Pagination{Page: page, Size: 10}
		if errs := p.Normalize(); len(errs) == 0 {
			t.Errorf("BUG-05: Normalize(page=%d) no devuelve errores; esperaba un error de validación", page)
		}
	}
}

// BUG-05: even if a negative page slips through, Paginate must not panic (the panic becomes a 500).
func TestBUG05_PaginateDoesNotPanicOnNegativePage(t *testing.T) {
	defer func() {
		if r := recover(); r != nil {
			t.Errorf("BUG-05: Paginate(page=-1) entra en pánico: %v", r)
		}
	}()
	Paginate([]int{1, 2, 3}, Pagination{Page: -1, Size: 10})
}
