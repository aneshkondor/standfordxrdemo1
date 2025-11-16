---
task_ref: "Task 3.4 - Wire UI Components to Therapy State Controller"
agent_assignment: "Agent_Integration_Assemble"
memory_log_path: "/Users/aneshkondor/Coding/Hackathons/Aila/apm/Memory/Phase_03_Integration_Audio_Pipeline/Task_3_4_Wire_UI_Components_to_Therapy_State_Controller.md"
execution_type: "multi-step"
dependency_context: true
ad_hoc_delegation: false
---

# APM Task Assignment: Wire UI Components to Therapy State Controller

## Task Reference
Implementation Plan: **Task 3.4 - Wire UI Components to Therapy State Controller** assigned to **Agent_Integration_Assemble**

## Context from Dependencies

**This task depends on Task 3.1 (Frontend WebSocket Connection) ✓ COMPLETE**

Task 3.1 provided WebSocket client for backend communication.

**Available Components (from Phase 2):**
- **Dashboard:** `webspatial-client/src/components/CenterDashboard.tsx`
  - "Start Therapy" button
  - Accepts `onStartTherapy` callback prop
- **Tone Selector:** `webspatial-client/src/components/LeftTonePanel.tsx`
  - Three tone presets: Soft, Friendly, Analytical
  - Accepts `onToneChange` callback prop
- **Robot Scene:** `webspatial-client/src/components/Robot3DScene.tsx`
  - 3D robot in spatial environment
  - Ready for conditional rendering
- **State Controller:** `webspatial-client/src/app-shell/TherapyStateController.ts`
  - States: idle, active_therapy, paused
  - Methods: startTherapy(), pauseTherapy(), exitTherapy()

**Backend REST API (from Phase 2):**
- POST /session/start - Accepts userId and tonePreset
- Returns: mode (intake/ongoing), memoryNarrative

**Integration Instructions:**
Wire UI components to state controller and connect state changes to backend API calls.

## Objective
Connect all UI components to centralized state controller, establishing complete interaction flow from user input through state transitions to component visibility changes.

## Detailed Instructions
Complete in 4 exchanges, one step per response. **AWAIT USER CONFIRMATION** before proceeding to each subsequent step:

**Step 1: Connect Dashboard Button**
- Location: Create main App component or update existing
  - `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/App.tsx` (or similar)
- Import CenterDashboard component
- Import TherapyStateController
- Wire "Start Therapy" button:
  - Pass `onStartTherapy` callback prop to CenterDashboard
  - Callback should call `stateController.startTherapy(selectedTone)`
- Get selectedTone from Tone Selector state

**Step 2: Wire Tone Selector State**
- Import LeftTonePanel component
- Implement tone selection state management:
  - Use React useState to track currently selected tone
  - Default to "Friendly"
- Wire Tone Selector:
  - Pass `onToneChange` callback prop to LeftTonePanel
  - Update selectedTone state when user changes selection
- Make tone available to Dashboard for session initialization

**Step 3: Connect Robot Scene Visibility**
- Import Robot3DScene component
- Import therapy state from controller
- Implement conditional rendering:
  - Show Robot3DScene when state === "active_therapy"
  - Show CenterDashboard when state === "idle"
  - Hide Dashboard when state === "active_therapy"
- Use state controller's state getter:
  - `const currentState = stateController.getState()`
  - Re-render on state changes

**Step 4: Validate State Flow**
- Connect to backend /session/start:
  - In startTherapy handler:
    - Call POST /session/start with userId and selectedTone
    - Receive mode and memoryNarrative
    - Update state to active_therapy on success
- Test complete flow:
  - User selects tone → State updates
  - User clicks "Start Therapy" → Backend call
  - Backend responds → State changes to active_therapy
  - Robot scene appears, dashboard hides
- Add error handling:
  - Handle backend connection failures
  - Show error message to user
  - Keep state as idle on errors

## Expected Output
- **Deliverables:**
  - Main App component wiring all UI pieces together
  - Dashboard button connected to startTherapy() with selected tone
  - Tone Selector updating state on user selection
  - Robot Scene visibility controlled by therapy state
  - Backend API call on session start
  - Complete state flow: idle → tone selection → start → active_therapy

- **Success Criteria:**
  - User can select tone and see selection update
  - "Start Therapy" button triggers state change
  - Backend /session/start called successfully
  - Robot scene appears when therapy activates
  - Dashboard hides when therapy activates
  - State transitions work smoothly
  - Module compiles without TypeScript errors

- **File Locations:**
  - Main app: `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/App.tsx`
  - Dashboard: `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/components/CenterDashboard.tsx`
  - Tone Selector: `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/components/LeftTonePanel.tsx`
  - Robot Scene: `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/components/Robot3DScene.tsx`
  - State Controller: `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/app-shell/TherapyStateController.ts`

## Memory Logging
Upon completion, you **MUST** log your work in:
`/Users/aneshkondor/Coding/Hackathons/Aila/apm/Memory/Phase_03_Integration_Audio_Pipeline/Task_3_4_Wire_UI_Components_to_Therapy_State_Controller.md`

Follow `guides/Memory_Log_Guide.md` instructions for the dynamic-md format with YAML frontmatter.
