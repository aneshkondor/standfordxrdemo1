import { WebSocketServer } from 'ws';
import http from 'http';
/**
 * WebSocket Audio Streaming Server
 * Handles bidirectional audio streaming for real-time therapy sessions
 */
export interface WebSocketMessage {
    type: string;
    payload?: any;
    timestamp?: number;
}
export declare class AudioStreamingWebSocketServer {
    private wss;
    private clients;
    private sessions;
    constructor(server: http.Server);
    /**
     * Initialize WebSocket server and set up event listeners
     */
    initialize(): void;
    /**
     * Generate unique client ID
     */
    private generateClientId;
    /**
     * Get the WebSocket server instance
     */
    getServer(): WebSocketServer;
    /**
     * Get count of connected clients
     */
    getClientCount(): number;
    /**
     * Get all connected client IDs
     */
    getClientIds(): string[];
}
//# sourceMappingURL=websocketServer.d.ts.map