export declare class OpenAIRealtimeClient {
    private ws;
    private isConnected;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectDelay;
    constructor();
    /**
     * Connect to OpenAI Realtime API
     */
    connect(): Promise<void>;
    /**
     * Handle reconnection with exponential backoff
     */
    private handleReconnect;
    /**
     * Send a message to OpenAI WebSocket
     */
    send(message: any): void;
    /**
     * Add message event listener
     */
    onMessage(callback: (data: any) => void): void;
    /**
     * Close the WebSocket connection
     */
    close(): void;
    /**
     * Check if connected
     */
    getConnectionStatus(): boolean;
}
//# sourceMappingURL=realtimeClient.d.ts.map