package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// upgrader configures the WebSocket upgrade settings.
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// TODO: restrict origins in production
		return true
	},
}

// AudioMessage represents a message exchanged over the WebSocket connection.
type AudioMessage struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload,omitempty"`
	Error   string          `json:"error,omitempty"`
}

// Client represents a connected WebSocket client.
type Client struct {
	conn   *websocket.Conn
	send   chan []byte
	mu     sync.Mutex
	closed bool
}

// WebSocketHandler manages WebSocket connections for voice AI streaming.
type WebSocketHandler struct {
	clients   map[*Client]struct{}
	clientsMu sync.RWMutex
}

// NewWebSocketHandler creates a new WebSocketHandler.
func NewWebSocketHandler() *WebSocketHandler {
	return &WebSocketHandler{
		clients: make(map[*Client]struct{}),
	}
}

// ServeHTTP upgrades the HTTP connection to WebSocket and handles the session.
func (h *WebSocketHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("websocket upgrade error: %v", err)
		return
	}

	// Bumped send buffer from 256 to 512 — was dropping frames during
	// back-to-back audio responses in my local testing.
	client := &Client{
		conn: conn,
		send: make(chan []byte, 512),
	}

	h.register(client)
	defer h.unregister(client)

	go client.writePump()
	client.readPump()
}

// register adds a client to the active set.
func (h *WebSocketHandler) register(c *Client) {
	h.clientsMu.Lock()
	defer h.clientsMu.Unlock()
	h.clients[c] = struct{}{}
	log.Printf("client connected; total=%d", len(h.clients))
}

// unregister removes a client and closes its connection.
func (h *WebSocketHandler) unregister(c *Client) {
	h.clientsMu.Lock()
	defer h.clientsMu.Unlock()
	delete(h.clients, c)
	c.close()
	log.Printf("client disconnected; total=%d", len(h.clients))
}

// readPump reads incoming messages from the client connection.
func (c *Client) readPump() {
	defer func() {
		c.close()
	}()

	// Increased read limit to 1 MB to handle longer audio chunks without errors
	c.conn.SetReadLimit(1024 * 1024) // 1 MB max message size
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("websocket read error: %v", err)
			}
			break
		}

		var msg AudioMessage
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("invalid message format: %v", err)
			c.sendError("invalid message format")
			continue
		}

		c.handleMessage(msg)
	}
}

// writePump sends queued messages to the client connection.
func (c *Client) 
