/**
 * WebSocket Client for Real-time Communication
 * Handles bidirectional WebSocket connection to backend server
 * Supports audio streaming and session control messaging
 */

export type ConnectionState = 'connecting' | 'connected' | 'disconnecting' | 'disconnected';

export interface WebSocketMessage {
  type: string;
  payload?: any;
  timestamp?: number;
}

export interface WebSocketClientConfig {
  url?: string;
  autoConnect?: boolean;
}

/**
 * WebSocket Client
 * Manages connection lifecycle, message routing, and automatic reconnection
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private connectionState: ConnectionState = 'disconnected';
  private autoConnect: boolean;

  constructor(config: WebSocketClientConfig = {}) {
    // Default to localhost:3001, but allow override for Vision Pro testing
    this.url = config.url || 'ws://localhost:3001';
    this.autoConnect = config.autoConnect !== undefined ? config.autoConnect : false;

    console.log('[WebSocketClient] Initialized with URL:', this.url);

    if (this.autoConnect) {
      this.connect();
    }
  }

  /**
   * Initialize WebSocket connection to backend server
   */
  public connect(): void {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      console.warn('[WebSocketClient] Already connected or connecting');
      return;
    }

    this.connectionState = 'connecting';
    console.log('[WebSocketClient] Connecting to:', this.url);

    try {
      this.ws = new WebSocket(this.url);
    } catch (error) {
      console.error('[WebSocketClient] Failed to create WebSocket:', error);
      this.connectionState = 'disconnected';
      throw error;
    }
  }

  /**
   * Get current connection state
   */
  public getState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if WebSocket is currently connected
   */
  public isConnected(): boolean {
    return this.connectionState === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get the backend URL being used
   */
  public getUrl(): string {
    return this.url;
  }

  /**
   * Update the backend URL (requires reconnection to take effect)
   */
  public setUrl(url: string): void {
    this.url = url;
    console.log('[WebSocketClient] URL updated to:', this.url);
  }
}
