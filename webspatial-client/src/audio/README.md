# Audio Pipeline Module

Complete audio system for WebSpatial therapy application, handling both inbound (playback) and outbound (capture) audio streams.

## Overview

This module provides:
- **Inbound Audio Pipeline**: WebSocket → Audio Playback
- **Audio Playback System**: PCM16 to Float32 conversion, seamless scheduling
- **Microphone Capture**: Voice input with VAD (Voice Activity Detection)
- **WebSocket Integration**: Real-time bidirectional audio streaming

## Inbound Audio Pipeline

The `InboundAudioPipeline` class manages the complete flow from WebSocket messages to audio playback.

### Features

- ✓ WebSocket message handler registration
- ✓ Base64 audio data extraction and decoding
- ✓ Seamless audio playback with scheduling
- ✓ UI state updates (status callbacks)
- ✓ Error handling and recovery

### Quick Start

```typescript
import { WebSocketClient } from '../api/websocketClient';
import { InboundAudioPipeline } from './audioPipeline';

// 1. Create WebSocket client
const wsClient = new WebSocketClient({ url: 'ws://localhost:3001' });
wsClient.connect();

// 2. Create inbound audio pipeline
const audioPipeline = new InboundAudioPipeline(wsClient);

// 3. Register UI status callback (optional)
audioPipeline.onStatus((status) => {
  console.log('Status:', status);
  // Update your UI: "Robot is speaking...", "Ready to listen", etc.
});

// 4. Listen to state changes (optional)
audioPipeline.onStateChanged((state) => {
  console.log('Pipeline state:', state);
  // State: 'idle' | 'receiving' | 'playing' | 'complete'
});
```

### Message Flow

```
Backend → WebSocket → InboundAudioPipeline → Audio Playback
```

#### Supported Messages

| Message Type | Description | Action |
|-------------|-------------|--------|
| `response_started` | AI begins generating response | Update status: "Therapist is responding..." |
| `audio_chunk` | Audio data chunk (base64 PCM16) | Decode → Convert → Schedule playback |
| `audio_done` | Audio output complete | Keep playing until response_done |
| `response_done` | Full response complete | Update status: "Ready to listen" → Reset |

#### Message Format

```typescript
// Backend sends:
{
  type: 'audio_chunk',
  payload: {
    audio: 'base64-encoded-PCM16-data...'
  }
}

// Pipeline processes:
// 1. Extract base64 from payload.audio
// 2. Decode to ArrayBuffer
// 3. Convert PCM16 → Float32
// 4. Create AudioBuffer
// 5. Schedule seamless playback
```

### Audio Playback System

Located in `audioPlayback.ts`, provides low-level audio processing:

#### Functions

```typescript
// Get or initialize AudioContext (24kHz)
const context = getAudioContext();

// Decode base64 to binary
const audioData = base64ToArrayBuffer(base64String);

// Play audio chunk with seamless scheduling
await playAudioChunk(audioData);

// Reset audio system
resetAudioPlayback();

// Check initialization status
const isReady = isAudioInitialized();
```

#### Technical Details

- **Sample Rate**: 24kHz (matches OpenAI Realtime API)
- **Audio Format**: PCM16 (16-bit signed integers)
- **Conversion**: Int16 → Float32 normalization (-32768..32767 → -1.0..1.0)
- **Scheduling**: Uses `nextPlayTime` tracking for seamless chunk playback
- **Channels**: Mono (1 channel)

### Pipeline States

```typescript
export enum AudioPipelineState {
  IDLE = 'idle',           // No activity
  RECEIVING = 'receiving',  // Receiving audio chunks from backend
  PLAYING = 'playing',      // Audio playback in progress
  COMPLETE = 'complete'     // Response complete, finishing playback
}
```

### UI Status Updates

The pipeline emits status strings suitable for display:

```typescript
audioPipeline.onStatus((status) => {
  // Display status to user:
  // - "Therapist is responding..."  (response_started)
  // - "Robot is speaking..."        (first audio_chunk)
  // - "Ready to listen"             (response_done)
  // - "Audio playback error"        (on error)
});
```

### Error Handling

The pipeline handles errors gracefully:

```typescript
try {
  // Decode and play audio
  await playAudioChunk(audioData);
} catch (error) {
  console.error('Audio playback error:', error);
  // Pipeline automatically:
  // 1. Updates status: "Audio playback error"
  // 2. Resets to IDLE state
  // 3. Logs error details
}
```

### Integration Example

Complete integration with React component:

```typescript
import { useEffect, useState } from 'react';
import { WebSocketClient } from '../api/websocketClient';
import { InboundAudioPipeline } from '../audio/audioPipeline';

function TherapyComponent() {
  const [status, setStatus] = useState('Initializing...');
  const [pipeline, setPipeline] = useState<InboundAudioPipeline | null>(null);

  useEffect(() => {
    // Initialize WebSocket and pipeline
    const wsClient = new WebSocketClient({ url: 'ws://localhost:3001' });
    wsClient.connect();

    const audioPipeline = new InboundAudioPipeline(wsClient);

    // Register status updates
    audioPipeline.onStatus((newStatus) => {
      setStatus(newStatus);
    });

    setPipeline(audioPipeline);

    // Cleanup
    return () => {
      wsClient.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>Therapy Session</h2>
      <p>Status: {status}</p>
    </div>
  );
}
```

## File Structure

```
src/audio/
├── audioPipeline.ts      # Inbound pipeline (WebSocket → Playback)
├── audioPlayback.ts      # Low-level playback (PCM16 → AudioBuffer)
├── micCapture.ts         # Microphone capture
├── vad.ts               # Voice Activity Detection
└── README.md            # This file
```

## See Also

- **WebSocket Client**: `../api/websocketClient.ts`
- **Backend Integration**: `/backend/src/openai/sessionManager.ts`
- **Reference Implementation**: `/archive/index.html` (lines 705-733)
