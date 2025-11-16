---
task_ref: "Task 2.10 - Integrate OpenAI Realtime API"
agent_assignment: "Agent_Backend"
memory_log_path: "/Users/aneshkondor/Coding/Hackathons/Aila/apm/Memory/Phase_02_Core_Feature_Implementation/Task_2_10_Integrate_OpenAI_Realtime_API.md"
execution_type: "multi-step"
dependency_context: true
ad_hoc_delegation: false
---

# APM Task Assignment: Integrate OpenAI Realtime API

## Task Reference
Implementation Plan: **Task 2.10 - Integrate OpenAI Realtime API** assigned to **Agent_Backend**

## Context from Dependencies

**This task depends on Task 2.12 (Configure Basic Therapist Prompt) ✓ COMPLETE**

Task 2.12 provided the therapist prompt file at:
- **File:** `backend/prompts/therapist_system.txt`
- **Content:** Empathetic AI therapist persona named "Ally"
- **Style:** Brief 2-3 sentence responses, conversational, calming tone
- **Approach:** Active listening, emotional support, non-judgmental, patient

**Integration Instructions:**
You will load this prompt file using Node.js `fs` module and send it as the `instructions` field in the OpenAI `session.update` message.

**Working Reference Code:**
Reference `archive/index.html` lines 428-515 for proven OpenAI Realtime API integration pattern.

## Objective
Establish complete integration with OpenAI Realtime API for conversational AI capabilities, managing WebSocket connection to OpenAI, session configuration with therapist prompts, bidirectional audio streaming, and response handling.

## Detailed Instructions
Complete in 6 exchanges, one step per response. **AWAIT USER CONFIRMATION** before proceeding to each subsequent step:

**Step 1: Create OpenAI WebSocket Client**
- Location: `/Users/aneshkondor/Coding/Hackathons/Aila/backend/src/openai/realtimeClient.ts` (or similar)
- Install required package: `ws` (WebSocket library)
- Create WebSocket client connection to:
  - URL: `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`
  - Headers: `Authorization: Bearer ${process.env.OPENAI_API_KEY}`
  - Headers: `OpenAI-Beta: realtime=v1`
- Load API key from environment variable
- Handle connection open/error/close events

**Step 2: Send Session Configuration**
- Load therapist instructions from `backend/prompts/therapist_system.txt` using `fs.readFileSync`
- Send `session.update` configuration message after connection opens:
  ```json
  {
    "type": "session.update",
    "session": {
      "modalities": ["text", "audio"],
      "instructions": "<loaded from therapist_system.txt>",
      "voice": "alloy",
      "input_audio_format": "pcm16",
      "output_audio_format": "pcm16",
      "input_audio_transcription": {
        "model": "whisper-1"
      },
      "turn_detection": {
        "type": "server_vad",
        "threshold": 0.5,
        "prefix_padding_ms": 300,
        "silence_duration_ms": 200
      }
    }
  }
  ```
- Confirm configuration sent successfully

**Step 3: Implement Audio Input Handler**
- Create handler for incoming audio from frontend WebSocket
- Receive PCM16 audio chunks from frontend
- Format as `input_audio_buffer.append` messages:
  ```json
  {
    "type": "input_audio_buffer.append",
    "audio": "<base64-encoded PCM16 audio>"
  }
  ```
- Convert Int16Array to base64 if needed
- Forward to OpenAI WebSocket

**Step 4: Implement Response Event Handlers**
- Add event listener for OpenAI WebSocket messages
- Parse incoming JSON events
- Handle event types:
  - `session.created` - Log successful session creation
  - `session.updated` - Confirm configuration applied
  - `response.audio_transcript.delta` - Log transcript chunks (optional)
  - `response.audio.delta` - Extract audio chunks (primary handler)
  - `response.audio.done` - Signal audio completion
  - `response.done` - Signal full response completion
  - `error` - Handle API errors

**Step 5: Extract and Forward Audio**
- In `response.audio.delta` handler:
  - Extract audio data from `delta` field
  - Audio format: base64-encoded PCM16
  - Decode base64 to binary buffer if needed
  - Forward audio chunks to frontend via WebSocket:
    ```json
    {
      "type": "audio_chunk",
      "audio": "<base64 audio data>"
    }
    ```
- Track audio playback state

**Step 6: Add Error Handling**
- Handle OpenAI API errors:
  - Connection failures (retry logic with exponential backoff)
  - Invalid API key (log error, notify frontend)
  - Rate limit errors (log and queue requests)
  - Invalid response formats (log and skip malformed messages)
- Add comprehensive logging:
  - Connection events (open, close, error)
  - Message types received
  - Audio chunk sizes
  - Error details
- Implement graceful shutdown:
  - Close OpenAI WebSocket on frontend disconnect
  - Clean up resources

## Expected Output
- **Deliverables:**
  - Functional OpenAI Realtime API integration module
  - WebSocket client connected to `wss://api.openai.com/v1/realtime`
  - Session configuration with therapist instructions from prompt file
  - Audio input handler forwarding frontend audio to OpenAI
  - Response event handlers processing audio deltas and completion events
  - Audio extraction forwarding base64 chunks to frontend
  - Comprehensive error handling and logging

- **Success Criteria:**
  - WebSocket connects to OpenAI successfully
  - Session configuration applied with therapist prompt
  - Audio input forwarded from frontend to OpenAI
  - Audio responses received from OpenAI and forwarded to frontend
  - Error handling prevents crashes
  - Module compiles without TypeScript errors

- **File Locations:**
  - `/Users/aneshkondor/Coding/Hackathons/Aila/backend/src/openai/realtimeClient.ts` (or similar)
  - Prompt file: `/Users/aneshkondor/Coding/Hackathons/Aila/backend/prompts/therapist_system.txt`
  - Reference: `/Users/aneshkondor/Coding/Hackathons/Aila/archive/index.html` (lines 428-515)

## Memory Logging
Upon completion, you **MUST** log your work in:
`/Users/aneshkondor/Coding/Hackathons/Aila/apm/Memory/Phase_02_Core_Feature_Implementation/Task_2_10_Integrate_OpenAI_Realtime_API.md`

Follow `guides/Memory_Log_Guide.md` instructions for the dynamic-md format with YAML frontmatter.
