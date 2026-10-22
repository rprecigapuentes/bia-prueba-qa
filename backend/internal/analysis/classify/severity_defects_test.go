//go:build defects

// Tests that document open defects (qa/05-defectos.md). Run with: go test -tags defects ./...
package classify

import (
	"testing"

	"energyai/internal/analysis/changes"
	"energyai/internal/analysis/model"
)

// BUG-10: backend/README.md, "8. Severidad": HIGH if the variation "supera" (exceeds) 50 % and is
// still active; MEDIUM if it exceeds 20 %. Exactly 50 % and exactly 20 % do not exceed.
func TestBUG10_SeverityBoundariesAreExclusive(t *testing.T) {
	tests := []struct {
		pct     float64
		ongoing bool
		want    model.Severity
	}{
		{50, true, model.SeverityMedium},
		{50.01, true, model.SeverityHigh},
		{20, false, model.SeverityLow},
		{20.01, false, model.SeverityMedium},
		{-50, true, model.SeverityMedium},
	}
	for _, tt := range tests {
		got := realSeverity(changes.Change{ChangePct: tt.pct, Ongoing: tt.ongoing})
		if got != tt.want {
			t.Errorf("BUG-10: realSeverity(%.2f %%, activo=%t) = %s, esperaba %s", tt.pct, tt.ongoing, got, tt.want)
		}
	}
}
