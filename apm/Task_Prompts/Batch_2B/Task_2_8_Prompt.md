---
task_ref: "Task 2.8 - Create Core Session REST Endpoints"
agent_assignment: "Agent_Backend"
memory_log_path: "/Users/aneshkondor/Coding/Hackathons/Aila/apm/Memory/Phase_02_Core_Feature_Implementation/Task_2_8_Create_Core_Session_REST_Endpoints.md"
execution_type: "multi-step"
dependency_context: true
ad_hoc_delegation: false
---

# APM Task Assignment: Create Core Session REST Endpoints

## Task Reference
Implementation Plan: **Task 2.8 - Create Core Session REST Endpoints** assigned to **Agent_Backend**

## Context from Dependencies

**This task depends on Task 2.11 (Session JSON Storage System) ✓ COMPLETE**

Task 2.11 provided storage utilities at `backend/src/utils/storage.ts` with the following functionality:

**Available Storage Functions:**
- **Directory Management:**
  - `ensureUserDirectories(userId: string)` - Creates user directory structure recursively
  - Creates: `data/users/{userId}/`, `data/users/{userId}/sessions/`, `data/users/{userId}/summaries/`

- **Profile Operations:**
  - `createDefaultProfile(userId: string)` - Creates default user profile with initial preferences
  - `readUserProfile(userId: string)` - Reads user profile from `profile.json`
  - `updateUserProfile(userId: string, updates: object)` - Updates user preference fields

- **Memory Operations:**
  - `loadUserMemory(userId: string)` - Loads memory summary and narrative from `memory.json`
  - `updateUserMemory(userId: string, sessionSummary: object)` - Updates memory with new insights

- **Session Storage:**
  - `saveSessionTranscript(userId: string, transcript: string)` - Writes markdown transcript to sessions/
  - Uses timestamp-based naming: `YYYY-MM-DD_HH-mm-ss.md`

**Integration Instructions:**
You will import and use these storage utilities from `../utils/storage` in your REST endpoint implementations.

## Objective
Implement REST API endpoints managing therapy session lifecycle, enabling session initiation with user context loading and session completion with transcript/memory persistence.

## Detailed Instructions
Complete in 5 exchanges, one step per response. **AWAIT USER CONFIRMATION** before proceeding to each subsequent step:

**Step 1: Create Express Routes File**
- Location: `/Users/aneshkondor/Coding/Hackathons/Aila/backend/src/routes/session.ts`
- Create Express Router module
- Import storage utilities from `../utils/storage`
- Define route structure for session endpoints
- Export router for registration with main Express app

**Step 2: Implement POST /session/start Endpoint**
- Route: `POST /session/start`
- Accept request body with:
  - `userId: string` - User identifier
  - `tonePreset: string` - Selected therapist tone (Soft/Friendly/Analytical)
- Validate inputs (userId required, tonePreset required)
- Trigger session initialization
- Return 400 Bad Request if validation fails

**Step 3: Add Memory Loading Logic**
- Use `loadUserMemory(userId)` from storage utilities
- Load user memory from `data/users/{userId}/memory.json`
- Determine session mode:
  - `intake` if no memory exists (first-time user)
  - `ongoing` if memory exists (returning user)
- Return response with:
  - `mode: "intake" | "ongoing"`
  - `memoryNarrative: string` - Narrative summary for AI context
  - `appliedTone: string` - Confirmed tone preset

**Step 4: Implement POST /session/end Endpoint**
- Route: `POST /session/end`
- Accept request body with:
  - `sessionId: string` - Session identifier
  - `userId: string` - User identifier
  - `transcript: string` - Full conversation transcript in markdown
- Validate inputs (sessionId, userId, transcript required)
- Return 400 Bad Request if validation fails

**Step 5: Add Session Saving Logic**
- Use `saveSessionTranscript(userId, transcript)` from storage utilities
- Write markdown transcript to `data/users/{userId}/sessions/{timestamp}.md`
- Extract key points from transcript (simple approach: first/last exchanges, main themes)
- Use `updateUserMemory(userId, sessionSummary)` to update `memory.json`
- Return success confirmation:
  - `success: true`
  - `savedAt: string` - Timestamp of saved session

## Expected Output
- **Deliverables:**
  - Functional Express routes file at `backend/src/routes/session.ts`
  - POST /session/start endpoint with userId and tonePreset validation
  - Memory loading logic using Task 2.11 storage utilities
  - POST /session/end endpoint with session saving
  - Session transcript and memory persistence

- **Success Criteria:**
  - Routes compile without TypeScript errors
  - POST /session/start validates inputs and loads memory
  - Mode determination works (intake vs ongoing)
  - POST /session/end saves transcripts and updates memory
  - Router integrates with main Express app

- **File Locations:**
  - `/Users/aneshkondor/Coding/Hackathons/Aila/backend/src/routes/session.ts`
  - Storage utilities: `/Users/aneshkondor/Coding/Hackathons/Aila/backend/src/utils/storage.ts`

## Memory Logging
Upon completion, you **MUST** log your work in:
`/Users/aneshkondor/Coding/Hackathons/Aila/apm/Memory/Phase_02_Core_Feature_Implementation/Task_2_8_Create_Core_Session_REST_Endpoints.md`

Follow `guides/Memory_Log_Guide.md` instructions for the dynamic-md format with YAML frontmatter.
