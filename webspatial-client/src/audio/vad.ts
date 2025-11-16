/**
 * Voice Activity Detection (VAD) System
 *
 * Implements RMS-based voice activity detection using Web Audio API
 * to identify when a user is speaking versus silent, enabling cost-effective
 * OpenAI API usage by preventing transmission of silence or background noise.
 */

/**
 * Configuration options for the VAD system
 */
export interface VADConfig {
  /** RMS threshold for speech detection (typical: 0.01-0.05) */
  rmsThreshold: number;

  /** Minimum duration of speech before triggering detection (ms) */
  minSpeechDuration: number;

  /** Minimum duration of silence before stopping detection (ms) */
  minSilenceDuration: number;

  /** Smoothing factor for AnalyserNode (0-1, higher = more smoothing) */
  smoothingFactor: number;

  /** FFT size for AnalyserNode (must be power of 2: 256, 512, 1024, 2048, etc.) */
  fftSize: number;
}

/**
 * Default VAD configuration optimized for typical office/home environments
 */
export const DEFAULT_VAD_CONFIG: VADConfig = {
  rmsThreshold: 0.02,
  minSpeechDuration: 300,
  minSilenceDuration: 500,
  smoothingFactor: 0.8,
  fftSize: 2048,
};

/**
 * Callback function type for speech detection events
 */
export type SpeechDetectionCallback = (isSpeaking: boolean, rmsLevel: number) => void;

/**
 * Voice Activity Detection class
 *
 * Detects voice activity using RMS (Root Mean Square) energy-based analysis
 * with smart temporal debouncing to prevent false triggers.
 */
export class VoiceActivityDetector {
  private analyser: AnalyserNode | null = null;
  private dataArray: Float32Array<ArrayBuffer> | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  private isSpeaking: boolean = false;
  private isRunning: boolean = false;
  private speakingStartTime: number = 0;
  private silenceStartTime: number = 0;
  private animationFrameId: number | null = null;

  private config: VADConfig;
  private onSpeechDetectedCallback: SpeechDetectionCallback | null = null;

  /**
   * Creates a new VoiceActivityDetector instance
   * @param config - Optional configuration overrides
   */
  constructor(config: Partial<VADConfig> = {}) {
    this.config = { ...DEFAULT_VAD_CONFIG, ...config };
  }

  /**
   * Initializes the audio context and microphone stream
   * @throws Error if microphone access is denied or unavailable
   */
  async initialize(): Promise<void> {
    try {
      // Request microphone access with audio constraints
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Create audio context
      this.audioContext = new AudioContext();

      // Create source node from media stream
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Create and configure analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.fftSize;
      this.analyser.smoothingTimeConstant = this.config.smoothingFactor;

      // Allocate buffer for time domain data
      const buffer = new ArrayBuffer(this.analyser.fftSize * 4); // 4 bytes per float
      this.dataArray = new Float32Array(buffer);

      // Connect source to analyser (no output to speakers)
      this.sourceNode.connect(this.analyser);

      console.log('[VAD] Initialized successfully');
    } catch (error) {
      console.error('[VAD] Initialization failed:', error);
      throw new Error(`Failed to initialize VAD: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Starts voice activity detection
   * @param onSpeechDetected - Callback function invoked when speech state changes
   */
  startDetection(onSpeechDetected?: SpeechDetectionCallback): void {
    if (!this.analyser || !this.dataArray) {
      throw new Error('VAD not initialized. Call initialize() first.');
    }

    if (this.isRunning) {
      console.warn('[VAD] Detection already running');
      return;
    }

    if (onSpeechDetected) {
      this.onSpeechDetectedCallback = onSpeechDetected;
    }

    this.isRunning = true;
    this.isSpeaking = false;
    this.speakingStartTime = 0;
    this.silenceStartTime = 0;

    console.log('[VAD] Detection started');
    this.processAudioFrame();
  }

  /**
   * Stops voice activity detection
   */
  stopDetection(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    console.log('[VAD] Detection stopped');
  }

  /**
   * Cleans up resources and stops all audio processing
   */
  destroy(): void {
    this.stopDetection();

    // Disconnect audio nodes
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    // Stop media stream tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.dataArray = null;
    this.onSpeechDetectedCallback = null;

    console.log('[VAD] Destroyed');
  }

  /**
   * Sets the callback function for speech detection events
   * @param callback - Function to call when speech state changes
   */
  onSpeechDetected(callback: SpeechDetectionCallback): void {
    this.onSpeechDetectedCallback = callback;
  }

  /**
   * Updates the VAD configuration
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<VADConfig>): void {
    this.config = { ...this.config, ...config };

    // Update analyser if it exists
    if (this.analyser) {
      if (config.fftSize !== undefined) {
        this.analyser.fftSize = config.fftSize;
        const buffer = new ArrayBuffer(this.analyser.fftSize * 4); // 4 bytes per float
        this.dataArray = new Float32Array(buffer);
      }
      if (config.smoothingFactor !== undefined) {
        this.analyser.smoothingTimeConstant = config.smoothingFactor;
      }
    }

    console.log('[VAD] Configuration updated:', this.config);
  }

  /**
   * Gets the current VAD configuration
   */
  getConfig(): VADConfig {
    return { ...this.config };
  }

  /**
   * Returns whether speech is currently being detected
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Auto-calibrates the RMS threshold based on background noise
   * Call this method when the user is silent to measure ambient noise
   *
   * @param duration - Calibration duration in milliseconds (default: 2000ms)
   * @returns Promise that resolves with the calibrated threshold
   */
  async calibrateThreshold(duration: number = 2000): Promise<number> {
    if (!this.analyser || !this.dataArray) {
      throw new Error('VAD not initialized. Call initialize() first.');
    }

    console.log('[VAD] Starting calibration...');

    const samples: number[] = [];
    const sampleInterval = 20; // Sample every 20ms
    const sampleCount = Math.floor(duration / sampleInterval);

    for (let i = 0; i < sampleCount; i++) {
      await new Promise(resolve => setTimeout(resolve, sampleInterval));
      this.analyser.getFloatTimeDomainData(this.dataArray);
      const rms = this.calculateRMS(this.dataArray as Float32Array);
      samples.push(rms);
    }

    // Calculate average background noise
    const avgNoise = samples.reduce((a, b) => a + b, 0) / samples.length;

    // Set threshold to 3x average background noise
    const calibratedThreshold = avgNoise * 3;

    console.log(`[VAD] Calibration complete. Avg noise: ${avgNoise.toFixed(4)}, Threshold: ${calibratedThreshold.toFixed(4)}`);

    this.config.rmsThreshold = calibratedThreshold;
    return calibratedThreshold;
  }

  /**
   * Main audio processing loop - analyzes audio frames for voice activity
   */
  private processAudioFrame(): void {
    if (!this.isRunning || !this.analyser || !this.dataArray) {
      return;
    }

    // Get time domain data
    this.analyser.getFloatTimeDomainData(this.dataArray);

    // Calculate RMS energy level
    const rms = this.calculateRMS(this.dataArray as Float32Array);

    // Apply temporal debouncing logic
    this.updateSpeechState(rms);

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(() => this.processAudioFrame());
  }

  /**
   * Calculates the Root Mean Square (RMS) of audio samples
   * RMS represents the average energy/power of the audio signal
   *
   * @param samples - Float32Array of audio samples
   * @returns RMS value (0.0 to 1.0)
   */
  private calculateRMS(samples: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    return Math.sqrt(sum / samples.length);
  }

  /**
   * Updates speech detection state based on RMS level with temporal debouncing
   * Prevents false triggers from transient noise and brief pauses
   *
   * @param rms - Current RMS energy level
   */
  private updateSpeechState(rms: number): void {
    const now = Date.now();
    const previousState = this.isSpeaking;

    if (rms > this.config.rmsThreshold) {
      // Potential speech detected
      if (!this.isSpeaking) {
        // Not currently speaking - check if we should start
        if (this.speakingStartTime === 0) {
          // First frame above threshold
          this.speakingStartTime = now;
        } else if (now - this.speakingStartTime >= this.config.minSpeechDuration) {
          // Sustained speech detected for minimum duration
          this.isSpeaking = true;
          this.silenceStartTime = 0;
        }
      } else {
        // Already speaking - reset silence timer
        this.silenceStartTime = 0;
      }
    } else {
      // Silence or low energy detected
      if (this.isSpeaking) {
        // Currently speaking - check if we should stop
        if (this.silenceStartTime === 0) {
          // First frame below threshold
          this.silenceStartTime = now;
        } else if (now - this.silenceStartTime >= this.config.minSilenceDuration) {
          // Sustained silence detected for minimum duration
          this.isSpeaking = false;
          this.speakingStartTime = 0;
        }
      } else {
        // Already silent - reset speech timer
        this.speakingStartTime = 0;
      }
    }

    // Invoke callback if state changed
    if (this.isSpeaking !== previousState && this.onSpeechDetectedCallback) {
      this.onSpeechDetectedCallback(this.isSpeaking, rms);
    }
  }
}

/**
 * Factory function to create and initialize a VAD instance
 *
 * @param config - Optional configuration overrides
 * @returns Promise that resolves with initialized VoiceActivityDetector
 */
export async function createVAD(config: Partial<VADConfig> = {}): Promise<VoiceActivityDetector> {
  const vad = new VoiceActivityDetector(config);
  await vad.initialize();
  return vad;
}
