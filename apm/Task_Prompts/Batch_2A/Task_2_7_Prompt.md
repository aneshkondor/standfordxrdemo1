---
task_ref: "Task 2.7 - Build Therapy Mode State Controller"
agent_assignment: "Agent_Frontend_Core"
memory_log_path: "/Users/aneshkondor/Coding/Hackathons/Aila/apm/Memory/Phase_02_Core_Feature_Implementation/Task_2_7_Build_Therapy_Mode_State_Controller.md"
execution_type: "multi-step"
dependency_context: false
ad_hoc_delegation: false
---

# APM Task Assignment: Build Therapy Mode State Controller

## Task Reference
Implementation Plan: **Task 2.7 - Build Therapy Mode State Controller** assigned to **Agent_Frontend_Core**

## Objective
Create centralized state management system controlling therapy session lifecycle and mode transitions, coordinating visibility and behavior of all UI components based on current application state.

## Detailed Instructions
Complete in 4 exchanges, one step per response. **AWAIT USER CONFIRMATION** before proceeding to each subsequent step:

**Step 1: Define Therapy States**
- Location: `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/app-shell/TherapyStateController.ts` (or similar)
- Define therapy state enum/type with clear states:
  - `idle` - Dashboard visible, no audio active
  - `active_therapy` - Robot scene visible, audio active
  - `paused` - Therapy scene visible but audio inactive
- Use React useState or state management library (Zustand, Redux) for centralized control

**Step 2: Implement Transition Handlers**
- Implement mode transition handler methods:
  - `startTherapy()` - Transition from idle to active_therapy
  - `pauseTherapy()` - Transition from active_therapy to paused
  - `exitTherapy()` - Transition back to idle
- Add state validation and update logic for each transition

**Step 3: Add Session Lifecycle**
- Add session lifecycle management methods:
  - Initialization: `startTherapy()` accepts selected tone parameter
  - Cleanup: `exitTherapy()` resets audio systems and state
- Coordinate state changes with audio pipeline activation/deactivation

**Step 4: Coordinate Component Visibility**
- Implement component visibility coordination logic
- Show/hide Dashboard vs Robot scene based on current therapy state:
  - `idle` state → Dashboard visible, Robot scene hidden
  - `active_therapy` state → Robot scene visible, Dashboard hidden
  - `paused` state → Robot scene visible, Dashboard hidden
- Expose state and handlers to child components via props or context

## Expected Output
- **Deliverables:**
  - Functional state controller module with therapy states defined
  - Transition handler methods (startTherapy, pauseTherapy, exitTherapy)
  - Session lifecycle management (initialization with tone, cleanup)
  - Component visibility coordination logic

- **Success Criteria:**
  - State transitions work correctly
  - Component visibility updates based on state
  - Tone selection properly passed during initialization
  - Module compiles without TypeScript errors
  - Ready for UI component integration

- **File Locations:**
  - `/Users/aneshkondor/Coding/Hackathons/Aila/webspatial-client/src/app-shell/TherapyStateController.ts` (or similar name/location)

## Memory Logging
Upon completion, you **MUST** log your work in:
`/Users/aneshkondor/Coding/Hackathons/Aila/apm/Memory/Phase_02_Core_Feature_Implementation/Task_2_7_Build_Therapy_Mode_State_Controller.md`

Follow `guides/Memory_Log_Guide.md` instructions for the dynamic-md format with YAML frontmatter.
