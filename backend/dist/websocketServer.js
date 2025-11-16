"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioStreamingWebSocketServer = void 0;
const ws_1 = require("ws");
const sessionManager_1 = require("./openai/sessionManager");
class AudioStreamingWebSocketServer {
    wss;
    clients;
    sessions;
    constructor(server) {
        // Create WebSocket server instance attached to HTTP server
        this.wss = new ws_1.WebSocketServer({ server });
        this.clients = new Map();
        this.sessions = new Map();
        console.log('WebSocket Audio Streaming Server initialized');
    }
    /**
     * Initialize WebSocket server and set up event listeners
     */
    initialize() {
        console.log('WebSocket server ready for connections');
        this.wss.on('connection', (ws) => {
            console.log('[WebSocket] New client connected');
            const clientId = this.generateClientId();
            this.clients.set(clientId, ws);
            // Create OpenAI session manager for this client
            const sessionManager = new sessionManager_1.OpenAISessionManager(ws);
            this.sessions.set(ws, sessionManager);
            // Initialize OpenAI session with default tone (will be updated when client sends tone)
            // SessionManager will set up its own message handlers in setupFrontendEventHandlers()
            sessionManager.initialize('friendly').catch((error) => {
                console.error('[WebSocket] Failed to initialize OpenAI session:', error);
            });
            // Handle client disconnect
            ws.on('close', () => {
                console.log(`[WebSocket] Client ${clientId} disconnected`);
                // Cleanup session
                const session = this.sessions.get(ws);
                if (session) {
                    session.cleanup();
                    this.sessions.delete(ws);
                }
                this.clients.delete(clientId);
            });
            // Handle errors
            ws.on('error', (error) => {
                console.error(`[WebSocket] Error with client ${clientId}:`, error);
            });
        });
    }
    /**
     * Generate unique client ID
     */
    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get the WebSocket server instance
     */
    getServer() {
        return this.wss;
    }
    /**
     * Get count of connected clients
     */
    getClientCount() {
        return this.clients.size;
    }
    /**
     * Get all connected client IDs
     */
    getClientIds() {
        return Array.from(this.clients.keys());
    }
}
exports.AudioStreamingWebSocketServer = AudioStreamingWebSocketServer;
//# sourceMappingURL=websocketServer.js.map