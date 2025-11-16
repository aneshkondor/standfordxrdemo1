import WebSocket from 'ws';
/**
 * Session Manager - Bridges frontend WebSocket and OpenAI Realtime API
 * Handles Steps 4-6: Response Event Handlers, Audio Extraction, Error Handling
 */
export declare class OpenAISessionManager {
    private openaiClient;
    private frontendWs;
    private isSessionActive;
    constructor(frontendWs: WebSocket);
    /**
     * Initialize the OpenAI session
     */
    initialize(): Promise<void>;
    /**
     * Step 4: Setup Response Event Handlers for OpenAI messages
     */
    private setupOpenAIEventHandlers;
    /**
     * Step 5: Extract and Forward Audio to Frontend
     */
    private handleAudioDelta;
    /**
     * Setup Frontend WebSocket Event Handlers
     */
    private setupFrontendEventHandlers;
    /**
     * Step 6: Handle OpenAI API Errors
     */
    private handleOpenAIError;
    /**
     * Handle internal processing errors
     */
    private handleInternalError;
    /**
     * Send message to frontend WebSocket
     */
    private sendToFrontend;
    /**
     * Cleanup resources
     */
    cleanup(): void;
    /**
     * Get session status
     */
    isActive(): boolean;
}
//# sourceMappingURL=sessionManager.d.ts.map