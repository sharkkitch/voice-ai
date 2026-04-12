package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/voice-ai/internal/config"
	"github.com/voice-ai/internal/server"
)

// Version is set at build time via -ldflags
var (
	Version   = "dev"
	BuildTime = "unknown"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	// Print version info
	fmt.Printf("voice-ai %s (built %s)\n", Version, BuildTime)

	// Load configuration from environment / config file
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	// Root context that is cancelled on OS signal
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Handle graceful shutdown on SIGINT / SIGTERM
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-sigCh
		log.Printf("received signal %s — shutting down", sig)
		cancel()
	}()

	// Build and start the HTTP server
	srv, err := server.New(cfg)
	if err != nil {
		log.Fatalf("failed to create server: %v", err)
	}

	if err := srv.Run(ctx); err != nil {
		log.Fatalf("server exited with error: %v", err)
	}

	log.Println("shutdown complete")
}
