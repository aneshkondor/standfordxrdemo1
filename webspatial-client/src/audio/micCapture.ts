/**
 * Microphone Capture Pipeline
 * Captures user voice input and processes it for WebSocket transmission
 */

export interface MicCaptureConfig {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  onAudioChunk?: (chunk: Int16Array) => void;
  onError?: (error: Error) => void;
}

export class MicrophoneCapture {
  private config: MicCaptureConfig;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private isCapturing: boolean = false;

  constructor(config?: Partial<MicCaptureConfig>) {
    // Default configuration: 24kHz mono with echo cancellation and noise suppression
    this.config = {
      sampleRate: 24000,
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      ...config
    };
  }

  /**
   * Start capturing audio from the microphone
   * Requests user permission and initializes the media stream
   */
  async start(): Promise<void> {
    if (this.isCapturing) {
      console.warn('Microphone capture already in progress');
      return;
    }

    try {
      // Step 1: Request microphone access with specified constraints
      console.log('Requesting microphone access with constraints:', {
        channelCount: this.config.channelCount,
        sampleRate: this.config.sampleRate,
        echoCancellation: this.config.echoCancellation,
        noiseSuppression: this.config.noiseSuppression
      });

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: this.config.channelCount,
          sampleRate: this.config.sampleRate,
          echoCancellation: this.config.echoCancellation,
          noiseSuppression: this.config.noiseSuppression
        }
      });

      console.log('Microphone access granted');
      this.isCapturing = true;

      // Steps 2-4 will be implemented in subsequent exchanges
      // TODO: Create AudioContext pipeline
      // TODO: Implement AudioWorklet processor
      // TODO: Convert and emit audio chunks

    } catch (error) {
      const micError = error instanceof Error
        ? error
        : new Error('Unknown error accessing microphone');

      console.error('Error accessing microphone:', micError);

      // Handle specific error cases
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          console.error('Microphone permission denied by user');
        } else if (error.name === 'NotFoundError') {
          console.error('No microphone device found');
        } else if (error.name === 'NotReadableError') {
          console.error('Microphone is already in use by another application');
        }
      }

      this.isCapturing = false;

      if (this.config.onError) {
        this.config.onError(micError);
      }

      throw micError;
    }
  }

  /**
   * Stop capturing audio and clean up resources
   */
  async stop(): Promise<void> {
    console.log('Stopping microphone capture');

    // Stop all media stream tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped media track:', track.label);
      });
      this.mediaStream = null;
    }

    // Clean up AudioWorklet node
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    // Close AudioContext
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.isCapturing = false;
    console.log('Microphone capture stopped and resources cleaned up');
  }

  /**
   * Check if currently capturing audio
   */
  isCaptureActive(): boolean {
    return this.isCapturing;
  }

  /**
   * Get the current media stream
   */
  getMediaStream(): MediaStream | null {
    return this.mediaStream;
  }
}
