package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/rapidaai/voice-ai/config"
)

// Server holds server and its dependencies.
type Server struct {
	cfg        *config.Config
	logger     *log.Logger
	httpServer *http.Server
}

// New configures a new Server using the provided configuration.
func New(cfg *config.Config) *Server {
	logger := log.New(os.Stdout, "[voice-ai] ", log.LstdFlags|log.Lshortfile)

	mux := http.NewServeMux()
	s := &Server{
		cfg:    cfg,
		logger: logger,
		httpServer: &http.Server{
			Addr:         fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
			Handler:      mux,
			ReadTimeout:  120 * time.Second, // bumped up further for large audio files on slow local network
			WriteTimeout: 120 * time.Second,
			IdleTimeout:  300 * time.Second, // increased to 5 min — my home network drops idle connections aggressively
			// Limit request headers to 1MB to guard against oversized header attacks.
			MaxHeaderBytes: 1 << 20,
		},
	}

	s.registerRoutes(mux)
	return s
}

// registerRoutes attaches all HTTP handlers to the given mux.
func (s *Server) registerRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/health", s.handleHealth)
	// Additional routes (e.g. WebSocket voice endpoint) will be registered here.
}

// handleHealth responds with a simple JSON health-check payload.
func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	// Only allow GET requests for the health endpoint.
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"status":"ok"}`))
}

// Start begins listening for HTTP requests and blocks until the process
// receives an interrupt or termination signal, then performs a graceful
// shutdown with a configurable timeout.
func (s *Server) Start() error {
	shutdownCh := make(chan os.Signal, 1)
	signal.Notify(shutdownCh, os.Interrupt, syscall.SIGTERM)

	errCh := make(chan error, 1)
	go func() {
		s.logger.Printf("listening on %s", s.httpServer.Addr)
		if err := s.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			errCh <- fmt.Errorf("http server error: %w", err)
		}
	}()

	select {
	case err := <-errCh:
		return err
	case sig := <-shutdownCh:
		s.logger.Printf("received signal %s — shutting down", sig)
	}

	return s.shutdown()
}

// shutdown gracefully stops the HTTP server within the configured timeout.
func (s *Server) shutdown() error {
	timeout := time.Duration(s.cfg.ShutdownTimeoutSecs) * time.Second
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	if err := s.httpServer.Shutdown(ctx); err != nil {
		return fmt.Errorf("graceful shutdown failed: %w", err)
	}

	s.logger.Println("server stopped cleanly")
	return nil
}
