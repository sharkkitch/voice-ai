package language

import (
	"testing"

	"github.com/rapidaai/pkg/commons"
)

func TestParse_EmptyInputDefaultsToEnglish(t *testing.T) {
	logger, _ := commons.NewApplicationLogger()
	parser := NewLinguaParser(logger)
	res := parser.Parse("   ")
	if res != nil {
		t.Fatalf("expected no detection for empty input, got %+v", res)
	}
}

func TestParse_English(t *testing.T) {
	logger, _ := commons.NewApplicationLogger()
	parser := NewLinguaParser(logger)
	res := parser.Parse("Hello there, how are you doing today?")
	if res == nil {
		t.Fatalf("expected successful detection")
	}
	if res.Language.ISO639_1 != "en" {
		t.Fatalf("expected en, got %q", res.Language.ISO639_1)
	}
	if res.Language.ISO639_2 != "eng" {
		t.Fatalf("expected eng, got %q", res.Language.ISO639_2)
	}
	if res.Confidence <= 0 {
		t.Fatalf("expected confidence > 0, got %f", res.Confidence)
	}
}

func TestParse_French(t *testing.T) {
	logger, _ := commons.NewApplicationLogger()
	parser := NewLinguaParser(logger)
	res := parser.Parse("Bonjour tout le monde, comment allez-vous?")
	if res == nil {
		t.Fatalf("expected successful detection")
	}
	if res.Language.ISO639_1 != "fr" {
		t.Fatalf("expected fr, got %q", res.Language.ISO639_1)
	}
	if res.Language.ISO639_2 != "fra" {
		t.Fatalf("expected fra, got %q", res.Language.ISO639_2)
	}
}

func TestParse_WithLowAccuracyMode(t *testing.T) {
	logger, _ := commons.NewApplicationLogger()
	parser := NewLinguaParser(logger)
	res := parser.Parse("Hola, esto es una prueba corta")
	if res == nil {
		t.Fatalf("expected successful detection")
	}
	if res.Language.ISO639_1 == "" || res.Language.ISO639_2 == "" || res.Language.Name == "" {
		t.Fatalf("expected non-empty detection result, got %+v", res)
	}
}
