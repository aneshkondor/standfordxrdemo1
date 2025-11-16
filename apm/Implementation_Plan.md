# Aila VR Therapy App – Implementation Plan

**Memory Strategy:** dynamic-md
**Last Modification:** Initial creation by Setup Agent
**Project Overview:** Vision Pro spatial wellbeing companion app using WebSpatial, featuring conversational AI therapy sessions with a 3D robot therapist. Built for 18-hour hackathon timeline, prioritizing working demo with dashboard, tone selection, therapy mode, and real-time voice conversation powered by OpenAI Realtime API.

---

## Phase 1: Foundation Setup

### Task 1.1 – Initialize WebSpatial React Project │ Agent_Frontend_Core
- **Objective:** Establish WebSpatial React development environment with TypeScript, Three.js dependencies, and project structure ready for spatial UI component development.
- **Output:** Functioning React project with WebSpatial SDK configured, Three.js installed, TypeScript compilation working, and organized folder structure (`src/` containing `app-shell/`, `components/`, `layout/`, `api/`, `audio/` directories).
- **Guidance:** Use Vite for fastest setup or Create React App for stability. Install `@webspatial/react-sdk`, `three`, `@types/three`, `@react-three/fiber` (if using React Three Fiber pattern). Configure tsconfig.json for strict type checking. Create folder structure following spatial app architecture pattern.

- Create React project with TypeScript using Vite (recommended for speed) or Create React App (recommended for stability)
- Install WebSpatial React SDK (@webspatial/react-sdk) and verify installation with simple import test
- Install Three.js and required loaders (three, @types/three, @react-three/fiber for React pattern)
- Configure basic project structure with organized directories: src/app-shell/, src/components/, src/layout/, src/api/, src/audio/

### Task 1.2 – Initialize Backend Node.js Server │ Agent_Backend
- **Objective:** Establish Node.js backend development environment with TypeScript, Express framework, WebSocket library, and organized project structure ready for REST endpoints and realtime audio streaming implementation.
- **Output:** Functioning Node.js project with Express server configured, WebSocket library installed, TypeScript compilation working, and organized folder structure (`src/`, `routes/`, `data/users/`, `prompts/` directories with proper initialization).
- **Guidance:** Use npm init for Node.js project initialization. Install TypeScript with @types/node for type safety. Add Express and ws for HTTP and WebSocket capabilities. Create data/users/ for JSON file storage, prompts/ for AI prompt templates. Ensure all TypeScript dependencies are properly configured.

- Create Node.js project with TypeScript configuration (npm init, install typescript, @types/node, ts-node for development)
- Install Express framework and TypeScript types (express, @types/express) for REST endpoint implementation
- Install WebSocket library and types (ws, @types/ws) for realtime audio streaming capability
- Create organized project structure: src/ for source code, routes/ for Express routes, data/users/ for session storage, prompts/ for AI prompt templates

### Task 1.3 – Configure Environment Variables and .gitignore │ Agent_Integration_Connect
- **Objective:** Set up secure environment configuration for OpenAI API key storage and ensure sensitive files are excluded from git tracking, preparing for local development and future cloud deployment.
- **Output:** Environment configuration files (backend/.env.example with placeholders, backend/.env ready for API key), updated .gitignore excluding .env files and node_modules/, with clear instructions for user to populate API key.
- **Guidance:** Create .env.example as template with OPENAI_API_KEY= placeholder and PORT=3001 default. Create actual .env file with same structure for user population. Update .gitignore to exclude .env, node_modules/, build artifacts. Remind user to add their OpenAI Realtime API key to .env before running backend.

- Create backend/.env.example file with OPENAI_API_KEY= placeholder and PORT=3001 configuration template
- Create backend/.env file for user to populate with actual API key (include comment reminder for user to add their OpenAI Realtime API key)
- Update .gitignore in project root to exclude .env files, node_modules/, and common build artifacts if not already present

---

## Phase 2: Core Feature Implementation

### Task 2.1 – Build Dashboard Center Panel Component │ Agent_Frontend_Core
- **Objective:** Create the main dashboard interface with therapy session initiation capability, serving as the primary entry point for users in the spatial app.
- **Output:** Functional React component (CenterDashboard.tsx) using WebSpatial panel wrapper, containing centered "Start Therapy" button with click handler that triggers mode state change, with basic styling for visibility in spatial environment.
- **Guidance:** Use WebSpatial panel component for spatial layout integration. Implement onClick handler that updates application state to transition from idle to therapy mode. Keep styling minimal but ensure button is visible and accessible in VR environment. Component should be responsive to state changes from parent controller.

- Create CenterDashboard.tsx component with WebSpatial panel wrapper for spatial layout integration
- Add "Start Therapy" button with onClick handler that triggers state update to initiate therapy mode transition
- Add basic layout structure with button centered and simple styling for clear visibility in spatial environment

### Task 2.2 – Build Tone Selector Panel Component │ Agent_Frontend_Core
- **Objective:** Create left-positioned spatial panel allowing users to select AI therapist tone/persona, enabling personalization of therapy experience.
- **Output:** Functional React component (LeftTonePanel.tsx) using WebSpatial panel wrapper, containing tone preset buttons (Soft, Friendly, Analytical) with visual selection indication, implementing state management to track and expose selected tone via callback.
- **Guidance:** Use WebSpatial panel component positioned to left of main dashboard. Implement three tone preset buttons with clear visual distinction. Add state management using React useState to track selected tone. Expose selection via callback prop to parent component. Include visual feedback for currently selected tone (highlighting, color change, or checkmark).

- Create LeftTonePanel.tsx component with WebSpatial panel wrapper for left spatial positioning
- Add tone preset buttons (Soft, Friendly, Analytical) with clear labels and visual indication of currently selected tone
- Implement state management for selected tone using React state, exposing selection via callback prop to parent

### Task 2.3 – Implement Robot 3D Scene with Placeholder Model │ Agent_Frontend_Core
- **Objective:** Create Three.js-based 3D scene displaying robot therapist in spatial environment, establishing visual presence for AI conversation partner with temporary placeholder geometry until team provides USDZ model.
- **Output:** Functional React component (Robot3DScene.tsx) containing Three.js scene with camera and renderer, displaying friendly placeholder robot geometry (colored sphere head + cylinder body, approximately 3 feet tall), positioned appropriately in front of user, with ambient and directional lighting, integrated with WebSpatial spatial scene container.
- **Guidance:** Use Three.js within React component (@react-three/fiber recommended). Create simple placeholder geometry using SphereGeometry for head and CylinderGeometry for body. Scale to approximately 0.9 meters (3 feet) total height. Position robot at z: -2.5 to -3 meters from user. Add warm colors (sky blue, light cyan) for friendly appearance. Configure camera with FOV 75, near 0.1, far 100. Add ambient light (0.6 intensity) and directional light for depth. Integrate with WebSpatial spatial scene container for proper spatial rendering.

- Create Robot3DScene.tsx component with Three.js scene, PerspectiveCamera, and WebGLRenderer setup
- Add simple placeholder geometry for robot: SphereGeometry for head, CylinderGeometry for body, warm friendly colors, scaled to ~3 feet tall, positioned 2.5-3m in front of user
- Configure scene lighting with ambient light (intensity 0.6) and directional light for visibility and depth perception
- Integrate with WebSpatial spatial scene container for proper rendering in spatial environment

### Task 2.4 – Implement Voice Activity Detection (VAD) System │ Agent_Frontend_Audio
- **Objective:** Create voice activity detection system to identify when user is speaking versus silent, enabling cost-effective OpenAI API usage by preventing transmission of silence or background noise.
- **Output:** Functional VAD module with Web Audio API AnalyserNode implementation, configured detection thresholds distinguishing speech from silence, debouncing logic to prevent false triggers, and clean API exposing startDetection(), stopDetection(), and onSpeechDetected callback for integration with audio pipeline.
- **Guidance:** Depends on: Research findings from ad-hoc delegation step. Implement using Web Audio API AnalyserNode for frequency domain analysis or RMS energy calculation. Configure threshold values through testing (typical RMS threshold: 0.01-0.05, frequency threshold: varies by environment). Add debouncing with minimum speech duration (e.g., 100-300ms) to prevent false positives from brief noise. Expose clean module interface for integration with mic capture pipeline.

1. **Ad-Hoc Delegation – Research VAD Algorithms:** Delegate research of simple VAD algorithms (energy-based RMS calculation vs frequency-based analysis) to determine optimal approach for WebSpatial environment.
2. **Implement VAD Core:** Implement VAD using Web Audio API AnalyserNode, applying research findings to choose between frequency domain analysis or RMS energy calculation method.
3. **Configure Detection Thresholds:** Configure and tune detection thresholds to distinguish speech from silence, implementing debouncing logic to prevent false triggers from transient noise.
4. **Expose VAD API:** Create clean VAD module interface with startDetection(), stopDetection() methods and onSpeechDetected callback for pipeline integration.

### Task 2.5 – Implement Microphone Capture Pipeline │ Agent_Frontend_Audio
- **Objective:** Create complete microphone audio capture system that acquires user voice input, processes it through AudioWorklet for efficient chunk extraction, and outputs PCM16 format audio chunks ready for WebSocket transmission to backend.
- **Output:** Functional microphone capture module with MediaDevices getUserMedia configured for 24kHz mono audio with echo cancellation, AudioContext with MediaStreamSource processing, AudioWorklet processor extracting audio chunks (similar to archive/index.html pattern), Float32-to-Int16 PCM conversion, and callback-based chunk emission for downstream processing.
- **Guidance:** Reference archive/index.html lines 572-625 for working implementation pattern. Use getUserMedia with constraints: sampleRate 24000, channelCount 1, echoCancellation true, noiseSuppression true. Create AudioContext at 24kHz sample rate. Implement AudioWorklet processor following archive pattern (lines 689-703) for chunk extraction. Convert Float32 samples to Int16 PCM format (multiply by 32768, clamp to -32768/32767 range). Emit chunks via callback for VAD and WebSocket integration. Handle browser permission prompts gracefully.

1. **Set up getUserMedia:** Configure MediaDevices.getUserMedia() with audio constraints (24kHz sample rate, mono channel, echo cancellation, noise suppression) and handle permission prompts.
2. **Create AudioContext Pipeline:** Create AudioContext at 24kHz sample rate and MediaStreamSource from microphone stream for audio processing chain.
3. **Implement AudioWorklet Processor:** Implement AudioWorklet processor for efficient audio chunk extraction, following archive/index.html pattern (lines 689-703) for real-time processing.
4. **Convert and Emit Audio:** Convert Float32 audio samples to Int16 PCM format (multiply by 32768, clamp range) and emit chunks via callback for downstream processing.

### Task 2.6 – Implement Audio Playback System │ Agent_Frontend_Audio
- **Objective:** Create audio playback system that receives OpenAI AI response audio chunks and plays them back seamlessly with proper scheduling to avoid gaps or overlaps, providing natural-sounding AI voice responses.
- **Output:** Functional audio playback module with AudioContext configured for 24kHz playback matching OpenAI output, buffer creation logic converting base64/PCM audio chunks to AudioBuffers, and scheduling system tracking nextPlayTime to queue and play chunks seamlessly without gaps.
- **Guidance:** Reference archive/index.html lines 705-733 for working playback pattern. Create dedicated AudioContext for playback at 24kHz to match OpenAI output format. Implement buffer creation from incoming chunks: decode base64 if needed, convert Int16 PCM to Float32 (divide by 32768), create AudioBuffer. Implement scheduling using AudioBufferSourceNode.start(time) with nextPlayTime tracking to queue chunks sequentially. Update nextPlayTime by adding buffer duration after each chunk scheduled. This prevents gaps and ensures smooth continuous playback.

1. **Create Playback AudioContext:** Create dedicated AudioContext for playback at 24kHz sample rate to match OpenAI Realtime API output format.
2. **Implement Buffer Creation:** Implement buffer creation from base64/binary PCM audio chunks, converting Int16 to Float32 format and creating AudioBuffers for playback.
3. **Implement Scheduling Logic:** Implement audio chunk scheduling for seamless playback, tracking nextPlayTime and queueing chunks sequentially to avoid gaps or overlaps.

### Task 2.7 – Build Therapy Mode State Controller │ Agent_Frontend_Core
- **Objective:** Create centralized state management system controlling therapy session lifecycle and mode transitions, coordinating visibility and behavior of all UI components based on current application state.
- **Output:** Functional state controller module defining therapy states (idle, active_therapy, paused), implementing transition handler methods (startTherapy, pauseTherapy, exitTherapy), session lifecycle management (initialization with tone selection, cleanup on exit), and component visibility coordination (showing/hiding Dashboard vs Robot scene based on current state).
- **Guidance:** Use React useState or state management library (Zustand, Redux) for state management. Define clear state enum or type: idle (dashboard visible), active_therapy (robot scene visible, audio active), paused (therapy scene visible but audio inactive). Implement transition handlers that validate state changes and update component visibility. Add session lifecycle methods: startTherapy receives selected tone, initializes audio systems; exitTherapy cleans up audio contexts and resets to idle. Expose state and handlers to child components via props or context.

1. **Define Therapy States:** Define therapy state enum/type (idle, active_therapy, paused) using React state or state management library for centralized control.
2. **Implement Transition Handlers:** Implement mode transition handler methods (startTherapy, pauseTherapy, exitTherapy) with state validation and update logic.
3. **Add Session Lifecycle:** Add session lifecycle management methods: initialization accepting tone selection, cleanup on exit resetting audio systems and state.
4. **Coordinate Component Visibility:** Implement component visibility coordination logic showing/hiding Dashboard vs Robot scene based on current therapy state.

### Task 2.8 – Create Core Session REST Endpoints │ Agent_Backend
- **Objective:** Implement REST API endpoints managing therapy session lifecycle, enabling session initiation with user context loading and session completion with transcript/memory persistence.
- **Output:** Functional Express routes (src/routes/session.ts) registered with main server, implementing POST /session/start endpoint (accepting userId and tonePreset, loading user memory, returning mode and memory summary), and POST /session/end endpoint (accepting sessionId and transcript, saving markdown transcript to sessions directory, updating memory.json with session summary).
- **Guidance:** Depends on: Task 2.11 Output (storage utilities). Create Express router in src/routes/session.ts and register with main app. For /session/start: validate userId and tonePreset in request body, use storage utilities to load data/users/{userId}/memory.json, determine mode (intake if no memory exists, ongoing if memory exists), return response with mode, memory narrative summary, and applied tone. For /session/end: validate sessionId and transcript, use storage utilities to write markdown transcript to data/users/{userId}/sessions/{timestamp}.md, update memory.json with session summary (extract key points from transcript). Return success confirmation.

1. **Create Express Routes File:** Create Express routes file (src/routes/session.ts) defining session endpoints and register router with main Express application.
2. **Implement POST /session/start:** Implement POST /session/start endpoint accepting userId and tonePreset in request body, validating inputs and triggering session initialization.
3. **Add Memory Loading:** Add memory loading logic using storage utilities from Task 2.11 to read data/users/{userId}/memory.json and return narrative summary for AI context.
4. **Implement POST /session/end:** Implement POST /session/end endpoint accepting sessionId and transcript in request body for session completion handling.
5. **Add Session Saving:** Add session saving logic using storage utilities to write markdown transcript to sessions/ directory and update memory.json with extracted session summary.

### Task 2.9 – Build WebSocket Audio Streaming Server │ Agent_Backend
- **Objective:** Create WebSocket server infrastructure for bidirectional audio streaming between frontend and backend, enabling real-time communication for voice-based therapy sessions.
- **Output:** Functional WebSocket server using ws library attached to Express server, implementing connection lifecycle handlers (onConnection tracking clients, onDisconnect cleanup), message routing system parsing incoming messages and dispatching to appropriate handlers based on message type, and error handling with graceful disconnection and logging.
- **Guidance:** Create WebSocket server instance using ws library, attaching to existing Express HTTP server. Implement connection handler storing connected clients in Map for tracking. Add message event listener parsing JSON messages and routing by type field (e.g., audio_chunk, session_control, etc.). Implement disconnection handler removing client from tracking Map and cleaning up resources. Add error handler logging errors and gracefully closing connections. Support multiple concurrent clients for potential multi-user scenarios.

1. **Create WebSocket Server:** Create WebSocket server instance using ws library and attach to Express HTTP server for shared port usage.
2. **Implement Connection Handling:** Implement WebSocket connection lifecycle handlers tracking connected clients on connection and cleaning up resources on disconnection.
3. **Add Message Routing:** Add message routing system parsing incoming JSON messages and dispatching to appropriate handlers based on message type field.
4. **Implement Error Handling:** Implement comprehensive error handling and connection cleanup with graceful disconnect handling and error logging.

### Task 2.10 – Integrate OpenAI Realtime API │ Agent_Backend
- **Objective:** Establish complete integration with OpenAI Realtime API for conversational AI capabilities, managing WebSocket connection to OpenAI, session configuration with therapist prompts, bidirectional audio streaming, and response handling.
- **Output:** Functional OpenAI Realtime API integration with WebSocket client connected to wss://api.openai.com/v1/realtime, session configuration sending therapist instructions and voice settings, audio input handler receiving PCM16 chunks from frontend and forwarding to OpenAI, response event handlers processing audio deltas and completion events, audio extraction forwarding base64-decoded chunks to frontend, and comprehensive error handling for API errors and connection issues.
- **Guidance:** Depends on: Task 2.12 Output (therapist prompt file). Reference archive/index.html lines 428-515 for working integration pattern. Create WebSocket client to wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01 using API key from .env. Send session.update with instructions loaded from prompts/therapist_system.txt. Implement audio input handler receiving frontend audio chunks, formatting as input_audio_buffer.append messages. Handle response events: response.output_audio.delta (extract audio from delta field), response.done (signal completion). Decode base64 audio and forward to frontend via WebSocket. Add error handling for API errors, connection failures, and invalid responses.

1. **Create OpenAI WebSocket Client:** Create WebSocket client connection to wss://api.openai.com/v1/realtime with API key from environment, configuring model version.
2. **Send Session Configuration:** Send session.update configuration message with therapist instructions from prompt file and voice settings for AI persona.
3. **Implement Audio Input Handler:** Implement audio input handler receiving PCM16 chunks from frontend WebSocket and forwarding to OpenAI as input_audio_buffer.append messages.
4. **Implement Response Event Handlers:** Implement response event handlers processing OpenAI events (response.output_audio.delta for audio chunks, response.done for completion signals).
5. **Extract and Forward Audio:** Extract audio data from response.output_audio.delta events, decode base64 format, and forward chunks to frontend via WebSocket.
6. **Add Error Handling:** Add comprehensive error handling for OpenAI API errors, connection issues, and invalid response formats with appropriate logging.

### Task 2.11 – Implement Session JSON Storage System │ Agent_Backend
- **Objective:** Create file-based storage utilities managing user data persistence for profiles, memory, and session transcripts, providing foundation for session state management and long-term user context retention.
- **Output:** Functional storage utility module with directory management functions ensuring data/users/{userId}/ structure exists, profile.json operations (creating default profiles, reading/updating user preferences), memory.json operations (loading memory summaries, updating after sessions), and session transcript storage (writing markdown files to sessions/ directory with timestamp-based naming).
- **Guidance:** Create storage utilities module in src/utils/storage.ts or similar. Implement directory creation using fs.promises.mkdir with recursive option to ensure data/users/{userId}/, sessions/, and summaries/ subdirectories exist. For profile.json: create default with userId, createdAt, preferredTone, implement read/update functions. For memory.json: implement load returning narrative summary and key themes, implement update accepting session summary and appending to memory. For session transcripts: write markdown files with timestamp filenames (YYYY-MM-DD_HH-mm-ss.md) containing conversation log. Use async/await for all file operations.

1. **Create Directory Management:** Create utility functions for directory management using Node.js fs module, ensuring data/users/{userId}/ structure with subdirectories exists recursively.
2. **Implement Profile Operations:** Implement profile.json operations including creating default user profiles with initial preferences and reading/updating user preference fields.
3. **Implement Memory Operations:** Implement memory.json operations for loading existing memory summary and narrative, and updating memory after sessions with new insights.
4. **Implement Session Storage:** Implement session transcript storage writing markdown files to sessions/ directory with timestamp-based naming (YYYY-MM-DD_HH-mm-ss.md format).

### Task 2.12 – Configure Basic Therapist Prompt │ Agent_Backend
- **Objective:** Create foundational AI therapist prompt configuration defining personality, tone, and response behavior for MVP testing, adaptable for future enhancement with specialized therapy techniques.
- **Output:** Therapist prompt file (prompts/therapist_system.txt) containing empathetic therapist persona adapted from archive/index.html line 453, including instructions for brief 2-3 sentence responses, warm supportive tone, and non-judgmental approach, with reference integration in OpenAI session configuration code.
- **Guidance:** Reference archive/index.html line 453 for proven prompt structure. Create prompts/therapist_system.txt file. Include: role definition (warm empathetic AI therapist named Ally), communication style (brief 2-3 sentence responses, conversational, calming), approach (active listening, emotional support, non-judgmental, patient). Keep prompt concise for MVP (under 200 words). User will provide enhanced therapy-specific prompts later. Ensure Task 2.10 implementation loads this file and includes content in session.update instructions field.

- Create prompts/therapist_system.txt file with basic empathetic therapist persona, adapting proven prompt structure from archive/index.html line 453
- Include clear instructions for brief responses (2-3 sentences maximum), warm supportive tone, and non-judgmental active listening approach
- Ensure prompt file is referenced and loaded in OpenAI session configuration code from Task 2.10 for AI instruction initialization

---

## Phase 3: Integration & Audio Pipeline

### Task 3.1 – Establish Frontend-Backend WebSocket Connection │ Agent_Integration_Connect
- **Objective:** Create robust WebSocket client infrastructure connecting frontend to backend server, enabling bidirectional real-time communication for audio streaming and session control.
- **Output:** Functional WebSocket client utility module connecting to configurable backend URL (ws://localhost:3001 or user-specified), implementing comprehensive connection lifecycle handlers (onOpen, onClose, onError events with logging), message send/receive functions supporting JSON message formatting and type-based parsing, and reconnection logic with retry mechanism using exponential backoff for resilience.
- **Guidance:** Create WebSocket client utility module (e.g., src/api/websocketClient.ts). Initialize WebSocket connection to configurable URL (default ws://localhost:3001, allow override for Vision Pro testing with laptop IP). Implement lifecycle handlers: onOpen logging successful connection, onClose detecting intentional vs unexpected disconnections, onError logging connection failures. Create send function wrapping messages in JSON with type field. Create receive handler parsing incoming JSON and routing by message type. Implement reconnection with exponential backoff (1s, 2s, 4s, max 30s delays) for automatic recovery from temporary network issues.

1. **Create WebSocket Client Utility:** Create WebSocket client utility module with connection to configurable backend URL (ws://localhost:3001 default, support override for deployment).
2. **Implement Lifecycle Handlers:** Implement comprehensive connection lifecycle handlers (onOpen for success logging, onClose for disconnect detection, onError for failure handling).
3. **Add Message Functions:** Add message send function formatting JSON messages with type field, and receive function parsing incoming JSON and routing by message type.
4. **Implement Reconnection Logic:** Implement automatic reconnection with exponential backoff strategy (retry delays: 1s, 2s, 4s, capped at 30s) for network resilience.

### Task 3.2 – Integrate Outbound Audio Pipeline (Mic + VAD to WebSocket) │ Agent_Integration_Connect
- **Objective:** Connect microphone capture and VAD systems to WebSocket client, creating complete outbound audio flow that detects user speech and transmits audio chunks to backend only when speech is active, optimizing API cost efficiency.
- **Output:** Functional outbound audio pipeline with VAD module integrated with mic capture lifecycle (starting VAD when mic initializes, stopping when mic stops), onSpeechDetected callback implementation triggering audio chunk transmission, mic audio chunk wiring to WebSocket send formatted as input_audio_buffer.append messages, audio buffer commit logic sending input_audio_buffer.commit when speech stops, and therapy state coordination ensuring audio capture only operates in active_therapy state.
- **Guidance:** Depends on: Task 3.1 Output (WebSocket client). Wire VAD lifecycle to mic capture: call VAD.startDetection() when mic starts, VAD.stopDetection() when mic stops. Implement onSpeechDetected callback: when VAD detects speech, begin sending mic audio chunks via WebSocket. Format outgoing messages as {type: "input_audio_buffer.append", audio: base64EncodedPCM}. When VAD detects silence, send {type: "input_audio_buffer.commit"} to signal end of user speech. Add state guard: only activate mic/VAD when therapy state is active_therapy. Coordinate with state controller to start/stop audio pipeline on mode transitions.

1. **Connect VAD to Mic Lifecycle:** Connect VAD module lifecycle to mic capture, starting VAD when mic initializes and stopping VAD when mic capture ends.
2. **Implement Speech Detection Callback:** Implement onSpeechDetected callback handler that initiates audio chunk transmission when VAD detects active speech.
3. **Wire Audio to WebSocket:** Wire mic audio chunks to WebSocket send function, formatting messages as input_audio_buffer.append with base64-encoded PCM audio data.
4. **Add Buffer Commit Logic:** Add audio buffer commit logic sending input_audio_buffer.commit message when VAD detects speech has stopped.
5. **Coordinate with Therapy State:** Coordinate audio pipeline with therapy state controller, activating capture only in active_therapy state and deactivating on state transitions.

### Task 3.3 – Integrate Inbound Audio Pipeline (WebSocket to Playback) │ Agent_Integration_Connect
- **Objective:** Connect WebSocket message receiver to audio playback system, creating complete inbound audio flow that receives AI response audio chunks from backend and plays them back to user with proper synchronization.
- **Output:** Functional inbound audio pipeline with WebSocket message handlers for audio response events (response.output_audio.delta, response.done), audio data extraction logic parsing base64 or binary audio chunks from messages, playback system integration triggering AudioBuffer creation and scheduling for received chunks, and UI state updates showing "Robot is speaking..." status during playback with optional robot animation coordination.
- **Guidance:** Depends on: Task 3.1 Output (WebSocket client). Add WebSocket message type handlers: "response.output_audio.delta" for audio chunks, "response.done" for completion signal. Extract audio from delta field in messages (base64 format from OpenAI). Pass extracted audio to playback system from Task 2.6, triggering buffer creation and scheduling. Update UI state during playback: set status text to "Robot is speaking...", optionally trigger robot animation if implemented. Reset status on response.done event. Handle playback errors gracefully.

1. **Add Response Message Handlers:** Add WebSocket message type handlers for audio response events (response.output_audio.delta for audio chunks, response.done for completion).
2. **Extract Audio Data:** Extract audio data from response messages, parsing base64 or binary format from delta field in message payload.
3. **Trigger Playback:** Pass extracted audio chunks to playback system from Task 2.6, triggering AudioBuffer creation and scheduling for seamless output.
4. **Update UI State:** Update UI state during audio playback showing "Robot is speaking..." status message and optionally animating robot model if animation implemented.

### Task 3.4 – Wire UI Components to Therapy State Controller │ Agent_Integration_Assemble
- **Objective:** Connect all UI components to centralized state controller, establishing complete interaction flow from user input through state transitions to component visibility changes, creating cohesive user experience.
- **Output:** Fully interactive UI with Dashboard "Start Therapy" button connected to state controller (calling startTherapy handler with selected tone parameter), Tone Selector wired to state (updating state on tone changes, passing tone to session/start), Robot Scene visibility connected to therapy state (showing scene in active_therapy mode, hiding in idle mode), and complete state flow validation (idle → select tone → start therapy → active_therapy → robot visible transition working correctly).
- **Guidance:** Depends on: Task 3.1 Output by Agent_Integration_Connect (WebSocket for backend calls). Connect Dashboard component: wire "Start Therapy" button onClick to call state controller's startTherapy() method, passing currently selected tone from Tone Selector. Wire Tone Selector: implement callback updating state controller when user changes tone selection, ensure tone is passed to backend /session/start call. Wire Robot Scene: implement conditional rendering based on therapy state (show when state === "active_therapy", hide when state === "idle"). Test complete flow: verify user can select tone, click Start Therapy, see robot scene appear, and interact with therapy mode.

1. **Connect Dashboard Button:** Connect Dashboard "Start Therapy" button to state controller, wiring onClick handler to call startTherapy() method with selected tone parameter.
2. **Wire Tone Selector State:** Wire Tone Selector component to state management, updating controller state when user changes tone selection and passing tone to backend session initialization.
3. **Connect Robot Scene Visibility:** Connect Robot Scene component visibility to therapy state, implementing conditional rendering showing scene in active_therapy and hiding in idle state.
4. **Validate State Flow:** Validate complete state transition flow from idle through tone selection to therapy activation, ensuring robot scene visibility changes correctly.

### Task 3.5 – Integrate Robot Model Loading │ Agent_Integration_Assemble
- **Objective:** Replace placeholder robot geometry with actual USDZ model from design team, converting format if needed and ensuring proper scaling and positioning in spatial scene.
- **Output:** Realistic robot model loaded in 3D scene, with format conversion from USDZ to GLB/GLTF if required, Robot3DScene updated to load actual model using GLTFLoader with proper scale configuration (~3 feet tall) and position settings, and placeholder geometry removed with loaded model integrated into scene.
- **Guidance:** Begin with ad-hoc research of USDZ to GLB/GLTF conversion approaches. Coordinate with user for USDZ file location when ready (or continue with placeholder if not available). If conversion needed, use tools like Blender, online converters (e.g., gltf.report), or command-line utilities (usd2gltf if available). Update Robot3DScene component to use GLTFLoader instead of geometric primitives. Configure model scale to achieve approximately 0.9m (3 feet) height. Adjust position for natural placement in front of user (z: -2.5 to -3m). Remove placeholder geometry code. Test model loads correctly in WebSpatial environment.

1. **Ad-Hoc Delegation – Research Format Conversion:** Delegate research of USDZ to WebXR-compatible format (GLB/GLTF) conversion methods and tools for optimal quality and compatibility.
2. **Coordinate for Model File:** Coordinate with user to obtain USDZ robot model file location, or confirm to continue with placeholder geometry if model not yet ready.
3. **Convert Model Format:** Convert USDZ to GLB/GLTF format if needed using researched conversion tools (Blender, online converters, or command-line utilities).
4. **Update Scene Loader:** Update Robot3DScene component to use GLTFLoader for loading actual model file, configuring proper scale (~0.9m height) and position (2.5-3m from user).
5. **Replace Placeholder:** Remove placeholder geometry code (sphere + cylinder) and integrate loaded GLTF model into Three.js scene with proper materials and lighting.

### Task 3.6 – End-to-End Flow Testing and Bug Fixes │ Agent_Integration_Assemble
- **Objective:** Validate complete system integration through comprehensive testing of full user journey, identifying and fixing integration bugs to achieve working demo ready for Vision Pro deployment.
- **Output:** Validated working demo with complete local flow tested (backend running, frontend running, dashboard → tone selection → therapy mode → conversation working), audio pipeline validation (mic capture functioning, VAD detecting speech correctly, OpenAI responses received, audio playback working), integration issues debugged and fixed (console errors resolved, WebSocket connection stable, audio flow continuous, state transitions smooth), Vision Pro deployment configured (WebSocket URL updated to laptop IP address, HTTPS configured if required), and hardware validation completed through user testing on actual Vision Pro device with device-specific issues resolved.
- **Guidance:** Depends on: Task 3.1 output by Agent_Integration_Connect, Task 3.2 output by Agent_Integration_Connect, Task 3.3 output by Agent_Integration_Connect, Task 3.4, 3.5 output. Start both servers: backend (npm run dev or node server.js), frontend (npm run dev). Test complete user flow locally: load app, verify dashboard appears, select tone, click Start Therapy, verify robot scene appears, speak into mic, verify VAD detection, confirm OpenAI response, verify audio playback. Check browser console and server logs for errors. Debug WebSocket connection issues, audio pipeline problems, state management bugs. For Vision Pro testing: update WebSocket URL to laptop's local IP (e.g., ws://192.168.1.x:3001), ensure both devices on same WiFi, configure HTTPS if WebSpatial requires it. Coordinate with user for hardware testing, iterate on device-specific issues (performance, audio quality, model visibility).

1. **Test Complete Local Flow:** Test complete user journey locally starting both backend and frontend servers, verifying dashboard → tone selection → therapy activation → conversation flow works end-to-end.
2. **Validate Audio Pipeline:** Validate complete audio pipeline functionality testing mic capture, VAD speech detection, OpenAI API responses, and audio playback quality and synchronization.
3. **Debug Integration Issues:** Debug and fix integration issues checking console errors, WebSocket connection stability, audio flow continuity, and state transition smoothness.
4. **Configure Vision Pro Deployment:** Configure deployment settings for Vision Pro testing, updating WebSocket URL to laptop's local network IP address and configuring HTTPS if required.
5. **Coordinate Hardware Validation:** Coordinate with user for Vision Pro hardware testing, validating actual device experience and fixing device-specific issues (performance, audio, rendering).

---

## Phase 4: Testing & Polish

### Task 4.1 – Performance Optimization and Smoothness Validation │ Agent_Integration_Polish
- **Objective:** Optimize system performance for smooth natural user experience on Vision Pro hardware, measuring and improving audio latency, 3D rendering frame rate, and network responsiveness.
- **Output:** Optimized demo experience with performance profiling completed (audio latency measured, frame rate monitored, WebSocket lag identified, bottlenecks documented), 3D rendering optimizations applied if needed (geometry complexity reduced, material shaders optimized, lighting simplified), audio pipeline optimizations implemented if needed (buffer sizes tuned, VAD sensitivity latency minimized, playback scheduling adjusted), and Vision Pro hardware validation confirming smooth experience with user feedback incorporated.
- **Guidance:** Use browser DevTools Performance tab to profile application. Measure audio end-to-end latency (mic → VAD → WebSocket → OpenAI → WebSocket → playback). Monitor Three.js rendering frame rate (target 60fps minimum, 90fps ideal for VR). Check WebSocket message round-trip time. Identify bottlenecks: if rendering slow, reduce robot geometry complexity or simplify materials; if audio laggy, adjust AudioWorklet buffer sizes or reduce VAD processing overhead; if network slow, optimize message batching or compression. Test on Vision Pro hardware with user, gather feedback on smoothness, adjust based on real-world experience.

1. **Profile Performance:** Profile application performance measuring audio end-to-end latency, 3D rendering frame rate, WebSocket message lag, identifying system bottlenecks.
2. **Optimize 3D Rendering:** Optimize 3D rendering if needed by reducing geometry complexity, simplifying material shaders, and adjusting lighting configuration for better performance.
3. **Optimize Audio Pipeline:** Optimize audio pipeline if needed by tuning buffer sizes, reducing VAD processing latency, and adjusting playback chunk scheduling parameters.
4. **Validate on Hardware:** Coordinate with user for Vision Pro hardware performance validation, testing smoothness and responsiveness, adjusting optimizations based on feedback.

### Task 4.2 – Demo Preparation and Deployment Configuration │ Agent_Integration_Polish
- **Objective:** Prepare application for reliable hackathon demonstration, configuring production-like deployment, testing on target hardware, and establishing fallback strategies.
- **Output:** Demo-ready configuration with production build created (optimized bundles, WebSocket URL configured for deployment environment), deployment process documented (clear steps for running on Vision Pro, HTTPS configuration if needed), full demo run-through completed on Vision Pro hardware (complete user journey validated, audio quality confirmed, robot visibility verified), and fallback strategies prepared (backup plan if Vision Pro issues occur, desktop/browser demo alternative ready).
- **Guidance:** Create production build: run npm run build for both frontend and backend, verify bundles are optimized. Configure WebSocket URL for deployment (environment variable or config file). Document deployment steps clearly: how to start backend, how to access frontend on Vision Pro, network requirements. Conduct full demo rehearsal on Vision Pro: practice complete flow, time the demo, identify any hiccups. Prepare fallbacks: if Vision Pro unavailable, can demo run on desktop browser with mouse/keyboard? If network unstable, have offline video recording? Ensure robustness for presentation environment.

1. **Create Production Build:** Create production build configuration for both frontend and backend, optimizing bundles and configuring WebSocket URL for deployment environment.
2. **Document Deployment Process:** Document complete deployment process with clear step-by-step instructions for running application on Vision Pro, including HTTPS setup if required.
3. **Conduct Demo Rehearsal:** Coordinate full demo run-through on Vision Pro hardware, testing complete user journey, verifying audio quality and robot model visibility.
4. **Prepare Fallback Strategies:** Prepare contingency plans including backup demo approach if Vision Pro has issues and desktop/browser alternative demonstration setup.

### Task 4.3 – Final Bug Sweep and Stability Testing │ Agent_Integration_Polish
- **Objective:** Ensure demo stability and error resilience through comprehensive edge case testing, bug fixing, and error handling improvements.
- **Output:** Stable resilient demo with edge cases tested (mic permission denied, network disconnect, OpenAI API errors, invalid responses), discovered bugs fixed (errors handled gracefully, user-friendly error messages added, crash prevention implemented), error handling improved (retry logic added for transient failures, timeout handling implemented, input validation comprehensive), and final validation completed (all failure scenarios tested, recovery mechanisms verified working).
- **Guidance:** Test edge cases systematically: deny mic permissions (show helpful message), disconnect network mid-session (graceful degradation, reconnection), send invalid API key (clear error message), trigger OpenAI rate limits (retry with backoff), corrupt WebSocket messages (parsing error handling). Fix discovered bugs: add try-catch blocks, implement error boundaries in React, add logging for debugging. Improve error handling: add retry logic for API calls (exponential backoff), implement request timeouts (abort after 30s), validate all user inputs. Run final validation: test each failure scenario, verify recovery mechanisms work correctly, ensure no uncaught exceptions crash the app.

1. **Test Edge Cases:** Test comprehensive edge case scenarios including mic permission denial, network disconnection, OpenAI API errors, and invalid response handling.
2. **Fix Discovered Bugs:** Fix all bugs discovered during edge case testing, implementing graceful error handling, user-friendly error messages, and crash prevention.
3. **Improve Error Handling:** Improve system error resilience adding retry logic for transient failures, implementing timeout handling, and validating all inputs comprehensively.
4. **Run Final Validation:** Run final validation testing all failure scenarios, verifying error recovery mechanisms function correctly, ensuring demo stability.

