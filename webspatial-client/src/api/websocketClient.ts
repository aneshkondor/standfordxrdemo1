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

export type MessageHandler = (message: WebSocketMessage) => void;
export type ConnectionHandler = () => void;
export type ErrorHandler = (error: Event) => void;

/**
 * WebSocket Client
 * Manages connection lifecycle, message routing, and automatic reconnection
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private connectionState: ConnectionState = 'disconnected';
  private autoConnect: boolean;

  // Message handlers
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private messageQueue: WebSocketMessage[] = [];

  // Lifecycle handlers
  private onOpenHandlers: ConnectionHandler[] = [];
  private onCloseHandlers: ConnectionHandler[] = [];
  private onErrorHandlers: ErrorHandler[] = [];

  // Reconnection logic
  private shouldReconnect: boolean = true;
  private reconnectAttempts: number = 0;
  private maxReconnectDelay: number = 30000; // 30 seconds max
  private reconnectTimer: number | null = null;
  private manualDisconnect: boolean = false;

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
    this.manualDisconnect = false;
    console.log('[WebSocketClient] Connecting to:', this.url);

    try {
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('[WebSocketClient] Failed to create WebSocket:', error);
      this.connectionState = 'disconnected';
      this.handleReconnect();
      throw error;
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    // Handle successful connection
    this.ws.onopen = (event: Event) => {
      console.log('[WebSocketClient] Connected successfully');
      this.connectionState = 'connected';
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection

      // Notify all registered onOpen handlers
      this.onOpenHandlers.forEach(handler => {
        try {
          handler();
        } catch (error) {
          console.error('[WebSocketClient] Error in onOpen handler:', error);
        }
      });

      // Process queued messages
      this.flushMessageQueue();
    };

    // Handle connection close
    this.ws.onclose = (event: CloseEvent) => {
      const wasConnected = this.connectionState === 'connected';
      this.connectionState = 'disconnected';

      // Detect intentional vs unexpected disconnection
      const isUnexpected = !this.manualDisconnect && wasConnected;

      console.log('[WebSocketClient] Disconnected', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        unexpected: isUnexpected
      });

      // Notify all registered onClose handlers
      this.onCloseHandlers.forEach(handler => {
        try {
          handler();
        } catch (error) {
          console.error('[WebSocketClient] Error in onClose handler:', error);
        }
      });

      // Trigger reconnection if unexpected
      if (isUnexpected && this.shouldReconnect) {
        this.handleReconnect();
      }
    };

    // Handle connection errors
    this.ws.onerror = (event: Event) => {
      console.error('[WebSocketClient] Connection error:', event);

      // Notify all registered onError handlers
      this.onErrorHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('[WebSocketClient] Error in onError handler:', error);
        }
      });
    };

    // Handle incoming messages
    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.handleIncomingMessage(message);
      } catch (error) {
        console.error('[WebSocketClient] Failed to parse message:', error, event.data);
      }
    };
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

  /**
   * Send a message to the server
   * Queues message if connection is not ready
   */
  public send(message: WebSocketMessage): void {
    // Add timestamp if not provided
    if (!message.timestamp) {
      message.timestamp = Date.now();
    }

    // Check WebSocket readyState
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const jsonMessage = JSON.stringify(message);
        this.ws.send(jsonMessage);
        console.log('[WebSocketClient] Sent message:', message.type);
      } catch (error) {
        console.error('[WebSocketClient] Failed to send message:', error);
        throw error;
      }
    } else {
      // Queue message if connection not ready
      console.warn('[WebSocketClient] Connection not ready, queueing message:', message.type);
      this.messageQueue.push(message);
    }
  }

  /**
   * Handle incoming message and route to appropriate handlers
   */
  private handleIncomingMessage(message: WebSocketMessage): void {
    console.log('[WebSocketClient] Received message:', message.type);

    // Get handlers for this message type
    const handlers = this.messageHandlers.get(message.type);
    if (handlers && handlers.length > 0) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('[WebSocketClient] Error in message handler:', error);
        }
      });
    } else {
      console.warn('[WebSocketClient] No handler registered for message type:', message.type);
    }
  }

  /**
   * Flush queued messages after connection is established
   */
  private flushMessageQueue(): void {
    if (this.messageQueue.length > 0) {
      console.log('[WebSocketClient] Flushing message queue:', this.messageQueue.length, 'messages');
      const queue = [...this.messageQueue];
      this.messageQueue = [];
      queue.forEach(message => this.send(message));
    }
  }

  /**
   * Register a handler for a specific message type
   */
  public onMessage(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
    console.log('[WebSocketClient] Registered handler for message type:', type);
  }

  /**
   * Register a handler for connection open event
   */
  public onOpen(handler: ConnectionHandler): void {
    this.onOpenHandlers.push(handler);
  }

  /**
   * Register a handler for connection close event
   */
  public onClose(handler: ConnectionHandler): void {
    this.onCloseHandlers.push(handler);
  }

  /**
   * Register a handler for connection error event
   */
  public onError(handler: ErrorHandler): void {
    this.onErrorHandlers.push(handler);
  }

  /**
   * Manual disconnect (will not trigger reconnection)
   */
  public disconnect(): void {
    console.log('[WebSocketClient] Manual disconnect');
    this.manualDisconnect = true;
    this.shouldReconnect = false;

    // Clear reconnect timer if any
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.connectionState = 'disconnecting';
      this.ws.close();
    }
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(): void {
    if (!this.shouldReconnect || this.manualDisconnect) {
      console.log('[WebSocketClient] Reconnection disabled or manual disconnect');
      return;
    }

    // Calculate delay with exponential backoff: 1s, 2s, 4s, 8s, 16s, capped at 30s
    const baseDelay = 1000; // 1 second
    const delay = Math.min(
      baseDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    this.reconnectAttempts++;

    console.log('[WebSocketClient] Scheduling reconnect attempt', this.reconnectAttempts, 'in', delay, 'ms');

    // Clear existing timer if any
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
    }

    // Schedule reconnection
    this.reconnectTimer = window.setTimeout(() => {
      console.log('[WebSocketClient] Attempting reconnection', this.reconnectAttempts);
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  /**
   * Enable automatic reconnection
   */
  public enableReconnect(): void {
    this.shouldReconnect = true;
    console.log('[WebSocketClient] Automatic reconnection enabled');
  }

  /**
   * Disable automatic reconnection
   */
  public disableReconnect(): void {
    this.shouldReconnect = false;
    console.log('[WebSocketClient] Automatic reconnection disabled');
  }

  /**
   * Get reconnection status
   */
  public getReconnectStatus(): { enabled: boolean; attempts: number } {
    return {
      enabled: this.shouldReconnect,
      attempts: this.reconnectAttempts
    };
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    console.log('[WebSocketClient] Destroying client');
    this.disconnect();
    this.messageHandlers.clear();
    this.onOpenHandlers = [];
    this.onCloseHandlers = [];
    this.onErrorHandlers = [];
    this.messageQueue = [];
  }
}
