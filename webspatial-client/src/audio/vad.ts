/**
 * Voice Activity Detection (VAD) Module
 *
 * Hybrid RMS + Frequency-based approach for detecting speech vs silence.
 * Optimized for WebSpatial browser environment with OpenAI Realtime API integration.
 */

export interface VADConfig {
  /** FFT size for frequency analysis (power of 2) */
  fftSize: number;

  /** RMS threshold (normalized 0-1, typically 0.02-0.04) */
  rmsThreshold: number;

  /** Speech-to-noise ratio in frequency bands (typically 2.0-3.0) */
  speechBandSNR: number;

  /** Sample rate in Hz */
  sampleRate: number;

  /** Update interval in milliseconds */
  updateInterval: number;

  /** Minimum speech duration in milliseconds to filter out clicks */
  minimumSpeechDuration: number;

  /** Hangover time in milliseconds after speech stops */
  hangoverTime: number;

  /** Smoothing time constant for AnalyserNode (0-1) */
  smoothingTimeConstant: number;

  /** Speech frequency band range (Hz) - telephony standard */
  speechBandRange: [number, number];

  /** Noise frequency band range (Hz) - low frequency noise */
  noiseBandRange: [number, number];
}

export interface VADCallbacks {
  /** Fired when speech is detected (starts) */
  onSpeechStart?: () => void;

  /** Fired when speech stops */
  onSpeechEnd?: () => void;

  /** Fired on each detection cycle with current state */
  onVADUpdate?: (isSpeaking: boolean, rmsLevel: number, speechBandEnergy: number) => void;

  /** Fired on errors */
  onError?: (error: Error) => void;
}

type VADState = 'idle' | 'calibrating' | 'detecting' | 'stopped';

const VADState = {
  IDLE: 'idle' as const,
  CALIBRATING: 'calibrating' as const,
  DETECTING: 'detecting' as const,
  STOPPED: 'stopped' as const
};

export class VoiceActivityDetector {
  private config: VADConfig;
  private callbacks: VADCallbacks;

  // Web Audio API components
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  // Analysis buffers
  private timeDomainData: Uint8Array | null = null;
  private frequencyData: Uint8Array | null = null;

  // State management
  private state: VADState = VADState.IDLE;
  private isSpeaking: boolean = false;
  private speechStartTime: number = 0;
  private speechEndTime: number = 0;
  private updateIntervalId: number | null = null;

  // Calibration data
  private noiseFloorRMS: number = 0;
  private noiseFloorFrequency: Float32Array | null = null;
  private calibrationSamples: number = 0;
  private calibrationTarget: number = 100; // ~3 seconds at 30ms intervals

  constructor(config?: Partial<VADConfig>, callbacks?: VADCallbacks) {
    // Default configuration based on research findings
    this.config = {
      fftSize: 1024,
      rmsThreshold: 0.03,
      speechBandSNR: 2.5,
      sampleRate: 24000,
      updateInterval: 30,
      minimumSpeechDuration: 100,
      hangoverTime: 300,
      smoothingTimeConstant: 0.4,
      speechBandRange: [300, 3400], // Telephony standard
      noiseBandRange: [80, 300],     // Low frequency noise
      ...config
    };

    this.callbacks = callbacks || {};
  }

  /**
   * Start voice activity detection
   * @param stream Optional MediaStream (if not provided, will request microphone access)
   */
  public async startDetection(stream?: MediaStream): Promise<void> {
    try {
      if (this.state === VADState.DETECTING) {
        console.warn('VAD already running');
        return;
      }

      // Get microphone access if stream not provided
      if (!stream) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: this.config.sampleRate,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: false, // We handle this with VAD
            autoGainControl: true
          }
        });
      } else {
        this.mediaStream = stream;
      }

      // Initialize Web Audio API
      this.audioContext = new AudioContext({
        sampleRate: this.config.sampleRate
      });

      // Create audio processing chain
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyserNode = this.audioContext.createAnalyser();

      // Configure analyser
      this.analyserNode.fftSize = this.config.fftSize;
      this.analyserNode.smoothingTimeConstant = this.config.smoothingTimeConstant;

      // Connect nodes
      this.sourceNode.connect(this.analyserNode);

      // Allocate buffers
      const bufferLength = this.analyserNode.fftSize;
      const frequencyBinCount = this.analyserNode.frequencyBinCount;
      this.timeDomainData = new Uint8Array(bufferLength);
      this.frequencyData = new Uint8Array(frequencyBinCount);
      this.noiseFloorFrequency = new Float32Array(frequencyBinCount);

      // Start calibration
      this.state = VADState.CALIBRATING;
      this.calibrationSamples = 0;

      // Start analysis loop
      this.updateIntervalId = window.setInterval(
        () => this.analyzeAudio(),
        this.config.updateInterval
      );

      console.log('VAD started - calibrating...');

    } catch (error) {
      const err = error as Error;
      this.handleError(new Error(`Failed to start VAD: ${err.message}`));
      throw error;
    }
  }

  /**
   * Stop voice activity detection
   */
  public stopDetection(): void {
    if (this.updateIntervalId !== null) {
      window.clearInterval(this.updateIntervalId);
      this.updateIntervalId = null;
    }

    // Cleanup audio nodes
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Stop media stream tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.state = VADState.STOPPED;
    this.isSpeaking = false;

    console.log('VAD stopped');
  }

  /**
   * Get current speaking state
   */
  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Get current VAD state
   */
  public getState(): string {
    return this.state;
  }

  /**
   * Manually update configuration (useful for runtime tuning)
   */
  public updateConfig(config: Partial<VADConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('VAD config updated:', config);
  }

  /**
   * Force recalibration
   */
  public recalibrate(): void {
    if (this.state === VADState.DETECTING) {
      this.state = VADState.CALIBRATING;
      this.calibrationSamples = 0;
      console.log('VAD recalibrating...');
    }
  }

  /**
   * Main analysis loop - called every updateInterval
   */
  private analyzeAudio(): void {
    if (!this.analyserNode || !this.timeDomainData || !this.frequencyData) {
      return;
    }

    // Get audio data
    this.analyserNode.getByteTimeDomainData(this.timeDomainData as Uint8Array<ArrayBuffer>);
    this.analyserNode.getByteFrequencyData(this.frequencyData as Uint8Array<ArrayBuffer>);

    // Calculate RMS energy
    const rms = this.calculateRMS(this.timeDomainData);

    // Calculate frequency band energies
    const speechBandEnergy = this.calculateBandEnergy(
      this.frequencyData,
      this.config.speechBandRange[0],
      this.config.speechBandRange[1]
    );

    const noiseBandEnergy = this.calculateBandEnergy(
      this.frequencyData,
      this.config.noiseBandRange[0],
      this.config.noiseBandRange[1]
    );

    // Handle calibration phase
    if (this.state === VADState.CALIBRATING) {
      this.updateCalibration(rms, this.frequencyData);
      return;
    }

    // Hybrid detection logic: RMS + Frequency analysis
    const rmsAboveThreshold = rms > this.config.rmsThreshold;
    const speechToNoiseRatio = noiseBandEnergy > 0
      ? speechBandEnergy / noiseBandEnergy
      : speechBandEnergy;
    const frequencyIndicatesSpeech = speechToNoiseRatio > this.config.speechBandSNR;

    const voiceDetected = rmsAboveThreshold && frequencyIndicatesSpeech;

    // State machine with debouncing
    const now = Date.now();

    if (voiceDetected) {
      if (!this.isSpeaking) {
        // Potential speech start
        if (this.speechStartTime === 0) {
          this.speechStartTime = now;
        } else if (now - this.speechStartTime >= this.config.minimumSpeechDuration) {
          // Confirmed speech after minimum duration
          this.isSpeaking = true;
          this.speechEndTime = 0;
          this.callbacks.onSpeechStart?.();
          console.log('Speech detected');
        }
      } else {
        // Reset end time while speech continues
        this.speechEndTime = 0;
      }
    } else {
      if (this.isSpeaking) {
        // Potential speech end
        if (this.speechEndTime === 0) {
          this.speechEndTime = now;
        } else if (now - this.speechEndTime >= this.config.hangoverTime) {
          // Confirmed silence after hangover time
          this.isSpeaking = false;
          this.speechStartTime = 0;
          this.callbacks.onSpeechEnd?.();
          console.log('Speech ended');
        }
      } else {
        // Reset start time during silence
        this.speechStartTime = 0;
      }
    }

    // Fire update callback
    this.callbacks.onVADUpdate?.(this.isSpeaking, rms, speechBandEnergy);
  }

  /**
   * Calculate RMS (Root Mean Square) energy from time domain data
   */
  private calculateRMS(data: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      // Convert from 0-255 to -1 to 1
      const normalized = (data[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / data.length);
    return rms;
  }

  /**
   * Calculate energy in a specific frequency band
   */
  private calculateBandEnergy(
    frequencyData: Uint8Array,
    minFreq: number,
    maxFreq: number
  ): number {
    if (!this.analyserNode) return 0;

    const nyquist = this.config.sampleRate / 2;
    const binCount = frequencyData.length;

    // Convert frequency to bin indices
    const minBin = Math.floor((minFreq / nyquist) * binCount);
    const maxBin = Math.ceil((maxFreq / nyquist) * binCount);

    let sum = 0;
    let count = 0;

    for (let i = minBin; i < maxBin && i < binCount; i++) {
      // Frequency data is 0-255, normalize to 0-1
      sum += frequencyData[i] / 255;
      count++;
    }

    return count > 0 ? sum / count : 0;
  }

  /**
   * Update calibration with noise floor measurements
   */
  private updateCalibration(rms: number, frequencyData: Uint8Array): void {
    // Accumulate noise floor samples
    this.noiseFloorRMS += rms;

    if (this.noiseFloorFrequency) {
      for (let i = 0; i < frequencyData.length; i++) {
        this.noiseFloorFrequency[i] += frequencyData[i];
      }
    }

    this.calibrationSamples++;

    // Complete calibration after target samples
    if (this.calibrationSamples >= this.calibrationTarget) {
      this.noiseFloorRMS /= this.calibrationSamples;

      if (this.noiseFloorFrequency) {
        for (let i = 0; i < this.noiseFloorFrequency.length; i++) {
          this.noiseFloorFrequency[i] /= this.calibrationSamples;
        }
      }

      // Set dynamic threshold based on noise floor
      const dynamicThreshold = Math.max(
        this.config.rmsThreshold,
        this.noiseFloorRMS * 2.5 // 2.5x noise floor
      );

      this.config.rmsThreshold = dynamicThreshold;

      this.state = VADState.DETECTING;
      console.log(`VAD calibration complete. Noise floor RMS: ${this.noiseFloorRMS.toFixed(4)}, Threshold: ${dynamicThreshold.toFixed(4)}`);
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    console.error('VAD Error:', error);
    this.callbacks.onError?.(error);
  }
}

/**
 * Factory function to create a VAD instance with callbacks
 */
export function createVAD(
  config?: Partial<VADConfig>,
  callbacks?: VADCallbacks
): VoiceActivityDetector {
  return new VoiceActivityDetector(config, callbacks);
}

/**
 * Default export
 */
export default VoiceActivityDetector;
