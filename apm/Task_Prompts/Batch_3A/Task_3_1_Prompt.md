---
task_ref: "Task 3.1 - Establish Frontend-Backend WebSocket Connection"
agent_assignment: "Agent_Integration_Connect"
memory_log_path: "/Users/aneshkondor/Coding/Hackathons/Aila/apm/Memory/Phase_03_Integration_Audio_Pipeline/Task_3_1_Establish_Frontend_Backend_WebSocket_Connection.md"
execution_type: "multi-step"
dependency_context: false
ad_hoc_delegation: false
---

# APM Task Assignment: Establish Frontend-Backend WebSocket Connection

## Task Reference
Implementation Plan: **Task 3.1 - Establish Frontend-Backend WebSocket Connection** assigned to **Agent_Integration_Connect**

## Objective
Create robust WebSocket client infrastructure connecting frontend to backend server, enabling bidirectional real-time communication for audio streaming and session control.

## Detailed Instructions
Complete in 4 exchanges, one step per response. **AWAIT USER CONFIRMATION** before proceeding to each subsequent step:

**Step 1: Create WebSocket Client Utility**
- Location: `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/api/websocketClient.ts`
- Create WebSocket client utility module
- Initialize WebSocket connection to configurable backend URL
- Default URL: `ws://localhost:3001`
- Support URL override for Vision Pro testing (e.g., `ws://192.168.1.x:3001`)
- Implement connection initialization method

**Step 2: Implement Lifecycle Handlers**
- Add `onOpen` handler:
  - Log successful connection
  - Set connection state to connected
  - Notify listeners of successful connection
- Add `onClose` handler:
  - Detect intentional vs unexpected disconnections
  - Log disconnect reason
  - Trigger reconnection logic if unexpected
- Add `onError` handler:
  - Log connection failures with error details
  - Handle connection errors gracefully

**Step 3: Add Message Functions**
- Implement `send(message)` function:
  - Format messages as JSON with `type` field
  - Example: `{type: "audio_chunk", data: ...}`
  - Handle WebSocket readyState checks
  - Queue messages if connection not ready
- Implement `onMessage` handler:
  - Parse incoming JSON messages
  - Route messages by `type` field
  - Support message type handlers/callbacks
  - Handle malformed messages gracefully

**Step 4: Implement Reconnection Logic**
- Add automatic reconnection with exponential backoff:
  - Retry delays: 1s, 2s, 4s, 8s, 16s (capped at 30s)
  - Track retry count and backoff delay
  - Reset retry count on successful connection
- Implement reconnection strategy:
  - Only reconnect on unexpected disconnections
  - Prevent infinite reconnection loops
  - Expose manual disconnect method (no reconnect)
- Add connection state management:
  - States: connecting, connected, disconnecting, disconnected
  - Expose state getter for UI updates

## Expected Output
- **Deliverables:**
  - WebSocket client utility at `webspatial-client/src/api/websocketClient.ts`
  - Configurable backend URL (default ws://localhost:3001)
  - Lifecycle handlers (onOpen, onClose, onError)
  - Message send/receive functions with JSON formatting
  - Automatic reconnection with exponential backoff

- **Success Criteria:**
  - WebSocket connects to backend successfully
  - Connection lifecycle events logged correctly
  - Messages sent and received properly
  - Reconnection works after temporary disconnects
  - Module compiles without TypeScript errors

- **File Locations:**
  - `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/api/websocketClient.ts`

## Memory Logging
Upon completion, you **MUST** log your work in:
`/Users/aneshkondor/Coding/Hackathons/Aila/apm/Memory/Phase_03_Integration_Audio_Pipeline/Task_3_1_Establish_Frontend_Backend_WebSocket_Connection.md`

Follow `guides/Memory_Log_Guide.md` instructions for the dynamic-md format with YAML frontmatter.
