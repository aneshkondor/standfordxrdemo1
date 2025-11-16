/**
 * Microphone Capture Pipeline
 * Captures audio from user's microphone at 24kHz mono and outputs PCM16 chunks
 */

type AudioChunkCallback = (chunk: Int16Array) => void;

interface MicCaptureConfig {
  sampleRate: number;
  channelCount: number;
  chunkSize: number; // Number of samples per chunk
}

export class MicrophoneCapture {
  private isCapturing = false;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private chunkCallbacks: AudioChunkCallback[] = [];

  private config: MicCaptureConfig = {
    sampleRate: 24000,
    channelCount: 1,
    chunkSize: 2400 // 100ms chunks at 24kHz
  };

  /**
   * Start capturing audio from microphone
   */
  async startCapture(): Promise<MediaStream> {
    if (this.isCapturing) {
      console.warn('[MicCapture] Already capturing');
      return this.mediaStream!;
    }

    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channelCount,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create audio context
      this.audioContext = new AudioContext({
        sampleRate: this.config.sampleRate
      });

      // Create source from media stream
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Create script processor for audio processing
      const bufferSize = 4096;
      this.processor = this.audioContext.createScriptProcessor(
        bufferSize,
        this.config.channelCount,
        this.config.channelCount
      );

      // Process audio chunks
      this.processor.onaudioprocess = (event) => {
        this.processAudioBuffer(event.inputBuffer);
      };

      // Connect nodes
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      this.isCapturing = true;
      console.log('[MicCapture] Started capturing audio');

      return this.mediaStream;
    } catch (error) {
      console.error('[MicCapture] Failed to start capture:', error);
      throw error;
    }
  }

  /**
   * Stop capturing audio
   */
  stopCapture(): void {
    if (!this.isCapturing) {
      return;
    }

    // Disconnect and cleanup
    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isCapturing = false;
    console.log('[MicCapture] Stopped capturing audio');
  }

  /**
   * Register callback for audio chunks
   */
  onAudioChunk(callback: AudioChunkCallback): void {
    this.chunkCallbacks.push(callback);
  }

  /**
   * Remove audio chunk callback
   */
  offAudioChunk(callback: AudioChunkCallback): void {
    this.chunkCallbacks = this.chunkCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Check if currently capturing
   */
  isCaptureActive(): boolean {
    return this.isCapturing;
  }

  /**
   * Get current media stream
   */
  getMediaStream(): MediaStream | null {
    return this.mediaStream;
  }

  /**
   * Configure capture parameters
   */
  configure(config: Partial<MicCaptureConfig>): void {
    if (this.isCapturing) {
      console.warn('[MicCapture] Cannot configure while capturing');
      return;
    }
    this.config = { ...this.config, ...config };
  }

  /**
   * Process audio buffer and emit chunks
   */
  private processAudioBuffer(buffer: AudioBuffer): void {
    // Get audio data from first channel
    const channelData = buffer.getChannelData(0);

    // Convert Float32Array to Int16Array (PCM16)
    const pcm16 = this.float32ToInt16(channelData);

    // Emit chunk to callbacks
    this.emitChunk(pcm16);
  }

  /**
   * Convert Float32 samples to Int16 (PCM16 format)
   */
  private float32ToInt16(float32Array: Float32Array): Int16Array {
    const int16Array = new Int16Array(float32Array.length);

    for (let i = 0; i < float32Array.length; i++) {
      // Clamp to [-1, 1] range
      const sample = Math.max(-1, Math.min(1, float32Array[i]));
      // Convert to 16-bit integer
      int16Array[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }

    return int16Array;
  }

  /**
   * Emit audio chunk to all registered callbacks
   */
  private emitChunk(chunk: Int16Array): void {
    this.chunkCallbacks.forEach(callback => {
      try {
        callback(chunk);
      } catch (error) {
        console.error('[MicCapture] Error in chunk callback:', error);
      }
    });
  }
}

// Export singleton instance
export const micCapture = new MicrophoneCapture();
export default micCapture;
