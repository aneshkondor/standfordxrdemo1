import WebSocket from 'ws';
import { OpenAIRealtimeClient } from './realtimeClient';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Session Manager - Bridges frontend WebSocket and OpenAI Realtime API
 * Handles Steps 4-6: Response Event Handlers, Audio Extraction, Error Handling
 */
export class OpenAISessionManager {
  private openaiClient: OpenAIRealtimeClient;
  private frontendWs: WebSocket;
  private isSessionActive: boolean = false;
  private hasActiveResponse: boolean = false;

  constructor(frontendWs: WebSocket) {
    this.frontendWs = frontendWs;
    this.openaiClient = new OpenAIRealtimeClient();
  }

  /**
   * Initialize the OpenAI session
   * @param tone - The selected AI tone/persona ('soft', 'friendly', 'analytical', 'therapist')
   */
  public async initialize(tone?: string): Promise<void> {
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

    } catch (error) {
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
  private loadPersonaConfig(tone?: string): { instructions: string; voice: string; temperature: number } {
    try {
      let personaFile: string;
      let voice: string;
      let temperature: number;

      switch (tone?.toLowerCase()) {
        case 'soft':
        case 'friendly':
          personaFile = 'persona_friendly.txt';
          voice = 'alloy'; // Warm, friendly, upbeat voice
          temperature = 0.9; // High variability for natural casual conversation
          console.log('Loading Best-Friend Companion persona (alloy voice, temp: 0.9)...');
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
          voice = 'alloy';
          temperature = 0.9;
          console.log('No tone specified - defaulting to Best-Friend Companion persona...');
      }

      // Load persona file
      const promptPath = path.join(__dirname, '../../prompts', personaFile);
      const instructions = fs.readFileSync(promptPath, 'utf-8');

      console.log(`✓ Loaded persona from ${personaFile}`);
      return { instructions, voice, temperature };

    } catch (error) {
      console.error('Error loading persona file:', error);
      console.log('Falling back to friendly persona...');

      // Fallback to friendly persona
      const fallbackPath = path.join(__dirname, '../../prompts/persona_friendly.txt');
      return {
        instructions: fs.readFileSync(fallbackPath, 'utf-8'),
        voice: 'alloy',
        temperature: 0.9
      };
    }
  }

  /**
   * Step 4: Setup Response Event Handlers for OpenAI messages
   */
  private setupOpenAIEventHandlers(): void {
    this.openaiClient.onMessage((data: any) => {
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

      } catch (error) {
        console.error('Error handling OpenAI message:', error);
        this.handleInternalError(error);
      }
    });
  }

  /**
   * Step 5: Extract and Forward Audio to Frontend
   */
  private handleAudioDelta(data: any): void {
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

    } catch (error) {
      console.error('Error handling audio delta:', error);
      this.handleInternalError(error);
    }
  }

  /**
   * Setup Frontend WebSocket Event Handlers
   */
  private setupFrontendEventHandlers(): void {
    this.frontendWs.on('message', (message: WebSocket.Data) => {
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

      } catch (error) {
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

  private cancelActiveResponse(): void {
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
  private handleOpenAIError(data: any): void {
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
  private handleInternalError(error: any): void {
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
  private sendToFrontend(message: any): void {
    try {
      if (this.frontendWs.readyState === WebSocket.OPEN) {
        this.frontendWs.send(JSON.stringify(message));
      } else {
        console.warn('Cannot send to frontend - WebSocket not open');
      }
    } catch (error) {
      console.error('Error sending to frontend:', error);
    }
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    console.log('Cleaning up OpenAI session...');
    this.isSessionActive = false;

    try {
      this.openaiClient.close();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  /**
   * Get session status
   */
  public isActive(): boolean {
    return this.isSessionActive && this.openaiClient.getConnectionStatus();
  }
}
