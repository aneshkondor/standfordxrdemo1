/**
 * Audio Playback System for OpenAI Realtime API
 *
 * Handles playback of audio chunks received from OpenAI's Realtime API.
 * Uses a dedicated AudioContext at 24kHz to match the API's output format.
 *
 * Reference: archive/index.html:705-733
 */

// AudioContext for playback - initialized lazily
let audioPlayer: AudioContext | null = null;

// Track the next scheduled play time to ensure seamless playback
let nextPlayTime = 0;

/**
 * Initialize the audio playback context
 * Creates a dedicated AudioContext at 24kHz sample rate to match OpenAI output
 */
function initializeAudioContext(): AudioContext {
    if (!audioPlayer) {
        // Create AudioContext with 24kHz sample rate (OpenAI Realtime API format)
        audioPlayer = new AudioContext({ sampleRate: 24000 });
        nextPlayTime = audioPlayer.currentTime;
        console.log('Audio playback context initialized at 24kHz');
    }
    return audioPlayer;
}

/**
 * Get the current audio context
 * Initializes if not already created
 */
export function getAudioContext(): AudioContext {
    return audioPlayer || initializeAudioContext();
}

/**
 * Get the current next play time for scheduling
 */
export function getNextPlayTime(): number {
    return nextPlayTime;
}

/**
 * Update the next play time after scheduling a chunk
 */
export function setNextPlayTime(time: number): void {
    nextPlayTime = time;
}

/**
 * Reset the audio playback system
 * Useful for cleanup or restarting audio session
 */
export function resetAudioPlayback(): void {
    if (audioPlayer) {
        audioPlayer.close();
        audioPlayer = null;
        nextPlayTime = 0;
        console.log('Audio playback context reset');
    }
}

/**
 * Check if audio context is initialized
 */
export function isAudioInitialized(): boolean {
    return audioPlayer !== null;
}

/**
 * Decode base64 string to ArrayBuffer
 * Used for decoding audio chunks from WebSocket
 *
 * @param base64 - Base64-encoded audio data
 * @returns ArrayBuffer containing decoded binary data
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Play audio chunk with seamless scheduling
 * Converts PCM16 to Float32, creates AudioBuffer, and schedules playback
 *
 * Reference: archive/index.html:705-733
 *
 * @param audioData - ArrayBuffer containing PCM16 audio data
 * @returns Promise that resolves when audio is scheduled
 */
export async function playAudioChunk(audioData: ArrayBuffer): Promise<void> {
    // Initialize audio context if needed
    const context = getAudioContext();

    // Convert Int16 PCM to Float32
    const int16Array = new Int16Array(audioData);
    const float32Array = new Float32Array(int16Array.length);

    for (let i = 0; i < int16Array.length; i++) {
        // Normalize Int16 (-32768 to 32767) to Float32 (-1.0 to 1.0)
        float32Array[i] = int16Array[i] / 32768;
    }

    // Create audio buffer (mono, 24kHz to match OpenAI output)
    const audioBuffer = context.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    // Create buffer source
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);

    // Schedule playback for seamless continuity
    const currentTime = context.currentTime;
    const scheduleTime = Math.max(currentTime, nextPlayTime);

    source.start(scheduleTime);

    // Update next play time to end of this chunk
    nextPlayTime = scheduleTime + audioBuffer.duration;

    console.log(`Audio chunk scheduled: ${audioBuffer.duration.toFixed(3)}s at ${scheduleTime.toFixed(3)}s`);
}
