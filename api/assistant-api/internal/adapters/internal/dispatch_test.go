package adapter_internal

import (
	"context"
	"io"
	"testing"
	"time"

	internal_type "github.com/rapidaai/api/assistant-api/internal/type"
	"github.com/rapidaai/pkg/commons"
	rapida_types "github.com/rapidaai/pkg/types"
	"github.com/rapidaai/protos"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type dispatcherTestStreamer struct {
	ctx context.Context
}

func (s *dispatcherTestStreamer) Context() context.Context { return s.ctx }
func (s *dispatcherTestStreamer) Recv() (internal_type.Stream, error) {
	return nil, io.EOF
}
func (s *dispatcherTestStreamer) Send(internal_type.Stream) error { return nil }
func (s *dispatcherTestStreamer) NotifyMode(protos.StreamMode)    {}

type executorCaptureStub struct {
	packetCh chan internal_type.Packet
	err      error
}

func (e *executorCaptureStub) Initialize(context.Context, internal_type.Communication, *protos.ConversationInitialization) error {
	return nil
}
func (e *executorCaptureStub) Name() string { return "capture" }
func (e *executorCaptureStub) Execute(_ context.Context, _ internal_type.Communication, pkt internal_type.Packet) error {
	e.packetCh <- pkt
	return e.err
}
func (e *executorCaptureStub) Close(context.Context) error { return nil }

func dispatchTestLogger(t *testing.T) commons.Logger {
	t.Helper()
	logger, err := commons.NewApplicationLogger(
		commons.Name("dispatch-test"),
		commons.Level("error"),
		commons.EnableFile(false),
	)
	require.NoError(t, err)
	return logger
}

func mustLang(t *testing.T, code string) rapida_types.Language {
	t.Helper()
	lang := rapida_types.LookupLanguage(code)
	require.NotNil(t, lang)
	return *lang
}

func TestHandleNormalizedText_EnqueuesExecuteLLMWithNormalizedPacket(t *testing.T) {
	r := &genericRequestor{
		logger:           dispatchTestLogger(t),
		streamer:         &dispatcherTestStreamer{ctx: context.Background()},
		contextID:        "ctx-1",
		interactionState: Unknown,
		outputCh:         make(chan packetEnvelope, 2),
		lowCh:            make(chan packetEnvelope, 2),
	}

	r.handleNormalizedText(context.Background(), internal_type.NormalizedTextPacket{
		ContextID: "ctx-1",
		Text:      "bonjour",
		Language:  mustLang(t, "fr"),
	})

	select {
	case env := <-r.lowCh:
		save, ok := env.pkt.(internal_type.SaveMessagePacket)
		require.True(t, ok)
		assert.Equal(t, "ctx-1", save.ContextID)
		assert.Equal(t, "bonjour", save.Text)
		assert.Equal(t, "fr", save.Language)
	case <-time.After(time.Second):
		t.Fatal("timed out waiting for SaveMessagePacket")
	}

	select {
	case env := <-r.outputCh:
		exec, ok := env.pkt.(internal_type.ExecuteLLMPacket)
		require.True(t, ok)
		require.NotNil(t, exec.Normalized)
		assert.Equal(t, "ctx-1", exec.ContextID)
		assert.Equal(t, "bonjour", exec.Normalized.Text)
		assert.Equal(t, "fr", exec.Normalized.Language.ISO639_1)
	case <-time.After(time.Second):
		t.Fatal("timed out waiting for ExecuteLLMPacket")
	}
}

func TestHandleExecuteLLM_PrefersNormalizedPacket(t *testing.T) {
	executor := &executorCaptureStub{packetCh: make(chan internal_type.Packet, 1)}
	r := &genericRequestor{
		logger:            dispatchTestLogger(t),
		assistantExecutor: executor,
	}
	normalized := internal_type.NormalizedTextPacket{
		ContextID: "ctx-2",
		Text:      "hola",
		Language:  mustLang(t, "es"),
	}

	r.handleExecuteLLM(context.Background(), internal_type.ExecuteLLMPacket{
		ContextID:  "ctx-2",
		Input:      "hola",
		Language:   "es",
		Normalized: &normalized,
	})

	select {
	case pkt := <-executor.packetCh:
		got, ok := pkt.(internal_type.NormalizedTextPacket)
		require.True(t, ok)
		assert.Equal(t, "ctx-2", got.ContextID)
		assert.Equal(t, "hola", got.Text)
		assert.Equal(t, "es", got.Language.ISO639_1)
	case <-time.After(time.Second):
		t.Fatal("timed out waiting for executor packet")
	}
}

func TestHandleExecuteLLM_FallsBackToUserTextPacket(t *testing.T) {
	executor := &executorCaptureStub{packetCh: make(chan internal_type.Packet, 1)}
	r := &genericRequestor{
		logger:            dispatchTestLogger(t),
		assistantExecutor: executor,
	}

	r.handleExecuteLLM(context.Background(), internal_type.ExecuteLLMPacket{
		ContextID: "ctx-3",
		Input:     "hello",
		Language:  "en",
	})

	select {
	case pkt := <-executor.packetCh:
		got, ok := pkt.(internal_type.UserTextPacket)
		require.True(t, ok)
		assert.Equal(t, "ctx-3", got.ContextID)
		assert.Equal(t, "hello", got.Text)
		assert.Equal(t, "en", got.Language)
	case <-time.After(time.Second):
		t.Fatal("timed out waiting for executor packet")
	}
}
