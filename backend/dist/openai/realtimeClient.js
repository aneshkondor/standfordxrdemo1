"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIRealtimeClient = void 0;
const ws_1 = __importDefault(require("ws"));
// OpenAI Realtime API Configuration
const OPENAI_API_URL = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
class OpenAIRealtimeClient {
    ws = null;
    isConnected = false;
    reconnectAttempts = 0;
    maxReconnectAttempts = 5;
    reconnectDelay = 1000; // Start with 1 second
    constructor() {
        if (!OPENAI_API_KEY) {
            console.error('ERROR: OPENAI_API_KEY environment variable is not set');
            throw new Error('OPENAI_API_KEY is required');
        }
    }
    /**
     * Connect to OpenAI Realtime API
     */
    async connect() {
        return new Promise((resolve, reject) => {
            try {
                console.log('Connecting to OpenAI Realtime API...');
                // Create WebSocket connection with proper headers
                this.ws = new ws_1.default(OPENAI_API_URL, {
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
            }
            catch (error) {
                console.error('Failed to create WebSocket connection:', error);
                reject(error);
            }
        });
    }
    /**
     * Handle reconnection with exponential backoff
     */
    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
            setTimeout(() => {
                this.connect().catch(err => {
                    console.error('Reconnection failed:', err);
                });
            }, delay);
        }
        else {
            console.error('Max reconnection attempts reached. Please restart the server.');
        }
    }
    /**
     * Send a message to OpenAI WebSocket
     */
    send(message) {
        if (!this.ws || !this.isConnected) {
            console.error('Cannot send message: WebSocket is not connected');
            throw new Error('WebSocket not connected');
        }
        try {
            const jsonMessage = JSON.stringify(message);
            this.ws.send(jsonMessage);
            console.log(`Sent message: ${message.type}`);
        }
        catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
    /**
     * Add message event listener
     */
    onMessage(callback) {
        if (!this.ws) {
            throw new Error('WebSocket not initialized');
        }
        this.ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                callback(message);
            }
            catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });
    }
    /**
     * Close the WebSocket connection
     */
    close() {
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
    getConnectionStatus() {
        return this.isConnected;
    }
}
exports.OpenAIRealtimeClient = OpenAIRealtimeClient;
//# sourceMappingURL=realtimeClient.js.map