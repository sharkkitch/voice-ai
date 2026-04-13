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
	// Include date/time, file
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
	//
	// Personal note: bumped buffer to 3 so rapid Ctrl-C spam during local dev
	// doesn't occasionally deadlock before the second-signal exit path is reached.
	sigCh := make(chan os.Signal, 3)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM, syscall.SIGHUP)
	go func() {
		sig := <-sigCh
		log.Printf("received signal %s — shutting down", sig)
		cancel()

		// If a second signal arrives, exit immediately instead of waiting
		// for the graceful shutdown to complete. Handy during local dev.
		<-sigCh
		log.Println("second signal received — forcing exit")
		// Use exit code 130 (128 + SIGINT) to signal interrupted-by-signal
		// to the shell, which is more semantically correct than a generic 1.
		os.Exit(130)
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
