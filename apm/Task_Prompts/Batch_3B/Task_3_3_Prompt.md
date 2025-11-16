---
task_ref: "Task 3.3 - Integrate Inbound Audio Pipeline (WebSocket to Playback)"
agent_assignment: "Agent_Integration_Connect"
memory_log_path: "/Users/aneshkondor/Coding/Hackathons/Aila/apm/Memory/Phase_03_Integration_Audio_Pipeline/Task_3_3_Integrate_Inbound_Audio_Pipeline.md"
execution_type: "multi-step"
dependency_context: true
ad_hoc_delegation: false
---

# APM Task Assignment: Integrate Inbound Audio Pipeline

## Task Reference
Implementation Plan: **Task 3.3 - Integrate Inbound Audio Pipeline (WebSocket to Playback)** assigned to **Agent_Integration_Connect**

## Context from Dependencies

**This task depends on Task 3.1 (Frontend WebSocket Connection) ✓ COMPLETE**

Task 3.1 provided WebSocket client utilities at `webspatial-client/src/api/websocketClient.ts` with:
- **Message Handling:**
  - `onMessage` handler - Receives messages and routes by type
  - Message format: `{type: string, ...data}`
- **Connection Management:** Active WebSocket connection to backend

**Available Audio Module (from Phase 2):**
- **Audio Playback:** `webspatial-client/src/audio/audioPlayback.ts`
  - AudioContext at 24kHz
  - Buffer creation from base64/PCM chunks
  - Scheduling system for seamless playback

**OpenAI Message Types (from backend):**
Backend forwards OpenAI Realtime API messages including:
- `response.audio.delta` - Audio chunks (contains `delta` field with base64 audio)
- `response.audio.done` - Audio completion signal
- `response.done` - Full response completion

**Integration Instructions:**
Wire WebSocket message handlers to audio playback system to create inbound pipeline.

## Objective
Connect WebSocket message receiver to audio playback system, creating complete inbound audio flow that receives AI response audio chunks from backend and plays them back seamlessly.

## Detailed Instructions
Complete in 4 exchanges, one step per response. **AWAIT USER CONFIRMATION** before proceeding to each subsequent step:

**Step 1: Add Response Message Handlers**
- Location: Extend `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/audio/audioPipeline.ts` (or create separate module)
- Import WebSocket client from `../api/websocketClient`
- Add message type handlers:
  - Handler for `response.audio.delta` - Receives audio chunks
  - Handler for `response.audio.done` - Signals audio completion
  - Handler for `response.done` - Signals full response completion
- Register handlers with WebSocket onMessage router

**Step 2: Extract Audio Data**
- In `response.audio.delta` handler:
  - Extract audio from message `delta` field
  - Audio format: base64-encoded PCM16
  - Parse message structure: `{type: "response.audio.delta", delta: "base64..."}`
- Decode base64 to binary buffer if needed
- Validate audio data exists before processing

**Step 3: Trigger Playback**
- Import audio playback module from `../audio/audioPlayback`
- Pass extracted audio chunks to playback system:
  - Call playback function with decoded audio
  - Playback system handles:
    - Converting PCM16 to Float32
    - Creating AudioBuffer
    - Scheduling for seamless playback
- Track playback state (playing/idle)

**Step 4: Update UI State**
- Import state controller (or create UI state hook)
- Update UI during audio playback:
  - On `response.audio.delta` (first chunk):
    - Set UI status: "Robot is speaking..."
    - Optionally trigger robot animation
  - On `response.audio.done`:
    - Keep status until playback finishes
  - On playback complete:
    - Reset UI status to ready
    - Stop robot animation if active
- Add error handling:
  - Handle missing audio data gracefully
  - Log playback errors
  - Reset UI state on errors

## Expected Output
- **Deliverables:**
  - WebSocket message handlers for audio response events
  - Audio data extraction logic parsing base64 from messages
  - Playback system integration triggering AudioBuffer creation
  - UI state updates showing "Robot is speaking..." during playback
  - Complete inbound audio flow (Backend → WebSocket → Playback)

- **Success Criteria:**
  - Message handlers registered correctly
  - Audio chunks extracted from WebSocket messages
  - Playback triggers successfully
  - Audio plays seamlessly without gaps
  - UI updates during playback
  - Module compiles without TypeScript errors

- **File Locations:**
  - `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/audio/audioPipeline.ts` (or inboundPipeline.ts)
  - WebSocket client: `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/api/websocketClient.ts`
  - Playback: `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/audio/audioPlayback.ts`

## Memory Logging
Upon completion, you **MUST** log your work in:
`/Users/aneshkondor/Coding/Hackathons/Aila/apm/Memory/Phase_03_Integration_Audio_Pipeline/Task_3_3_Integrate_Inbound_Audio_Pipeline.md`

Follow `guides/Memory_Log_Guide.md` instructions for the dynamic-md format with YAML frontmatter.
