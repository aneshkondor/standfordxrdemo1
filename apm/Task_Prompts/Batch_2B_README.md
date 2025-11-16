# Phase 2 Batch 2B - Task Execution Guide

## Overview
This directory contains the final 2 tasks for Phase 2 Core Feature Implementation.

**IMPORTANT:** Both tasks can now run in parallel - all dependencies from Batch 2A are complete!

## Dependencies Status

✅ **Task 2.8 Dependency:** Task 2.11 (Storage System) - COMPLETE
✅ **Task 2.10 Dependency:** Task 2.12 (Therapist Prompt) - COMPLETE

## Tasks

### Task 2.8 - Create Core Session REST Endpoints
- **Agent:** Agent_Backend
- **Depends on:** Task 2.11 (Storage System) ✓ Complete
- **Output:**
  - `backend/src/routes/session.ts` - Express routes
  - POST /session/start - Initiates therapy session with user context
  - POST /session/end - Saves transcript and updates memory
- **Prompt:** `Task_2_8_Prompt.md`
- **Execution:** Multi-step (5 steps)

### Task 2.10 - Integrate OpenAI Realtime API
- **Agent:** Agent_Backend
- **Depends on:** Task 2.12 (Therapist Prompt) ✓ Complete
- **Output:**
  - `backend/src/openai/realtimeClient.ts` - OpenAI WebSocket client
  - Session configuration with therapist instructions
  - Bidirectional audio streaming
  - Response event handling
- **Prompt:** `Task_2_10_Prompt.md`
- **Execution:** Multi-step (6 steps)

## Execution Strategy

### Option 1 - Parallel (Fastest - Recommended)
Run both tasks simultaneously in 2 separate Implementation Agent sessions:
- Session 1: Agent_Backend → Task 2.8
- Session 2: Agent_Backend → Task 2.10

### Option 2 - Sequential
Run one task at a time in a single Implementation Agent session:
- First: Task 2.8 or 2.10 (order doesn't matter)
- Second: The other task

## Task Files
- `Task_2_8_Prompt.md` - Session REST Endpoints
- `Task_2_10_Prompt.md` - OpenAI Realtime API Integration

## Next Steps After Batch 2B

Once both tasks complete:
1. Return to Manager Agent with completed Memory Logs
2. Manager will review and merge branches
3. Proceed to **Phase 3: Integration & Audio Pipeline** (6 tasks)

## Phase 3 Preview

Phase 3 will integrate all components built in Phase 2:
- **Task 3.1** - WebSocket Connection (Frontend ↔ Backend)
- **Task 3.2** - Outbound Audio Pipeline (Mic → VAD → WebSocket → OpenAI)
- **Task 3.3** - Inbound Audio Pipeline (OpenAI → WebSocket → Playback)
- **Task 3.4** - Wire UI Components to State Controller
- **Task 3.5** - Load Robot Model (replace placeholder)
- **Task 3.6** - End-to-End Testing

---

**Current Status:** Ready to execute Batch 2B!
**Completion:** 10/12 Phase 2 tasks complete (83%)
