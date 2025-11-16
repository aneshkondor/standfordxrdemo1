/**
 * Audio System Initialization
 * Sets up both inbound and outbound audio pipelines
 */

import websocketClient from '../api/websocketClient';
import { InboundAudioPipeline } from './audioPipeline';

// Initialize inbound audio pipeline (Backend → User)
const inboundAudioPipeline = new InboundAudioPipeline(websocketClient);

// Outbound audio pipeline (User → Backend) is automatically initialized
// via the audioPipeline singleton which listens to therapy state changes

/**
 * Initialize audio system
 * Call this once during app startup
 */
export function initializeAudioSystem(): void {
  console.log('[Audio System] Initializing audio pipelines...');

  // Inbound pipeline is already initialized above
  console.log('[Audio System] Inbound audio pipeline ready');

  // Outbound pipeline auto-starts on therapy state change
  console.log('[Audio System] Outbound audio pipeline will auto-start on therapy activation');

  // Register handler for session_ready message
  websocketClient.onMessage('session_ready', (message) => {
    console.log('[Audio System] Session ready:', message);
  });

  console.log('[Audio System] Audio system initialized successfully');
}

// Export inbound pipeline for direct access if needed
export { inboundAudioPipeline };
