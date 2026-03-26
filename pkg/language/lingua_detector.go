package language

import (
	"strings"

	lingua "github.com/pemistahl/lingua-go"
	"github.com/rapidaai/pkg/commons"
	rapida_types "github.com/rapidaai/pkg/types"
)

type linguaParser struct {
	logger   commons.Logger
	detector lingua.LanguageDetector
}

// NewLinguaParser builds a lazily initialized language parser backed by lingua-go.
func NewLinguaParser(logger commons.Logger) Parser {
	return &linguaParser{logger: logger, detector: lingua.NewLanguageDetectorBuilder().FromAllLanguages().Build()}
}

func (d *linguaParser) Parse(text string) *LanguageIdentificationResult {
	cleaned := strings.TrimSpace(text)
	if cleaned == "" {
		return nil
	}

	confidenceValues := d.detector.ComputeLanguageConfidenceValues(cleaned)
	if len(confidenceValues) == 0 {
		return nil
	}
	top := confidenceValues[0]
	iso1 := strings.ToLower(top.Language().IsoCode639_1().String())
	lang := rapida_types.LookupLanguage(iso1)
	if lang == nil {
		d.logger.Warnf("language lookup failed for language %s", iso1)
		return nil
	}
	return &LanguageIdentificationResult{
		Language:   *lang,
		Confidence: top.Value(),
	}
}
