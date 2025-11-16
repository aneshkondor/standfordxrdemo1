"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAISessionManager = void 0;
const ws_1 = __importDefault(require("ws"));
const realtimeClient_1 = require("./realtimeClient");
/**
 * Session Manager - Bridges frontend WebSocket and OpenAI Realtime API
 * Handles Steps 4-6: Response Event Handlers, Audio Extraction, Error Handling
 */
class OpenAISessionManager {
    openaiClient;
    frontendWs;
    isSessionActive = false;
    constructor(frontendWs) {
        this.frontendWs = frontendWs;
        this.openaiClient = new realtimeClient_1.OpenAIRealtimeClient();
    }
    /**
     * Initialize the OpenAI session
     */
    async initialize() {
        try {
            console.log('Initializing OpenAI session...');
            // Connect to OpenAI
            await this.openaiClient.connect();
            // Configure session with therapist prompt
            this.openaiClient.configureSession();
            // Set up event handlers
            this.setupOpenAIEventHandlers();
            this.setupFrontendEventHandlers();
            this.isSessionActive = true;
            console.log('✓ OpenAI session initialized successfully');
            // Notify frontend
            this.sendToFrontend({
                type: 'session_ready',
                message: 'Connected to AI therapist'
            });
        }
        catch (error) {
            console.error('Failed to initialize OpenAI session:', error);
            this.sendToFrontend({
                type: 'error',
                message: 'Failed to connect to AI therapist',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
     * Step 4: Setup Response Event Handlers for OpenAI messages
     */
    setupOpenAIEventHandlers() {
        this.openaiClient.onMessage((data) => {
            try {
                console.log(`[OpenAI] Received event: ${data.type}`);
                switch (data.type) {
                    case 'session.created':
                        console.log('✓ Session created:', data.session?.id);
                        break;
                    case 'session.updated':
                        console.log('✓ Session configuration applied');
                        break;
                    case 'input_audio_buffer.speech_started':
                        console.log('🎤 Speech detected');
                        this.sendToFrontend({
                            type: 'speech_started',
                            message: 'Listening...'
                        });
                        break;
                    case 'input_audio_buffer.speech_stopped':
                        console.log('🎤 Speech stopped');
                        this.sendToFrontend({
                            type: 'speech_stopped',
                            message: 'Processing...'
                        });
                        break;
                    case 'input_audio_buffer.committed':
                        console.log('✓ Audio buffer committed');
                        break;
                    case 'conversation.item.created':
                        console.log('💬 AI is generating response...');
                        this.sendToFrontend({
                            type: 'response_started',
                            message: 'Therapist is responding...'
                        });
                        break;
                    case 'response.audio_transcript.delta':
                        // Optional: Log transcript chunks
                        if (data.delta) {
                            console.log(`[Transcript]: ${data.delta}`);
                        }
                        break;
                    case 'response.audio.delta':
                        // Step 5: Extract and forward audio chunks
                        this.handleAudioDelta(data);
                        break;
                    case 'response.audio.done':
                        console.log('🔊 Audio output complete');
                        this.sendToFrontend({
                            type: 'audio_done',
                            message: 'Audio playback complete'
                        });
                        break;
                    case 'response.done':
                        console.log('✓ Response completed');
                        this.sendToFrontend({
                            type: 'response_done',
                            message: 'Ready to listen'
                        });
                        break;
                    case 'error':
                        // Step 6: Error handling
                        this.handleOpenAIError(data);
                        break;
                    case 'rate_limits.updated':
                        console.log('Rate limits:', data.rate_limits);
                        break;
                    default:
                        console.log(`[OpenAI] Unhandled event type: ${data.type}`);
                }
            }
            catch (error) {
                console.error('Error handling OpenAI message:', error);
                this.handleInternalError(error);
            }
        });
    }
    /**
     * Step 5: Extract and Forward Audio to Frontend
     */
    handleAudioDelta(data) {
        try {
            if (!data.delta) {
                console.warn('Audio delta received but no audio data present');
                return;
            }
            // Extract base64-encoded PCM16 audio
            const audioData = data.delta;
            // Log audio chunk size for monitoring
            const estimatedBytes = (audioData.length * 3) / 4; // Base64 to bytes approximation
            console.log(`🔊 Forwarding audio chunk (~${Math.round(estimatedBytes)} bytes)`);
            // Forward audio chunk to frontend
            this.sendToFrontend({
                type: 'audio_chunk',
                audio: audioData
            });
        }
        catch (error) {
            console.error('Error handling audio delta:', error);
            this.handleInternalError(error);
        }
    }
    /**
     * Setup Frontend WebSocket Event Handlers
     */
    setupFrontendEventHandlers() {
        this.frontendWs.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                console.log(`[Frontend] Received: ${data.type}`);
                switch (data.type) {
                    case 'audio_input':
                        // Step 3: Forward audio input to OpenAI
                        if (data.audio) {
                            this.openaiClient.sendAudioInput(data.audio);
                        }
                        break;
                    case 'stop_audio':
                        // Clear audio buffer
                        this.openaiClient.clearAudioBuffer();
                        break;
                    case 'commit_audio':
                        // Manually commit audio (if not using VAD)
                        this.openaiClient.commitAudioBuffer();
                        break;
                    default:
                        console.warn(`[Frontend] Unhandled message type: ${data.type}`);
                }
            }
            catch (error) {
                console.error('Error handling frontend message:', error);
                this.handleInternalError(error);
            }
        });
        this.frontendWs.on('close', () => {
            console.log('Frontend disconnected - cleaning up OpenAI session');
            this.cleanup();
        });
        this.frontendWs.on('error', (error) => {
            console.error('Frontend WebSocket error:', error);
            this.cleanup();
        });
    }
    /**
     * Step 6: Handle OpenAI API Errors
     */
    handleOpenAIError(data) {
        console.error('❌ OpenAI API Error:', data.error);
        const errorMessage = data.error?.message || 'Unknown API error';
        const errorType = data.error?.type || 'unknown_error';
        const errorCode = data.error?.code || 'N/A';
        console.error(`Error Type: ${errorType}`);
        console.error(`Error Code: ${errorCode}`);
        console.error(`Error Message: ${errorMessage}`);
        // Handle specific error types
        switch (errorType) {
            case 'invalid_request_error':
                console.error('Invalid request - check API parameters');
                break;
            case 'authentication_error':
                console.error('Authentication failed - check OPENAI_API_KEY');
                break;
            case 'rate_limit_error':
                console.error('Rate limit exceeded - requests queued');
                // TODO: Implement request queuing
                break;
            case 'server_error':
                console.error('OpenAI server error - will retry connection');
                // Reconnection is handled automatically by the client
                break;
            default:
                console.error('Unhandled error type');
        }
        // Notify frontend
        this.sendToFrontend({
            type: 'error',
            message: errorMessage,
            errorType: errorType,
            errorCode: errorCode
        });
    }
    /**
     * Handle internal processing errors
     */
    handleInternalError(error) {
        console.error('❌ Internal error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal processing error';
        this.sendToFrontend({
            type: 'error',
            message: errorMessage
        });
    }
    /**
     * Send message to frontend WebSocket
     */
    sendToFrontend(message) {
        try {
            if (this.frontendWs.readyState === ws_1.default.OPEN) {
                this.frontendWs.send(JSON.stringify(message));
            }
            else {
                console.warn('Cannot send to frontend - WebSocket not open');
            }
        }
        catch (error) {
            console.error('Error sending to frontend:', error);
        }
    }
    /**
     * Cleanup resources
     */
    cleanup() {
        console.log('Cleaning up OpenAI session...');
        this.isSessionActive = false;
        try {
            this.openaiClient.close();
        }
        catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
    /**
     * Get session status
     */
    isActive() {
        return this.isSessionActive && this.openaiClient.getConnectionStatus();
    }
}
exports.OpenAISessionManager = OpenAISessionManager;
//# sourceMappingURL=sessionManager.js.map