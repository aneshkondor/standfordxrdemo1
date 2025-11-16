# Phase 3: Integration & Audio Pipeline - Complete Overview

## Mission
**Wire all Phase 2 components together** to create a fully functional VR therapy experience.

## Structure - 3 Batches, 6 Tasks

### 📦 Batch 3A - Foundation (2 Tasks, ~50 min)
**Run in PARALLEL** - No dependencies between tasks

| Task | Agent | Duration | Output |
|------|-------|----------|--------|
| 3.1 - WebSocket Connection | Integration_Connect | 30 min | WebSocket client utility |
| 3.5 - Robot Model Loading | Integration_Assemble | 20 min | GLTF robot model |

**Start Both Immediately!**

---

### 📦 Batch 3B - Audio & UI Integration (3 Tasks, ~45 min)
**Run in PARALLEL after Task 3.1 completes**

| Task | Agent | Duration | Output |
|------|-------|----------|--------|
| 3.2 - Outbound Audio Pipeline | Integration_Connect | 45 min | Mic → VAD → WebSocket |
| 3.3 - Inbound Audio Pipeline | Integration_Connect | 45 min | WebSocket → Playback |
| 3.4 - Wire UI Components | Integration_Assemble | 30 min | Complete UI flow |

**Dependency:** All require Task 3.1 WebSocket client

**Can Start Task 3.5 in parallel if not done yet**

---

### 📦 Batch 3C - Testing (1 Task, ~60 min)
**Run SEQUENTIALLY after all other tasks complete**

| Task | Agent | Duration | Output |
|------|-------|----------|--------|
| 3.6 - End-to-End Testing | Integration_Assemble | 60 min | Validated working demo |

**Dependency:** Requires ALL Phase 3 tasks (3.1-3.5) complete

---

## Total Time Estimates

### Maximum Parallelization (5 sessions)
- Batch 3A: 2 parallel sessions = **30 min** (limited by Task 3.1)
- Batch 3B: 3 parallel sessions = **45 min** (limited by Tasks 3.2/3.3)
- Batch 3C: 1 session = **60 min**
- **Total: ~2.5 hours**

### Moderate Parallelization (3 sessions)
- Batch 3A: 2 parallel sessions = **30 min**
- Batch 3B: Run 3.2+3.3 in one session, 3.4 in another = **90 min** (3.2+3.3 sequential)
- Batch 3C: 1 session = **60 min**
- **Total: ~3 hours**

### Sequential (1 session)
- Run all 6 tasks one after another
- **Total: ~4 hours**

---

## Execution Plan

### Recommended: Maximum Parallelization

**Stage 1 - Batch 3A (Start Now):**
```
Session 1: Agent_Integration_Connect → Task 3.1
Session 2: Agent_Integration_Assemble → Task 3.5
```
Wait: ~30 min (until Task 3.1 completes)

**Stage 2 - Batch 3B (After Task 3.1 completes):**
```
Session 3: Agent_Integration_Connect → Task 3.2
Session 4: Agent_Integration_Connect → Task 3.3
Session 5: Agent_Integration_Assemble → Task 3.4
```
Wait: ~45 min (until longest task completes)

**Stage 3 - Batch 3C (After all tasks 3.1-3.5 complete):**
```
Session 6: Agent_Integration_Assemble → Task 3.6
```
Wait: ~60 min (testing and bug fixing)

---

## Task Prompts Location

All prompts ready in `apm/Task_Prompts/`:
- `Batch_3A/Task_3_1_Prompt.md`
- `Batch_3A/Task_3_5_Prompt.md`
- `Batch_3B/Task_3_2_Prompt.md`
- `Batch_3B/Task_3_3_Prompt.md`
- `Batch_3B/Task_3_4_Prompt.md`
- `Batch_3C/Task_3_6_Prompt.md`

---

## What You'll Have After Phase 3

✅ **Complete Working Demo:**
- User loads app in Vision Pro
- Sees dashboard and selects AI tone
- Clicks "Start Therapy"
- Robot appears in 3D space
- User speaks → VAD detects speech
- Audio sent to OpenAI
- AI responds with voice
- Audio plays back seamlessly
- Natural conversation with AI therapist

✅ **Full Integration:**
- Frontend ↔ Backend WebSocket connection
- Audio pipeline wired end-to-end
- UI components connected to state
- Real robot GLTF model loaded
- Tested and validated locally
- Ready for Vision Pro deployment

---

## Critical Prerequisites

**Before Starting:**
1. ✅ Phase 2 complete (all 12 tasks merged)
2. ⚠️ Add OPENAI_API_KEY to `backend/.env`
3. ⚠️ Vision Pro device available for hardware testing
4. ⚠️ Laptop and Vision Pro on same WiFi

**File Check:**
- Robot USDZ model exists: `ILA_Chatbot_1116011010_texture.usdz` ✅

---

## After Phase 3

**You'll be ready to:**
1. Deploy to Vision Pro
2. Test with real users
3. Iterate based on feedback
4. Proceed to Phase 4 (Polish) if needed

**Or:**
1. Ship the MVP immediately
2. Gather user feedback
3. Enhance based on real usage

---

## Success Metrics

Phase 3 is COMPLETE when:
- ✅ User can have full conversation with AI
- ✅ Audio pipeline works end-to-end
- ✅ UI responds correctly to state changes
- ✅ Robot model renders properly
- ✅ WebSocket connection stable
- ✅ Tested on Vision Pro hardware
- ✅ No critical bugs blocking usage

**Ready to start Phase 3!** 🚀

Begin with Batch 3A (2 tasks in parallel)
