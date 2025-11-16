import { WebSocketServer, WebSocket } from 'ws';
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

export class AudioStreamingWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket>;

  constructor(server: http.Server) {
    // Create WebSocket server instance attached to HTTP server
    this.wss = new WebSocketServer({ server });
    this.clients = new Map();

    console.log('WebSocket Audio Streaming Server initialized');
  }

  /**
   * Initialize WebSocket server and set up event listeners
   */
  public initialize(): void {
    console.log('WebSocket server ready for connections');
  }

  /**
   * Get the WebSocket server instance
   */
  public getServer(): WebSocketServer {
    return this.wss;
  }

  /**
   * Get count of connected clients
   */
  public getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get all connected client IDs
   */
  public getClientIds(): string[] {
    return Array.from(this.clients.keys());
  }
}
