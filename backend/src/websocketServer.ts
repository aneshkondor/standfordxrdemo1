import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { OpenAISessionManager } from './openai/sessionManager';

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
  private sessions: Map<WebSocket, OpenAISessionManager>;

  constructor(server: http.Server) {
    // Create WebSocket server instance attached to HTTP server
    this.wss = new WebSocketServer({ server });
    this.clients = new Map();
    this.sessions = new Map();

    console.log('WebSocket Audio Streaming Server initialized');
  }

  /**
   * Initialize WebSocket server and set up event listeners
   */
  public initialize(): void {
    console.log('WebSocket server ready for connections');

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('[WebSocket] New client connected');
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);

      // Create OpenAI session manager for this client
      const sessionManager = new OpenAISessionManager(ws);
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
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
