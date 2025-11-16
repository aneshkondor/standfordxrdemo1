/**
 * Inbound Audio Pipeline
 *
 * Connects WebSocket message receiver to audio playback system.
 * Handles incoming audio chunks from backend and triggers seamless playback.
 */

import { WebSocketClient, WebSocketMessage } from '../api/websocketClient';
import { getAudioContext, getNextPlayTime, setNextPlayTime } from './audioPlayback';

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
 * InboundAudioPipeline
 * Manages inbound audio flow from WebSocket to audio playback
 */
export class InboundAudioPipeline {
  private wsClient: WebSocketClient;
  private state: AudioPipelineState = AudioPipelineState.IDLE;
  private onStateChange?: (state: AudioPipelineState) => void;

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
  }

  /**
   * Handle audio_chunk event
   * Receives and processes incoming audio data
   *
   * Message format: { type: 'audio_chunk', payload: { audio: 'base64...' } }
   */
  private handleAudioChunk(message: WebSocketMessage): void {
    console.log('[AudioPipeline] Audio chunk received');

    // Extract audio data from message payload
    // Implementation will be completed in Step 2
    const audioData = message.payload?.audio;

    if (!audioData) {
      console.warn('[AudioPipeline] Audio chunk received but no audio data present');
      return;
    }

    // TODO Step 2: Extract and decode base64 audio data
    // TODO Step 3: Trigger playback

    console.log('[AudioPipeline] Audio chunk ready for processing');
  }

  /**
   * Handle audio_done event
   * Signals that audio output is complete
   */
  private handleAudioDone(message: WebSocketMessage): void {
    console.log('[AudioPipeline] Audio output complete:', message.payload?.message);
    // Note: Playback may still be in progress, state will update when playback finishes
  }

  /**
   * Handle response_done event
   * Signals that full response is complete
   */
  private handleResponseDone(message: WebSocketMessage): void {
    console.log('[AudioPipeline] Response complete:', message.payload?.message);
    this.setState(AudioPipelineState.COMPLETE);
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
   * Used for UI updates (Step 4)
   */
  public onStateChanged(callback: (state: AudioPipelineState) => void): void {
    this.onStateChange = callback;
  }

  /**
   * Reset pipeline to idle state
   */
  public reset(): void {
    console.log('[AudioPipeline] Resetting pipeline');
    this.setState(AudioPipelineState.IDLE);
  }
}
