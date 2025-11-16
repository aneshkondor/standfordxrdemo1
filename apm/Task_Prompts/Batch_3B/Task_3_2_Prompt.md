---
task_ref: "Task 3.2 - Integrate Outbound Audio Pipeline (Mic + VAD to WebSocket)"
agent_assignment: "Agent_Integration_Connect"
memory_log_path: "/Users/aneshkondor/Coding/Hackathons/Aila/apm/Memory/Phase_03_Integration_Audio_Pipeline/Task_3_2_Integrate_Outbound_Audio_Pipeline.md"
execution_type: "multi-step"
dependency_context: true
ad_hoc_delegation: false
---

# APM Task Assignment: Integrate Outbound Audio Pipeline

## Task Reference
Implementation Plan: **Task 3.2 - Integrate Outbound Audio Pipeline (Mic + VAD to WebSocket)** assigned to **Agent_Integration_Connect**

## Context from Dependencies

**This task depends on Task 3.1 (Frontend WebSocket Connection) ✓ COMPLETE**

Task 3.1 provided WebSocket client utilities at `webspatial-client/src/api/websocketClient.ts` with:
- **Connection Management:** WebSocket connection to backend (ws://localhost:3001)
- **Message Functions:**
  - `send(message)` - Sends JSON messages with type field
  - `onMessage` handler - Receives and routes messages by type
- **Lifecycle:** Connection state management, automatic reconnection

**Available Audio Modules (from Phase 2):**
- **VAD:** `webspatial-client/src/audio/vad.ts`
  - `startDetection()`, `stopDetection()`
  - `onSpeechDetected` callback
- **Mic Capture:** `webspatial-client/src/audio/micCapture.ts`
  - `MicrophoneCapture` class
  - 24kHz mono audio capture
  - Emits PCM16 audio chunks

**Integration Instructions:**
Import WebSocket client, VAD module, and Mic Capture module. Wire them together to create the outbound audio pipeline.

## Objective
Connect microphone capture and VAD systems to WebSocket client, creating complete outbound audio flow that detects user speech and transmits audio chunks to backend only when speech is active.

## Detailed Instructions
Complete in 5 exchanges, one step per response. **AWAIT USER CONFIRMATION** before proceeding to each subsequent step:

**Step 1: Connect VAD to Mic Lifecycle**
- Location: Create `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/audio/audioPipeline.ts` (or similar)
- Import VAD module from `../audio/vad`
- Import MicrophoneCapture from `../audio/micCapture`
- Wire VAD lifecycle to mic capture:
  - Call `VAD.startDetection()` when mic initializes
  - Call `VAD.stopDetection()` when mic stops
- Create pipeline initialization function

**Step 2: Implement Speech Detection Callback**
- Import WebSocket client from `../api/websocketClient`
- Implement `onSpeechDetected` callback handler
- When VAD detects speech:
  - Set speech active flag
  - Begin sending mic audio chunks via WebSocket
- When VAD detects silence:
  - Set speech inactive flag
  - Stop sending audio chunks
  - Send buffer commit signal

**Step 3: Wire Audio to WebSocket**
- Configure mic capture to emit audio chunks via callback
- In audio chunk callback:
  - Check if speech is active (from VAD)
  - If active:
    - Convert Int16Array to base64
    - Format as: `{type: "input_audio_buffer.append", audio: base64}`
    - Send via WebSocket client
  - If inactive:
    - Skip chunk (don't send)

**Step 4: Add Buffer Commit Logic**
- When VAD detects speech has stopped:
  - Send `{type: "input_audio_buffer.commit"}` message
  - This signals backend that user has finished speaking
  - Backend can then trigger OpenAI response
- Add debouncing to prevent excessive commits
  - Wait 200-500ms of silence before committing

**Step 5: Coordinate with Therapy State**
- Import TherapyStateController from `../app-shell/TherapyStateController`
- Add state guard:
  - Only activate mic/VAD when therapy state is `active_therapy`
  - Deactivate when state changes to `idle` or `paused`
- Implement lifecycle methods:
  - `startAudioPipeline()` - Called when entering active_therapy
  - `stopAudioPipeline()` - Called when exiting active_therapy
- Expose API for state controller integration

## Expected Output
- **Deliverables:**
  - Audio pipeline module at `webspatial-client/src/audio/audioPipeline.ts`
  - VAD integrated with mic capture lifecycle
  - onSpeechDetected callback triggering audio transmission
  - Audio chunks sent via WebSocket (input_audio_buffer.append)
  - Buffer commit logic sending end-of-speech signal
  - Therapy state coordination activating/deactivating pipeline

- **Success Criteria:**
  - VAD detects speech correctly
  - Audio chunks transmitted only during speech
  - WebSocket sends properly formatted messages
  - Buffer commit sent after speech ends
  - Pipeline activates only in active_therapy state
  - Module compiles without TypeScript errors

- **File Locations:**
  - `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/audio/audioPipeline.ts`
  - WebSocket client: `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/api/websocketClient.ts`
  - VAD: `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/audio/vad.ts`
  - Mic: `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/audio/micCapture.ts`

## Memory Logging
Upon completion, you **MUST** log your work in:
`/Users/aneshkondor/Coding/Hackathons/Aila/apm/Memory/Phase_03_Integration_Audio_Pipeline/Task_3_2_Integrate_Outbound_Audio_Pipeline.md`

Follow `guides/Memory_Log_Guide.md` instructions for the dynamic-md format with YAML frontmatter.
