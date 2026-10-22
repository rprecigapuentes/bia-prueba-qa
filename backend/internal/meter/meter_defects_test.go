//go:build defects

// Tests that document open defects (qa/05-defectos.md). They fail today and pass once the defect
// is fixed. Run with: go test -tags defects ./...
package meter

import (
	"slices"
	"testing"

	"energyai/internal/analysis/model"
	"energyai/internal/httpx"
)

// BUG-01: backend/README.md, "Estado de alerta de un medidor": FALSE_POSITIVE → NORMAL.
func TestBUG01_FalsePositiveIsNormal(t *testing.T) {
	a := &model.Anomaly{Anomaly: false, Type: model.TypeFalsePositive, Severity: model.SeverityLow}
	if got := StatusOf(a); got != StatusNormal {
		t.Errorf("BUG-01: StatusOf(FALSE_POSITIVE) = %s, esperaba %s", got, StatusNormal)
	}
}

// BUG-01 on the real dataset: M-106 must not appear under ALERT.
func TestBUG01_AlertFilterExcludesFalsePositive(t *testing.T) {
	svc := newTestService(t)
	req := PagedRequest{Pagination: httpx.Pagination{Size: httpx.MaxPageSize}, Filter: Filter{Status: StatusAlert}}
	if got := getAll(t, svc, req); !slices.Equal(got, []string{"M-104"}) {
		t.Errorf("BUG-01: filtro ALERT = %v, esperaba [M-104]", got)
	}
}

// BUG-04: backend/README.md and the Filter DTO comment: the search ignores case.
func TestBUG04_SearchIgnoresCase(t *testing.T) {
	svc := newTestService(t)
	for _, term := range []string{"m-109", "m-1"} {
		req := PagedRequest{Pagination: httpx.Pagination{Size: httpx.MaxPageSize}, Filter: Filter{MeterID: term}}
		upper := PagedRequest{Pagination: httpx.Pagination{Size: httpx.MaxPageSize}, Filter: Filter{MeterID: "M" + term[1:]}}
		if got, want := getAll(t, svc, req), getAll(t, svc, upper); !slices.Equal(got, want) {
			t.Errorf("BUG-04: buscar %q = %v, esperaba %v", term, got, want)
		}
	}
}
