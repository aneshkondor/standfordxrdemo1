/**
 * Voice Activity Detection (VAD) Usage Example
 *
 * This file demonstrates how to integrate the VAD system
 * with microphone capture and the OpenAI Realtime API.
 */

import { createVAD, VADConfig, VADCallbacks } from './vad';

/**
 * Example 1: Basic VAD with default configuration
 */
export async function basicVADExample(): Promise<void> {
  // Create VAD instance with callbacks
  const vad = createVAD(undefined, {
    onSpeechStart: () => {
      console.log('🎤 Speech started - begin streaming to API');
      // TODO: Start sending audio to OpenAI Realtime API
    },
    onSpeechEnd: () => {
      console.log('🔇 Speech ended - stop streaming');
      // TODO: Stop sending audio to OpenAI Realtime API
    },
    onVADUpdate: (isSpeaking, rmsLevel, speechBandEnergy) => {
      console.log(`VAD Update: Speaking=${isSpeaking}, RMS=${rmsLevel.toFixed(4)}, Energy=${speechBandEnergy.toFixed(4)}`);
    },
    onError: (error) => {
      console.error('VAD Error:', error);
    }
  });

  try {
    // Start detection (will request microphone permission)
    await vad.startDetection();
    console.log('VAD started with default configuration');

    // VAD is now running and will fire callbacks
    // Stop after 30 seconds in this example
    setTimeout(() => {
      vad.stopDetection();
      console.log('VAD stopped');
    }, 30000);

  } catch (error) {
    console.error('Failed to start VAD:', error);
  }
}

/**
 * Example 2: Custom VAD configuration for noisy environment
 */
export async function noisyEnvironmentVADExample(): Promise<void> {
  // Custom configuration for noisy office environment
  const customConfig: Partial<VADConfig> = {
    rmsThreshold: 0.05,           // Higher threshold for noisy environment
    speechBandSNR: 3.0,            // Require stronger speech signal
    minimumSpeechDuration: 150,    // Longer minimum to filter noise bursts
    hangoverTime: 400,             // Longer hangover to capture trailing speech
    fftSize: 2048                  // Higher resolution for better frequency analysis
  };

  const vad = createVAD(customConfig, {
    onSpeechStart: () => console.log('Speech detected (noisy mode)'),
    onSpeechEnd: () => console.log('Speech ended (noisy mode)')
  });

  await vad.startDetection();
}

/**
 * Example 3: Integration with existing MediaStream
 */
export async function existingStreamVADExample(): Promise<void> {
  // Get microphone stream with specific constraints
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      sampleRate: 24000,
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: false,
      autoGainControl: true
    }
  });

  // Create VAD and pass the existing stream
  const vad = createVAD(undefined, {
    onSpeechStart: () => console.log('Using existing stream - speech started'),
    onSpeechEnd: () => console.log('Using existing stream - speech ended')
  });

  // Start VAD with the existing stream
  await vad.startDetection(stream);

  // You can use the same stream for other purposes (e.g., recording, API streaming)
  console.log('VAD running on existing stream');
}

/**
 * Example 4: Dynamic threshold adjustment
 */
export async function dynamicThresholdExample(): Promise<void> {
  const vad = createVAD();

  await vad.startDetection();

  // Simulate adjusting threshold based on user feedback or environment changes
  setTimeout(() => {
    console.log('Increasing sensitivity (lowering threshold)...');
    vad.updateConfig({ rmsThreshold: 0.02 });
  }, 10000);

  setTimeout(() => {
    console.log('Decreasing sensitivity (raising threshold)...');
    vad.updateConfig({ rmsThreshold: 0.04 });
  }, 20000);

  setTimeout(() => {
    console.log('Recalibrating to ambient noise...');
    vad.recalibrate();
  }, 30000);
}

/**
 * Example 5: Complete integration with OpenAI Realtime API
 */
export async function openAIIntegrationExample(): Promise<void> {
  let isStreamingToAPI = false;
  let audioChunksBuffer: ArrayBuffer[] = [];

  const vad = createVAD({
    sampleRate: 24000,  // OpenAI recommended sample rate
    updateInterval: 30   // 30ms chunks
  }, {
    onSpeechStart: () => {
      console.log('Speech started - preparing to stream to OpenAI API');
      isStreamingToAPI = true;

      // Send buffered audio (lookahead buffer to capture speech onset)
      if (audioChunksBuffer.length > 0) {
        console.log(`Sending ${audioChunksBuffer.length} buffered chunks to API`);
        audioChunksBuffer.forEach(chunk => {
          // TODO: Send chunk to OpenAI Realtime API via WebSocket
          sendToOpenAI(chunk);
        });
        audioChunksBuffer = [];
      }
    },

    onSpeechEnd: () => {
      console.log('Speech ended - stop streaming to OpenAI API');
      isStreamingToAPI = false;
      audioChunksBuffer = [];

      // TODO: Signal end of speech to OpenAI API
      // This allows the API to process the complete utterance
    },

    onVADUpdate: (isSpeaking, rmsLevel) => {
      // Visualize audio level in UI
      updateAudioLevelMeter(rmsLevel);
    },

    onError: (error) => {
      console.error('VAD Error - stopping API stream:', error);
      isStreamingToAPI = false;
    }
  });

  await vad.startDetection();

  // Simulate audio capture and gating
  // In real implementation, you'd capture audio chunks from the same MediaStream
  // and conditionally send them based on VAD state
  const audioProcessingLoop = setInterval(() => {
    // Simulate getting audio chunk
    const audioChunk = captureAudioChunk(); // Placeholder

    if (isStreamingToAPI) {
      // Send to API when speech is detected
      sendToOpenAI(audioChunk);
    } else {
      // Buffer recent audio for lookahead (keep last 200ms)
      audioChunksBuffer.push(audioChunk);
      if (audioChunksBuffer.length > 7) { // ~200ms at 30ms chunks
        audioChunksBuffer.shift();
      }
    }
  }, 30);

  // Cleanup
  setTimeout(() => {
    clearInterval(audioProcessingLoop);
    vad.stopDetection();
  }, 60000);
}

/**
 * Example 6: VAD with manual override controls
 */
export class VADController {
  private vad: ReturnType<typeof createVAD>;
  private manuallyMuted: boolean = false;
  private pushToTalkActive: boolean = false;

  constructor() {
    this.vad = createVAD(undefined, {
      onSpeechStart: () => this.handleSpeechStart(),
      onSpeechEnd: () => this.handleSpeechEnd()
    });
  }

  async start(): Promise<void> {
    await this.vad.startDetection();
  }

  stop(): void {
    this.vad.stopDetection();
  }

  // Manual mute button
  setMuted(muted: boolean): void {
    this.manuallyMuted = muted;
    console.log(`Manual mute: ${muted}`);
  }

  // Push-to-talk button
  setPushToTalk(active: boolean): void {
    this.pushToTalkActive = active;
    console.log(`Push-to-talk: ${active}`);
  }

  // Force recalibration button
  recalibrate(): void {
    this.vad.recalibrate();
    console.log('Recalibrating...');
  }

  private handleSpeechStart(): void {
    // Only process speech if not manually muted
    // and (not in push-to-talk mode OR push-to-talk is active)
    const shouldStream = !this.manuallyMuted &&
                        (!this.pushToTalkActive || this.pushToTalkActive);

    if (shouldStream) {
      console.log('▶ Streaming audio to API');
      // TODO: Start streaming
    } else {
      console.log('🔇 Speech detected but muted by user');
    }
  }

  private handleSpeechEnd(): void {
    console.log('⏸ Stopped streaming');
    // TODO: Stop streaming
  }

  // Get current VAD state for UI display
  getStatus(): { isSpeaking: boolean; state: string } {
    return {
      isSpeaking: this.vad.getIsSpeaking(),
      state: this.vad.getState()
    };
  }
}

// Placeholder functions for demonstration
function sendToOpenAI(_chunk: ArrayBuffer): void {
  // TODO: Implement WebSocket/WebRTC send to OpenAI Realtime API
}

function captureAudioChunk(): ArrayBuffer {
  // TODO: Implement actual audio capture from MediaStream
  return new ArrayBuffer(0);
}

function updateAudioLevelMeter(_level: number): void {
  // TODO: Update UI audio level visualization
}
