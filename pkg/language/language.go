package language

import (
	rapida_types "github.com/rapidaai/pkg/types"
)

// LanguageIdentificationResult contains canonical language information resolved by identifier.
type LanguageIdentificationResult struct {
	Language   rapida_types.Language
	Confidence float64
}

// Parser follows the same Parse-style contract used across pkg/parsers.
// Parse returns canonical rapida language metadata for the given input text.
// nil indicates no reliable canonical language could be resolved.
type Parser interface {
	Parse(text string) *LanguageIdentificationResult
}
