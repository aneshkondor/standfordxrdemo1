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
exports.OpenAIRealtimeClient = void 0;
const ws_1 = __importDefault(require("ws"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
    /**
     * Configure session with persona instructions and voice
     * Step 2: Send Session Configuration
     * @param personaInstructions - Optional persona prompt. If not provided, loads default therapist prompt.
     * @param voice - Optional voice selection for this persona
     * @param temperature - Optional temperature for response variability
     */
    configureSession(personaInstructions, voice, temperature) {
        try {
            let instructions;
            let selectedVoice = voice || 'alloy';
            let responseTemp = temperature || 0.8;
            if (personaInstructions) {
                // Use provided persona instructions
                instructions = personaInstructions.trim();
                console.log('Using provided persona instructions...');
            }
            else {
                // Fallback to default therapist prompt
                const promptPath = path.join(__dirname, '../../prompts/therapist_system.txt');
                instructions = fs.readFileSync(promptPath, 'utf-8').trim();
                console.log('Loading default therapist instructions from prompt file...');
            }
            console.log(`Instructions: ${instructions.substring(0, 100)}...`);
            console.log(`Voice: ${selectedVoice}, Temperature: ${responseTemp}`);
            // Send session.update configuration
            const sessionConfig = {
                type: 'session.update',
                session: {
                    modalities: ['text', 'audio'],
                    instructions: instructions,
                    voice: selectedVoice,
                    input_audio_format: 'pcm16',
                    output_audio_format: 'pcm16',
                    input_audio_transcription: {
                        model: 'whisper-1'
                    },
                    turn_detection: {
                        type: 'server_vad',
                        threshold: 0.5,
                        prefix_padding_ms: 300,
                        silence_duration_ms: 200
                    },
                    temperature: responseTemp,
                    max_response_output_tokens: 4096
                }
            };
            this.send(sessionConfig);
            console.log('✓ Session configuration sent successfully');
        }
        catch (error) {
            console.error('Failed to configure session:', error);
            throw error;
        }
    }
    /**
     * Send audio input to OpenAI
     * Step 3: Implement Audio Input Handler
     */
    sendAudioInput(audioData) {
        try {
            const message = {
                type: 'input_audio_buffer.append',
                audio: audioData
            };
            this.send(message);
        }
        catch (error) {
            console.error('Error sending audio input:', error);
            throw error;
        }
    }
    /**
     * Explicitly request the model to generate a response
     * Useful when server-side VAD doesn't auto-trigger replies
     */
    requestResponse() {
        try {
            const message = {
                type: 'response.create'
            };
            this.send(message);
            console.log('Requested new response from OpenAI');
        }
        catch (error) {
            console.error('Error requesting response:', error);
            throw error;
        }
    }
    /**
     * Cancel any actively generating response (used for barge-in)
     */
    cancelResponse() {
        try {
            const message = {
                type: 'response.cancel'
            };
            this.send(message);
            console.log('Requested cancellation of active response');
        }
        catch (error) {
            console.error('Error cancelling response:', error);
            throw error;
        }
    }
    /**
     * Commit audio buffer (optional - triggers response if not using VAD)
     */
    commitAudioBuffer() {
        try {
            const message = {
                type: 'input_audio_buffer.commit'
            };
            this.send(message);
            console.log('Audio buffer committed');
        }
        catch (error) {
            console.error('Error committing audio buffer:', error);
            throw error;
        }
    }
    /**
     * Clear audio buffer
     */
    clearAudioBuffer() {
        try {
            const message = {
                type: 'input_audio_buffer.clear'
            };
            this.send(message);
            console.log('Audio buffer cleared');
        }
        catch (error) {
            console.error('Error clearing audio buffer:', error);
            throw error;
        }
    }
}
exports.OpenAIRealtimeClient = OpenAIRealtimeClient;
//# sourceMappingURL=realtimeClient.js.map