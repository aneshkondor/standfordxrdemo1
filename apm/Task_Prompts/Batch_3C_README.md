# Phase 3 Batch 3C - Sequential Testing (1 Task)

## Overview
**Batch 3C contains 1 task that MUST run after all other Phase 3 tasks complete.**

**Dependencies:** Requires Tasks 3.1, 3.2, 3.3, 3.4, and 3.5 to be complete.

## Task

### Task 3.6 - End-to-End Flow Testing and Bug Fixes
- **Agent:** Agent_Integration_Assemble
- **File:** `Batch_3C/Task_3_6_Prompt.md`
- **Output:** Validated working demo ready for Vision Pro
- **Duration:** ~60 min (5 steps)
- **Tests:** Complete user journey from start to AI conversation

## What This Task Does

**Step 1:** Test Complete Local Flow
- Start backend and frontend servers
- Verify dashboard → tone selection → therapy mode flow
- Check WebSocket connection
- Document any errors

**Step 2:** Validate Audio Pipeline
- Test mic capture and VAD
- Verify audio transmission to backend
- Confirm OpenAI responses
- Validate audio playback quality

**Step 3:** Debug Integration Issues
- Check browser console and backend logs
- Fix WebSocket connection problems
- Resolve audio pipeline bugs
- Handle state transition issues
- Re-test after fixes

**Step 4:** Configure Vision Pro Deployment
- Update WebSocket URL to laptop IP
- Set up HTTPS if required
- Test cross-network connection
- Fix CORS issues

**Step 5:** Coordinate Hardware Validation
- Document deployment steps
- Test on Vision Pro with user
- Fix device-specific issues
- Validate final working demo

## Prerequisites

**MUST Complete First (ALL Phase 3 tasks):**
- ✅ Task 3.1 - Frontend WebSocket Connection
- ✅ Task 3.2 - Outbound Audio Pipeline
- ✅ Task 3.3 - Inbound Audio Pipeline
- ✅ Task 3.4 - Wire UI Components
- ✅ Task 3.5 - Robot Model Loading

## Critical Requirements

**Before Starting:**
1. Ensure OPENAI_API_KEY is set in `backend/.env`
2. Have Vision Pro device ready for hardware testing
3. Know laptop's local IP address for deployment
4. Ensure both devices on same WiFi network

**During Testing:**
- Keep browser console open for error tracking
- Monitor backend terminal for logs
- Document all bugs found and fixes applied
- Test thoroughly before Vision Pro deployment

## Execution Strategy

**Sequential Only** - This task cannot be parallelized as it tests all integrated components.

Run in single Implementation Agent session:
- Agent_Integration_Assemble → Task 3.6

## Next Steps

Once **Task 3.6** completes:
- **Phase 3 is DONE!** 🎉
- System ready for Vision Pro testing
- Proceed to **Phase 4: Testing & Polish** (3 final tasks)
- Or deploy immediately for user testing

## Success Criteria

**Phase 3 Complete When:**
- Full conversation flow works end-to-end
- User can speak → AI responds → Audio plays
- WebSocket connection stable
- Vision Pro deployment configured
- No critical bugs remaining
- App ready for real-world testing

**Status:** Run after ALL Batch 3A and 3B tasks complete. This validates everything works together!
