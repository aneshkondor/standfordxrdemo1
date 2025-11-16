/**
 * Complete Audio Pipeline Integration
 * Combines both outbound (user → backend) and inbound (backend → user) audio flows
 */

import { micCapture } from './micCapture';
import { vad } from './vad';
import websocketClient from '../api/websocketClient';
import { therapyStateController } from '../app-shell/TherapyStateController';
import { WebSocketClient, WebSocketMessage } from '../api/websocketClient';
import { base64ToArrayBuffer, playAudioChunk } from './audioPlayback';

/**
 * =============================================================================
 * OUTBOUND AUDIO PIPELINE (Task 3.2)
 * Mic → VAD → WebSocket → Backend
 * =============================================================================
 */

class AudioPipeline {
  private isRunning = false;
  private isSpeechActive = false;
  private mediaStream: MediaStream | null = null;
  private commitDebounceTimer: number | null = null;
  private readonly COMMIT_DEBOUNCE_MS = 300; // 300ms silence before committing
  private isInitialized = false;

  constructor() {
    // Step 5: Register therapy state change listener for automatic lifecycle management
    this.initializeStateListener();
  }

  /**
   * Step 5: Initialize therapy state listener
   * Automatically starts/stops pipeline based on therapy state
   */
  private initializeStateListener(): void {
    therapyStateController.onStateChange((newState, oldState) => {
      console.log(`[AudioPipeline] Therapy state changed: ${oldState} -> ${newState}`);

      if (newState === 'active_therapy' && !this.isRunning) {
        // Entering active therapy - start pipeline
        console.log('[AudioPipeline] Auto-starting pipeline for active therapy');
        this.startAudioPipeline().catch(error => {
          console.error('[AudioPipeline] Auto-start failed:', error);
        });
      } else if ((newState === 'idle' || newState === 'paused') && this.isRunning) {
        // Leaving active therapy - stop pipeline
        console.log('[AudioPipeline] Auto-stopping pipeline (therapy no longer active)');
        this.stopAudioPipeline();
      }
    });

    this.isInitialized = true;
  }

  /**
   * Initialize and start the complete audio pipeline
   * Steps 1-5: Complete integration
   */
  async startAudioPipeline(): Promise<void> {
    if (this.isRunning) {
      console.warn('[AudioPipeline] Already running');
      return;
    }

    // Step 5: Check therapy state before starting
    if (!therapyStateController.isActive()) {
      console.warn('[AudioPipeline] Cannot start - therapy is not active');
      return;
    }

    try {
      console.log('[AudioPipeline] Starting audio pipeline...');

      // Ensure WebSocket is connected
      if (!websocketClient.isConnected()) {
        console.log('[AudioPipeline] Connecting to WebSocket...');
        await websocketClient.connect();
      }

      // Step 1: Start microphone capture
      this.mediaStream = await micCapture.startCapture();
      console.log('[AudioPipeline] Microphone capture started');

      // Step 1: Start VAD with the same media stream
      await vad.startDetection(this.mediaStream);
      console.log('[AudioPipeline] VAD detection started');

      // Step 2: Register speech detection callback
      vad.onSpeechDetected(this.handleSpeechDetection);

      // Step 3: Register audio chunk callback
      micCapture.onAudioChunk(this.handleAudioChunk);

      this.isRunning = true;
      console.log('[AudioPipeline] Audio pipeline started successfully');
    } catch (error) {
      console.error('[AudioPipeline] Failed to start audio pipeline:', error);
      this.stopAudioPipeline();
      throw error;
    }
  }

  /**
   * Stop the complete audio pipeline
   */
  stopAudioPipeline(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('[AudioPipeline] Stopping audio pipeline...');

    // Clear any pending commit timer
    if (this.commitDebounceTimer) {
      clearTimeout(this.commitDebounceTimer);
      this.commitDebounceTimer = null;
    }

    // Unregister callbacks
    vad.offSpeechDetected(this.handleSpeechDetection);
    micCapture.offAudioChunk(this.handleAudioChunk);

    // Stop VAD first
    vad.stopDetection();
    console.log('[AudioPipeline] VAD detection stopped');

    // Stop microphone capture
    micCapture.stopCapture();
    console.log('[AudioPipeline] Microphone capture stopped');

    this.mediaStream = null;
    this.isRunning = false;
    this.isSpeechActive = false;

    console.log('[AudioPipeline] Audio pipeline stopped');
  }

  /**
   * Check if pipeline is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Check if speech is currently active
   */
  isSpeaking(): boolean {
    return this.isSpeechActive;
  }

  /**
   * Step 2: Handle speech detection events from VAD
   */
  private handleSpeechDetection = (isSpeaking: boolean): void => {
    console.log(`[AudioPipeline] Speech ${isSpeaking ? 'started' : 'ended'}`);

    if (isSpeaking) {
      // Speech started - clear any pending commit timer
      if (this.commitDebounceTimer) {
        clearTimeout(this.commitDebounceTimer);
        this.commitDebounceTimer = null;
      }

      // Set speech active flag
      this.isSpeechActive = true;
      console.log('[AudioPipeline] Now transmitting audio chunks');
    } else {
      // Speech ended - set inactive flag and schedule buffer commit
      this.isSpeechActive = false;
      console.log('[AudioPipeline] Stopped transmitting audio chunks');

      // Step 4: Debounced buffer commit
      this.scheduleBufferCommit();
    }
  };

  /**
   * Step 3: Handle audio chunks from microphone and send to WebSocket
   */
  private handleAudioChunk = (chunk: Int16Array): void => {
    // Only send audio when speech is active
    if (!this.isSpeechActive) {
      return;
    }

    // Convert Int16Array to base64
    const base64Audio = this.int16ArrayToBase64(chunk);

    // Send to WebSocket with OpenAI Realtime API format
    websocketClient.send({
      type: 'input_audio_buffer.append',
      audio: base64Audio
    });
  };

  /**
   * Step 4: Schedule buffer commit with debouncing
   * Waits for silence period before committing to avoid excessive commits
   */
  private scheduleBufferCommit(): void {
    // Clear any existing timer
    if (this.commitDebounceTimer) {
      clearTimeout(this.commitDebounceTimer);
    }

    // Schedule new commit after debounce period
    this.commitDebounceTimer = window.setTimeout(() => {
      console.log('[AudioPipeline] Committing audio buffer');

      // Send commit signal to backend
      websocketClient.send({
        type: 'input_audio_buffer.commit'
      });

      this.commitDebounceTimer = null;
    }, this.COMMIT_DEBOUNCE_MS);
  }

  /**
   * Convert Int16Array (PCM16) to base64 string
   */
  private int16ArrayToBase64(int16Array: Int16Array): string {
    // Convert Int16Array to Uint8Array (byte representation)
    const uint8Array = new Uint8Array(int16Array.buffer);

    // Convert to base64
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }

    return btoa(binary);
  }
}

/**
 * =============================================================================
 * INBOUND AUDIO PIPELINE (Task 3.3)
 * Backend → WebSocket → Playback
 * =============================================================================
 */

/**
 * Audio Pipeline State
 * Tracks current playback state for UI coordination
 */
export enum AudioPipelineState {
  IDLE = 'idle',
  RECEIVING = 'receiving',
  PLAYING = 'playing',
  COMPLETE = 'complete'
}

/**
 * UI Status Update Callback
 * Allows UI components to display current playback status
 */
export type StatusUpdateCallback = (status: string) => void;

/**
 * InboundAudioPipeline
 * Manages inbound audio flow from WebSocket to audio playback
 */
export class InboundAudioPipeline {
  private wsClient: WebSocketClient;
  private state: AudioPipelineState = AudioPipelineState.IDLE;
  private onStateChange?: (state: AudioPipelineState) => void;
  private onStatusUpdate?: StatusUpdateCallback;

  constructor(wsClient: WebSocketClient) {
    this.wsClient = wsClient;
    this.registerMessageHandlers();
  }

  /**
   * Step 1: Register WebSocket message handlers for audio response events
   */
  private registerMessageHandlers(): void {
    console.log('[InboundAudioPipeline] Registering message handlers');

    // Handler for response_started - AI is generating response
    this.wsClient.onMessage('response_started', (message: WebSocketMessage) => {
      this.handleResponseStarted(message);
    });

    // Handler for audio_chunk - Receives audio chunks
    this.wsClient.onMessage('audio_chunk', (message: WebSocketMessage) => {
      this.handleAudioChunk(message);
    });

    // Handler for audio_done - Audio completion signal
    this.wsClient.onMessage('audio_done', (message: WebSocketMessage) => {
      this.handleAudioDone(message);
    });

    // Handler for response_done - Full response completion
    this.wsClient.onMessage('response_done', (message: WebSocketMessage) => {
      this.handleResponseDone(message);
    });

    console.log('[InboundAudioPipeline] Message handlers registered successfully');
  }

  /**
   * Handle response_started event
   * Triggered when AI begins generating a response
   */
  private handleResponseStarted(message: WebSocketMessage): void {
    console.log('[InboundAudioPipeline] Response started:', message.payload?.message);
    this.setState(AudioPipelineState.RECEIVING);

    // Step 4: Update UI status - AI is generating response
    this.updateStatus('Therapist is responding...');
  }

  /**
   * Handle audio_chunk event
   * Receives and processes incoming audio data
   *
   * Message format: { type: 'audio_chunk', payload: { audio: 'base64...' } }
   */
  private async handleAudioChunk(message: WebSocketMessage): Promise<void> {
    console.log('[InboundAudioPipeline] Audio chunk received');

    // Step 2: Extract audio data from message payload
    const base64Audio = message.payload?.audio;

    if (!base64Audio) {
      console.warn('[InboundAudioPipeline] Audio chunk received but no audio data present');
      return;
    }

    if (typeof base64Audio !== 'string') {
      console.error('[InboundAudioPipeline] Invalid audio data format - expected base64 string');
      return;
    }

    try {
      // Step 2: Decode base64 to binary ArrayBuffer
      const audioData = base64ToArrayBuffer(base64Audio);

      console.log(`[InboundAudioPipeline] Decoded audio chunk: ${audioData.byteLength} bytes`);

      // Step 3: Trigger playback
      // Update state to PLAYING on first chunk
      if (this.state === AudioPipelineState.RECEIVING) {
        this.setState(AudioPipelineState.PLAYING);

        // Step 4: Update UI status - Robot is speaking
        this.updateStatus('Robot is speaking...');
      }

      // Play the audio chunk with seamless scheduling
      await playAudioChunk(audioData);

      console.log('[InboundAudioPipeline] Audio chunk scheduled for playback');

    } catch (error) {
      console.error('[InboundAudioPipeline] Error processing audio chunk:', error);

      // Step 4: Update UI status with error
      this.updateStatus('Audio playback error');

      // Reset to idle on error
      this.setState(AudioPipelineState.IDLE);
    }
  }

  /**
   * Handle audio_done event
   * Signals that audio output is complete
   */
  private handleAudioDone(message: WebSocketMessage): void {
    console.log('[InboundAudioPipeline] Audio output complete:', message.payload?.message);
    // Note: Playback may still be in progress
    // Keep status showing "Robot is speaking..." until response_done
  }

  /**
   * Handle response_done event
   * Signals that full response is complete
   */
  private handleResponseDone(message: WebSocketMessage): void {
    console.log('[InboundAudioPipeline] Response complete:', message.payload?.message);
    this.setState(AudioPipelineState.COMPLETE);

    // Step 4: Update UI status - Ready for next interaction
    this.updateStatus('Ready to listen');

    // Reset to idle after a short delay
    setTimeout(() => {
      this.reset();
    }, 1000);
  }

  /**
   * Set pipeline state and notify listeners
   */
  private setState(newState: AudioPipelineState): void {
    if (this.state !== newState) {
      console.log(`[InboundAudioPipeline] State transition: ${this.state} → ${newState}`);
      this.state = newState;

      if (this.onStateChange) {
        this.onStateChange(newState);
      }
    }
  }

  /**
   * Get current pipeline state
   */
  public getState(): AudioPipelineState {
    return this.state;
  }

  /**
   * Register callback for state changes
   * Used for UI updates
   */
  public onStateChanged(callback: (state: AudioPipelineState) => void): void {
    this.onStateChange = callback;
  }

  /**
   * Step 4: Register callback for UI status updates
   * Allows UI components to display current playback status
   *
   * @param callback - Function that receives status string updates
   *
   * @example
   * ```typescript
   * pipeline.onStatus((status) => {
   *   console.log('Status:', status);
   *   // Update UI with status: "Robot is speaking...", "Ready to listen", etc.
   * });
   * ```
   */
  public onStatus(callback: StatusUpdateCallback): void {
    this.onStatusUpdate = callback;
  }

  /**
   * Step 4: Update UI status
   * Triggers the registered status callback with new status message
   */
  private updateStatus(status: string): void {
    console.log(`[InboundAudioPipeline] Status: ${status}`);

    if (this.onStatusUpdate) {
      this.onStatusUpdate(status);
    }
  }

  /**
   * Reset pipeline to idle state
   */
  public reset(): void {
    console.log('[InboundAudioPipeline] Resetting pipeline');
    this.setState(AudioPipelineState.IDLE);
  }
}

/**
 * =============================================================================
 * EXPORTS
 * =============================================================================
 */

// Export outbound pipeline singleton
export const audioPipeline = new AudioPipeline();

// Export inbound pipeline class for instantiation
export { InboundAudioPipeline };

// Default export is outbound pipeline
export default audioPipeline;
