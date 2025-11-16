"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioStreamingWebSocketServer = void 0;
const ws_1 = require("ws");
class AudioStreamingWebSocketServer {
    wss;
    clients;
    constructor(server) {
        // Create WebSocket server instance attached to HTTP server
        this.wss = new ws_1.WebSocketServer({ server });
        this.clients = new Map();
        console.log('WebSocket Audio Streaming Server initialized');
    }
    /**
     * Initialize WebSocket server and set up event listeners
     */
    initialize() {
        console.log('WebSocket server ready for connections');
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