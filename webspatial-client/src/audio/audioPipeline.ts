/**
 * Audio Pipeline Integration
 * Connects Microphone Capture, VAD, and WebSocket for complete outbound audio flow
 */

import { micCapture } from './micCapture';
import { vad } from './vad';
import websocketClient from '../api/websocketClient';
import { therapyStateController } from '../app-shell/TherapyStateController';

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

// Export singleton instance
export const audioPipeline = new AudioPipeline();
export default audioPipeline;
