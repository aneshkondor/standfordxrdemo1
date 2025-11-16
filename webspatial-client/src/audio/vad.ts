/**
 * Voice Activity Detection (VAD) System
 * Detects when user is speaking vs. silent using audio energy analysis
 */

type SpeechCallback = (isSpeaking: boolean) => void;

interface VADConfig {
  energyThreshold: number;
  silenceDuration: number;
  sampleRate: number;
}

class VAD {
  private isActive = false;
  private isSpeaking = false;
  private speechCallbacks: SpeechCallback[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private checkInterval: number | null = null;

  private config: VADConfig = {
    energyThreshold: -50, // dB threshold for speech detection
    silenceDuration: 500, // ms of silence before triggering silence event
    sampleRate: 24000
  };

  private lastSpeechTime = 0;
  private silenceTimer: number | null = null;

  /**
   * Start voice activity detection
   */
  async startDetection(stream?: MediaStream): Promise<void> {
    if (this.isActive) {
      console.warn('[VAD] Already active');
      return;
    }

    try {
      // If no stream provided, get microphone access
      const audioStream = stream || await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create audio context and analyser
      this.audioContext = new AudioContext({ sampleRate: this.config.sampleRate });
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      // Connect stream to analyser
      this.source = this.audioContext.createMediaStreamSource(audioStream);
      this.source.connect(this.analyser);

      this.isActive = true;
      this.startEnergyMonitoring();

      console.log('[VAD] Detection started');
    } catch (error) {
      console.error('[VAD] Failed to start detection:', error);
      throw error;
    }
  }

  /**
   * Stop voice activity detection
   */
  stopDetection(): void {
    if (!this.isActive) {
      return;
    }

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.isActive = false;
    this.isSpeaking = false;

    console.log('[VAD] Detection stopped');
  }

  /**
   * Register callback for speech detection events
   */
  onSpeechDetected(callback: SpeechCallback): void {
    this.speechCallbacks.push(callback);
  }

  /**
   * Remove speech detection callback
   */
  offSpeechDetected(callback: SpeechCallback): void {
    this.speechCallbacks = this.speechCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Check if currently detecting speech
   */
  isDetectingSpeech(): boolean {
    return this.isSpeaking;
  }

  /**
   * Configure VAD parameters
   */
  configure(config: Partial<VADConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Start monitoring audio energy levels
   */
  private startEnergyMonitoring(): void {
    this.checkInterval = window.setInterval(() => {
      if (!this.analyser) return;

      const dataArray = new Float32Array(this.analyser.frequencyBinCount);
      this.analyser.getFloatTimeDomainData(dataArray);

      // Calculate RMS (Root Mean Square) energy
      const rms = this.calculateRMS(dataArray);
      const db = this.rmsToDb(rms);

      // Check if energy exceeds threshold
      if (db > this.config.energyThreshold) {
        this.handleSpeechDetected();
      } else {
        this.handleSilenceDetected();
      }
    }, 50); // Check every 50ms
  }

  /**
   * Calculate RMS energy of audio samples
   */
  private calculateRMS(samples: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    return Math.sqrt(sum / samples.length);
  }

  /**
   * Convert RMS to decibels
   */
  private rmsToDb(rms: number): number {
    return 20 * Math.log10(Math.max(rms, 1e-10));
  }

  /**
   * Handle speech detected event
   */
  private handleSpeechDetected(): void {
    this.lastSpeechTime = Date.now();

    // Clear silence timer
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    // If transitioning from silence to speech
    if (!this.isSpeaking) {
      this.isSpeaking = true;
      this.notifyCallbacks(true);
    }
  }

  /**
   * Handle silence detected event
   */
  private handleSilenceDetected(): void {
    // Only start silence timer if currently speaking
    if (this.isSpeaking && !this.silenceTimer) {
      this.silenceTimer = window.setTimeout(() => {
        // Check if enough time has passed since last speech
        const silenceDuration = Date.now() - this.lastSpeechTime;
        if (silenceDuration >= this.config.silenceDuration) {
          this.isSpeaking = false;
          this.notifyCallbacks(false);
        }
        this.silenceTimer = null;
      }, this.config.silenceDuration);
    }
  }

  /**
   * Notify all registered callbacks
   */
  private notifyCallbacks(isSpeaking: boolean): void {
    console.log(`[VAD] Speech ${isSpeaking ? 'detected' : 'ended'}`);
    this.speechCallbacks.forEach(callback => {
      try {
        callback(isSpeaking);
      } catch (error) {
        console.error('[VAD] Error in speech callback:', error);
      }
    });
  }
}

// Export singleton instance
export const vad = new VAD();
export default vad;
