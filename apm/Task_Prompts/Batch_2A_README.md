# Phase 2 Batch 2A - Task Execution Guide

## Overview
This directory contains 10 parallel tasks for Phase 2 Core Feature Implementation.

## Parallelization Strategy

### Option A - By Agent Type (RECOMMENDED for manageable workflow)
Run tasks grouped by specialized agent:

**Agent_Frontend_Core (4 sessions):**
- Task 2.1 - Dashboard Center Panel
- Task 2.2 - Tone Selector Panel
- Task 2.3 - Robot 3D Scene
- Task 2.7 - Therapy Mode State Controller

**Agent_Frontend_Audio (3 sessions):**
- Task 2.4 - Voice Activity Detection (VAD)
- Task 2.5 - Microphone Capture Pipeline
- Task 2.6 - Audio Playback System

**Agent_Backend (3 sessions):**
- Task 2.9 - WebSocket Audio Streaming Server
- Task 2.11 - Session JSON Storage System
- Task 2.12 - Configure Basic Therapist Prompt

### Option B - Sequential per Agent (SIMPLEST - 3 sessions total)
Run one agent at a time, handling all their tasks sequentially:
- 1 Agent_Frontend_Core session → does 2.1, 2.2, 2.3, 2.7 in sequence
- 1 Agent_Frontend_Audio session → does 2.4, 2.5, 2.6 in sequence
- 1 Agent_Backend session → does 2.9, 2.11, 2.12 in sequence

All 3 agents can run in parallel.

### Option C - Maximum Parallelization (FASTEST - 10 sessions)
Open 10 separate Implementation Agent sessions, one per task.

## Task Files
- `Task_2_1_Prompt.md` - Dashboard Center Panel (Agent_Frontend_Core)
- `Task_2_2_Prompt.md` - Tone Selector Panel (Agent_Frontend_Core)
- `Task_2_3_Prompt.md` - Robot 3D Scene (Agent_Frontend_Core)
- `Task_2_4_Prompt.md` - VAD System (Agent_Frontend_Audio)
- `Task_2_5_Prompt.md` - Microphone Capture (Agent_Frontend_Audio)
- `Task_2_6_Prompt.md` - Audio Playback (Agent_Frontend_Audio)
- `Task_2_7_Prompt.md` - State Controller (Agent_Frontend_Core)
- `Task_2_9_Prompt.md` - WebSocket Server (Agent_Backend)
- `Task_2_11_Prompt.md` - Storage System (Agent_Backend)
- `Task_2_12_Prompt.md` - Therapist Prompt (Agent_Backend)

## Next Steps After Batch 2A
After all 10 tasks complete, return to Manager Agent with Memory Logs.

Manager will then issue Batch 2B (2 tasks):
- Task 2.8 - Session REST Endpoints (depends on Task 2.11)
- Task 2.10 - OpenAI Realtime API Integration (depends on Task 2.12)
