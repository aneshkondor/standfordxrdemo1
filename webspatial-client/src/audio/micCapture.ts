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

      // Step 2: Create AudioContext with specified sample rate
      this.audioContext = new AudioContext({
        sampleRate: this.config.sampleRate,
      });

      console.log(`AudioContext created with sample rate: ${this.audioContext.sampleRate}Hz`);

      // Step 3: Create audio processing pipeline using ScriptProcessorNode
      // Note: ScriptProcessorNode is deprecated but more compatible than AudioWorkletNode
      // Buffer size: 4096 samples provides good balance between latency and processing
      const bufferSize = 4096;
      const scriptNode = this.audioContext.createScriptProcessor(
        bufferSize,
        this.config.channelCount,
        this.config.channelCount
      );

      // Create source from media stream
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Connect: source → processor → destination (for monitoring, optional)
      source.connect(scriptNode);
      scriptNode.connect(this.audioContext.destination);

      // Step 4: Process audio and emit chunks
      scriptNode.onaudioprocess = (event: AudioProcessingEvent) => {
        if (!this.isCapturing || !this.config.onAudioChunk) {
          return;
        }

        // Get audio data from first channel
        const inputBuffer = event.inputBuffer;
        const channelData = inputBuffer.getChannelData(0); // Float32Array [-1, 1]

        // Convert Float32 to Int16 (PCM16 format expected by OpenAI)
        const int16Array = new Int16Array(channelData.length);
        for (let i = 0; i < channelData.length; i++) {
          // Clamp to [-1, 1] and convert to 16-bit integer range [-32768, 32767]
          const sample = Math.max(-1, Math.min(1, channelData[i]));
          int16Array[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        }

        // Emit audio chunk
        this.config.onAudioChunk(int16Array);
      };

      // Store reference for cleanup
      this.workletNode = scriptNode as any;

      console.log('Audio processing pipeline initialized and capturing audio chunks');

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

  /**
   * Wrapper methods for audioPipeline compatibility
   */

  async startCapture(): Promise<MediaStream> {
    await this.start();
    if (!this.mediaStream) {
      throw new Error('Failed to start microphone capture');
    }
    return this.mediaStream;
  }

  stopCapture(): void {
    this.stop();
  }

  onAudioChunk(callback: (chunk: Int16Array) => void): void {
    this.config.onAudioChunk = callback;
  }

  offAudioChunk(callback: (chunk: Int16Array) => void): void {
    if (this.config.onAudioChunk === callback) {
      this.config.onAudioChunk = undefined;
    }
  }
}

/**
 * Singleton instance for application-wide microphone capture
 */
export const micCapture = new MicrophoneCapture();

/**
 * Default export
 */
export default micCapture;
