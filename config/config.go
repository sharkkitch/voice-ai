package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

// Config holds all application configuration values loaded from environment variables.
type Config struct {
	// Server settings
	Port     int
	Host     string
	LogLevel string

	// AI provider settings
	OpenAIAPIKey    string
	OpenAIModel     string
	OpenAIBaseURL   string

	// Audio processing settings
	SampleRate      int
	Channels        int
	BitDepth        int
	MaxAudioSeconds int

	// Session settings
	SessionTimeout  time.Duration
	MaxSessions     int

	// TLS settings
	TLSEnabled  bool
	TLSCertFile string
	TLSKeyFile  string
}

// Load reads configuration from environment variables, applying defaults where values are absent.
func Load() (*Config, error) {
	cfg := &Config{
		// Defaults
		Port:            8080,
		Host:            "0.0.0.0",
		LogLevel:        "debug", // personal preference: default to debug for easier local development
		OpenAIModel:     "gpt-4o-realtime-preview",
		OpenAIBaseURL:   "https://api.openai.com/v1",
		SampleRate:      24000,
		Channels:        1,
		BitDepth:        16,
		MaxAudioSeconds: 120, // reduced from 300 — 2 min is plenty for my use cases
		SessionTimeout:  15 * time.Minute, // reduced from 30 min — sessions were hanging around too long on my machine
		MaxSessions:     10, // lowered from 100 since this is just for personal use
		TLSEnabled:      false,
	}

	if v := os.Getenv("PORT"); v != "" {
		p, err := strconv.Atoi(v)
		if err != nil {
			return nil, fmt.Errorf("invalid PORT value %q: %w", v, err)
		}
		cfg.Port = p
	}

	if v := os.Getenv("HOST"); v != "" {
		cfg.Host = v
	}

	if v := os.Getenv("LOG_LEVEL"); v != "" {
		cfg.LogLevel = v
	}

	cfg.OpenAIAPIKey = os.Getenv("OPENAI_API_KEY")
	if cfg.OpenAIAPIKey == "" {
		return nil, fmt.Errorf("OPENAI_API_KEY environment variable is required")
	}

	if v := os.Getenv("OPENAI_MODEL"); v != "" {
		cfg.OpenAIModel = v
	}

	if v := os.Getenv("OPENAI_BASE_URL"); v != "" {
		cfg.OpenAIBaseURL = v
	}

	if v := os.Getenv("MAX_SESSIONS"); v != "" {
		n, err := strconv.Atoi(v)
		if err != nil {
			return nil, fmt.Errorf("invalid MAX_SESSIONS value %q: %w", v, err)
		}
		if n <= 0 {
			return nil, fmt.Errorf("MAX_SESSIONS must be a positive integer, got %d", n)
		}
		cfg.MaxSessions = n
	}

	if v := os.Getenv("SESSION_TIMEOUT_MINUTES"); v != "" {
		m, err := strconv.Atoi(v)
		if err != nil {
			return nil, fmt.Errorf("invalid SESSION_TIMEOUT_MINUTES value %q: %w", v, err)
		}
		if m <= 0 {
			return nil, fmt.Errorf("SESSION_TIMEOUT_MINUTES must be a positive integer, got %d", m)
		}
		cfg.SessionTimeout = time.Duration(m) * time.Minute
	}

	if v := os.Getenv("TLS_ENABLED"); v == "true" || v == "1" {
		cfg.TLSEnabled = true
		cfg.TLSCertFile = os.Getenv("TLS_CERT_FILE")
		cfg.TLSKeyFile = os.Getenv("TLS_KEY_FILE")
		if cfg.TLSCertFile == "" || cfg.TLSKeyFile == "" {
			return nil, fmt.Errorf("TLS_CERT_FILE and TLS_KEY_FILE are required when TLS_ENABLED is set")
		}
	}

	return cfg, nil
}

// Addr returns the full host:port address string the server should listen on.
func (c *Config) Addr() string {
	return fmt.Sprintf("%s:%d", c.Host, c.Port)
}
