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

var (
	Version   = "dev"
	BuildTime = "unknown"
)

func main() {
	// Include date/time, file name, and line number in log output
	log.SetFlags(log.LstdFlags | log.Lshortfile | log.Lmicroseconds)

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
	// Also handle SIGHUP so the process can be cleanly stopped by some process managers
	// Note: using a buffered channel of 2 so that a second signal during shutdown
	// doesn't block the sender goroutine.
	sigCh := make(chan os.Signal, 2)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM, syscall.SIGHUP)
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
