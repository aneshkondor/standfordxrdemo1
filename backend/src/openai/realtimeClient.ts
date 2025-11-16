import WebSocket from 'ws';

// OpenAI Realtime API Configuration
const OPENAI_API_URL = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export class OpenAIRealtimeClient {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000; // Start with 1 second

  constructor() {
    if (!OPENAI_API_KEY) {
      console.error('ERROR: OPENAI_API_KEY environment variable is not set');
      throw new Error('OPENAI_API_KEY is required');
    }
  }

  /**
   * Connect to OpenAI Realtime API
   */
  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Connecting to OpenAI Realtime API...');

        // Create WebSocket connection with proper headers
        this.ws = new WebSocket(OPENAI_API_URL, {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Beta': 'realtime=v1'
          }
        });

        // Connection opened
        this.ws.on('open', () => {
          console.log('✓ Connected to OpenAI Realtime API');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        // Connection error
        this.ws.on('error', (error) => {
          console.error('✗ OpenAI WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        });

        // Connection closed
        this.ws.on('close', (code, reason) => {
          console.log(`WebSocket closed: ${code} - ${reason}`);
          this.isConnected = false;
          this.handleReconnect();
        });

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);

      setTimeout(() => {
        this.connect().catch(err => {
          console.error('Reconnection failed:', err);
        });
      }, delay);
    } else {
      console.error('Max reconnection attempts reached. Please restart the server.');
    }
  }

  /**
   * Send a message to OpenAI WebSocket
   */
  public send(message: any): void {
    if (!this.ws || !this.isConnected) {
      console.error('Cannot send message: WebSocket is not connected');
      throw new Error('WebSocket not connected');
    }

    try {
      const jsonMessage = JSON.stringify(message);
      this.ws.send(jsonMessage);
      console.log(`Sent message: ${message.type}`);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Add message event listener
   */
  public onMessage(callback: (data: any) => void): void {
    if (!this.ws) {
      throw new Error('WebSocket not initialized');
    }

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        callback(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
  }

  /**
   * Close the WebSocket connection
   */
  public close(): void {
    if (this.ws) {
      console.log('Closing OpenAI WebSocket connection...');
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  /**
   * Check if connected
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}
