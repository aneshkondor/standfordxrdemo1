/**
 * Inbound Audio Pipeline
 *
 * Connects WebSocket message receiver to audio playback system.
 * Handles incoming audio chunks from backend and triggers seamless playback.
 */

import { WebSocketClient, WebSocketMessage } from '../api/websocketClient';
import { base64ToArrayBuffer, playAudioChunk } from './audioPlayback';

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
    console.log('[AudioPipeline] Registering message handlers');

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

    console.log('[AudioPipeline] Message handlers registered successfully');
  }

  /**
   * Handle response_started event
   * Triggered when AI begins generating a response
   */
  private handleResponseStarted(message: WebSocketMessage): void {
    console.log('[AudioPipeline] Response started:', message.payload?.message);
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
    console.log('[AudioPipeline] Audio chunk received');

    // Step 2: Extract audio data from message payload
    const base64Audio = message.payload?.audio;

    if (!base64Audio) {
      console.warn('[AudioPipeline] Audio chunk received but no audio data present');
      return;
    }

    if (typeof base64Audio !== 'string') {
      console.error('[AudioPipeline] Invalid audio data format - expected base64 string');
      return;
    }

    try {
      // Step 2: Decode base64 to binary ArrayBuffer
      const audioData = base64ToArrayBuffer(base64Audio);

      console.log(`[AudioPipeline] Decoded audio chunk: ${audioData.byteLength} bytes`);

      // Step 3: Trigger playback
      // Update state to PLAYING on first chunk
      if (this.state === AudioPipelineState.RECEIVING) {
        this.setState(AudioPipelineState.PLAYING);

        // Step 4: Update UI status - Robot is speaking
        this.updateStatus('Robot is speaking...');
      }

      // Play the audio chunk with seamless scheduling
      await playAudioChunk(audioData);

      console.log('[AudioPipeline] Audio chunk scheduled for playback');

    } catch (error) {
      console.error('[AudioPipeline] Error processing audio chunk:', error);

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
    console.log('[AudioPipeline] Audio output complete:', message.payload?.message);
    // Note: Playback may still be in progress
    // Keep status showing "Robot is speaking..." until response_done
  }

  /**
   * Handle response_done event
   * Signals that full response is complete
   */
  private handleResponseDone(message: WebSocketMessage): void {
    console.log('[AudioPipeline] Response complete:', message.payload?.message);
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
      console.log(`[AudioPipeline] State transition: ${this.state} → ${newState}`);
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
    console.log(`[AudioPipeline] Status: ${status}`);

    if (this.onStatusUpdate) {
      this.onStatusUpdate(status);
    }
  }

  /**
   * Reset pipeline to idle state
   */
  public reset(): void {
    console.log('[AudioPipeline] Resetting pipeline');
    this.setState(AudioPipelineState.IDLE);
  }
}
