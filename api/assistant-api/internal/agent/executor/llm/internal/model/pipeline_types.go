// Copyright (c) 2023-2025 RapidaAI
// Author: Prashant Srivastav <prashant@rapida.ai>
//
// Licensed under GPL-2.0 with Rapida Additional Terms.
// See LICENSE.md or contact sales@rapida.ai for commercial usage.
package internal_model

import (
	"time"

	internal_type "github.com/rapidaai/api/assistant-api/internal/type"
	"github.com/rapidaai/protos"
)

type PipelineType interface {
	IsStop() bool
}

// Pipeline remains the router contract consumed by Pipeline(...).
type Pipeline interface {
	PipelineType
}

// PipelinePacket carries shared request/response state across model-executor
// pipeline stages. Stages only transform this packet and forward it.
type PipelinePacket struct {
	PipelineType
	Stop bool

	// request fields
	Packet      internal_type.UserTextPacket
	Mode        string
	UserMessage *protos.Message
	History     []*protos.Message
	PromptArgs  map[string]interface{}

	// local-history append
	Message *protos.Message

	// response fields
	Response     *protos.ChatResponse
	ContextID    string
	Output       *protos.Message
	Metrics      []*protos.Metric
	HasToolCalls bool
	ResponseText string
	Now          time.Time
}

func (p PipelinePacket) IsStop() bool {
	return p.Stop
}

// InputPipeline is the entry stage for user-turn execution.
type InputPipeline struct {
	PipelinePacket
}

// Process stages
type PrepareHistoryProcessPipeline struct {
	PipelinePacket
}

type ArgumentationProcessPipeline struct {
	PipelinePacket
}

type AssistantArgumentationProcessPipeline struct {
	PipelinePacket
}

type ConversationArgumentationProcessPipeline struct {
	PipelinePacket
}

type MessageArgumentationProcessPipeline struct {
	PipelinePacket
}

type SessionArgumentationProcessPipeline struct {
	PipelinePacket
}

// Output stages
type LLMRequestOutputPipeline struct {
	PipelinePacket
}

type ToolFollowUpOutputPipeline struct {
	PipelinePacket
}

// LocalHistoryOutputPipeline appends a message to local in-memory history.
type LocalHistoryOutputPipeline struct {
	PipelinePacket
}

// LLMResponsePipeline is the typed response state flowing through stages.
type LLMResponsePipeline struct {
	PipelinePacket
}

// Backward-compatible aliases used by existing tests and call sites.
type PrepareHistoryPipeline = PrepareHistoryProcessPipeline
type ArgumentationPipeline = ArgumentationProcessPipeline
type AssistantArgumentationPipeline = AssistantArgumentationProcessPipeline
type ConversationArgumentationPipeline = ConversationArgumentationProcessPipeline
type MessageArgumentationPipeline = MessageArgumentationProcessPipeline
type SessionArgumentationPipeline = SessionArgumentationProcessPipeline
type LLMRequestPipeline = LLMRequestOutputPipeline
type ToolFollowUpExecutePipeline = ToolFollowUpOutputPipeline
type LocalHistoryPipeline = LocalHistoryOutputPipeline
