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

  /**
   * Initialize and start the complete audio pipeline
   * Step 1: Connect VAD to Mic Lifecycle
   */
  async startAudioPipeline(): Promise<void> {
    if (this.isRunning) {
      console.warn('[AudioPipeline] Already running');
      return;
    }

    try {
      console.log('[AudioPipeline] Starting audio pipeline...');

      // Start microphone capture
      this.mediaStream = await micCapture.startCapture();
      console.log('[AudioPipeline] Microphone capture started');

      // Start VAD with the same media stream
      await vad.startDetection(this.mediaStream);
      console.log('[AudioPipeline] VAD detection started');

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
}

// Export singleton instance
export const audioPipeline = new AudioPipeline();
export default audioPipeline;
