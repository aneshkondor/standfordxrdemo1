"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAISessionManager = void 0;
const ws_1 = __importDefault(require("ws"));
const realtimeClient_1 = require("./realtimeClient");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Session Manager - Bridges frontend WebSocket and OpenAI Realtime API
 * Handles Steps 4-6: Response Event Handlers, Audio Extraction, Error Handling
 */
class OpenAISessionManager {
    openaiClient;
    frontendWs;
    isSessionActive = false;
    hasActiveResponse = false;
    constructor(frontendWs) {
        this.frontendWs = frontendWs;
        this.openaiClient = new realtimeClient_1.OpenAIRealtimeClient();
    }
    /**
     * Initialize the OpenAI session
     * @param tone - The selected AI tone/persona ('soft', 'friendly', 'analytical', 'therapist')
     */
    async initialize(tone) {
        try {
            console.log('Initializing OpenAI session...');
            console.log(`Selected tone: ${tone || 'default (therapist)'}`);
            // Connect to OpenAI
            await this.openaiClient.connect();
            // Load appropriate persona based on tone
            const { instructions, voice, temperature } = this.loadPersonaConfig(tone);
            // Configure session with persona prompt, voice, and temperature
            this.openaiClient.configureSession(instructions, voice, temperature);
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
     * Load persona configuration based on selected tone
     * Maps tone selections to persona prompt files, voices, and settings
     */
    loadPersonaConfig(tone) {
        try {
            let personaFile;
            let voice;
            let temperature;
            switch (tone?.toLowerCase()) {
                case 'soft':
                case 'friendly':
                    personaFile = 'persona_friendly.txt';
                    voice = 'nova'; // Warm, friendly, upbeat voice
                    temperature = 0.9; // High variability for natural casual conversation
                    console.log('Loading Best-Friend Companion persona (nova voice, temp: 0.9)...');
                    break;
                case 'analytical':
                    personaFile = 'persona_analytical.txt';
                    voice = 'echo'; // Clear, measured, thoughtful voice
                    temperature = 0.7; // More structured, less random
                    console.log('Loading Analytical Companion persona (echo voice, temp: 0.7)...');
                    break;
                case 'therapist':
                    personaFile = 'persona_therapist.txt';
                    voice = 'shimmer'; // Calm, soothing, therapeutic voice
                    temperature = 0.75; // Balanced between structure and warmth
                    console.log('Loading Therapist-Style Companion persona (shimmer voice, temp: 0.75)...');
                    break;
                default:
                    // Default to friendly persona if no tone specified
                    personaFile = 'persona_friendly.txt';
                    voice = 'nova';
                    temperature = 0.9;
                    console.log('No tone specified - defaulting to Best-Friend Companion persona...');
            }
            // Load persona file
            const promptPath = path.join(__dirname, '../../prompts', personaFile);
            const instructions = fs.readFileSync(promptPath, 'utf-8');
            console.log(`✓ Loaded persona from ${personaFile}`);
            return { instructions, voice, temperature };
        }
        catch (error) {
            console.error('Error loading persona file:', error);
            console.log('Falling back to friendly persona...');
            // Fallback to friendly persona
            const fallbackPath = path.join(__dirname, '../../prompts/persona_friendly.txt');
            return {
                instructions: fs.readFileSync(fallbackPath, 'utf-8'),
                voice: 'nova',
                temperature: 0.9
            };
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
                        if (this.hasActiveResponse) {
                            this.cancelActiveResponse();
                        }
                        this.openaiClient.requestResponse();
                        break;
                    case 'conversation.item.created':
                        console.log('💬 AI is generating response...');
                        this.hasActiveResponse = true;
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
                        this.hasActiveResponse = false;
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
                    // Handle OpenAI Realtime API format (from frontend)
                    case 'input_audio_buffer.append':
                        if (data.audio) {
                            console.log(`📤 Forwarding audio chunk to OpenAI (~${data.audio.length} chars base64)`);
                            this.openaiClient.sendAudioInput(data.audio);
                        }
                        break;
                    case 'input_audio_buffer.commit':
                        console.log('📤 Committing audio buffer to OpenAI');
                        this.openaiClient.commitAudioBuffer();
                        break;
                    // Legacy format support
                    case 'audio_input':
                        if (data.audio) {
                            this.openaiClient.sendAudioInput(data.audio);
                        }
                        break;
                    case 'stop_audio':
                        this.openaiClient.clearAudioBuffer();
                        break;
                    case 'commit_audio':
                        this.openaiClient.commitAudioBuffer();
                        break;
                    case 'response.cancel':
                        console.log('Frontend requested response cancellation');
                        this.cancelActiveResponse();
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
    cancelActiveResponse() {
        if (!this.hasActiveResponse) {
            return;
        }
        console.log('Cancelling active OpenAI response due to barge-in');
        this.openaiClient.cancelResponse();
        this.hasActiveResponse = false;
        this.sendToFrontend({
            type: 'response_cancelled',
            message: 'Therapist paused to listen'
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