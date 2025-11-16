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
    /**
     * Configure session with persona instructions and voice
     * Step 2: Send Session Configuration
     * @param personaInstructions - Optional persona prompt. If not provided, loads default therapist prompt.
     * @param voice - Optional voice selection for this persona
     * @param temperature - Optional temperature for response variability
     */
    configureSession(personaInstructions?: string, voice?: string, temperature?: number): void;
    /**
     * Send audio input to OpenAI
     * Step 3: Implement Audio Input Handler
     */
    sendAudioInput(audioData: string): void;
    /**
     * Explicitly request the model to generate a response
     * Useful when server-side VAD doesn't auto-trigger replies
     */
    requestResponse(): void;
    /**
     * Cancel any actively generating response (used for barge-in)
     */
    cancelResponse(): void;
    /**
     * Commit audio buffer (optional - triggers response if not using VAD)
     */
    commitAudioBuffer(): void;
    /**
     * Clear audio buffer
     */
    clearAudioBuffer(): void;
}
//# sourceMappingURL=realtimeClient.d.ts.map