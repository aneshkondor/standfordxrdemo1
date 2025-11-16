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
