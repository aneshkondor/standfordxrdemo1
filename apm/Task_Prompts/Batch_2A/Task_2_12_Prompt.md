---
task_ref: "Task 2.12 - Configure Basic Therapist Prompt"
agent_assignment: "Agent_Backend"
memory_log_path: "/Users/aneshkondor/Coding/Hackathons/Aila/apm/Memory/Phase_02_Core_Feature_Implementation/Task_2_12_Configure_Basic_Therapist_Prompt.md"
execution_type: "single-step"
dependency_context: false
ad_hoc_delegation: false
---

# APM Task Assignment: Configure Basic Therapist Prompt

## Task Reference
Implementation Plan: **Task 2.12 - Configure Basic Therapist Prompt** assigned to **Agent_Backend**

## Objective
Create foundational AI therapist prompt configuration defining personality, tone, and response behavior for MVP testing, adaptable for future enhancement with specialized therapy techniques.

## Detailed Instructions
Complete all items in one response:

1. **Create prompts/therapist_system.txt File**
   - Location: `/Users/aneshkondor/Coding/Hackathons/Aila/backend/prompts/therapist_system.txt`
   - Reference: `archive/index.html` line 453 for proven prompt structure
   - Keep prompt concise for MVP (under 200 words)

2. **Include Empathetic Therapist Persona**
   - Role definition: Warm empathetic AI therapist named "Ally"
   - Communication style: Brief 2-3 sentence responses, conversational, calming
   - Approach: Active listening, emotional support, non-judgmental, patient

3. **Ensure Integration Reference in Code**
   - Verify that OpenAI session configuration code (Task 2.10) will be able to load this file
   - Document file path and format for Task 2.10 integration
   - Note: User will provide enhanced therapy-specific prompts later

## Expected Output
- **Deliverables:**
  - Therapist prompt file at `prompts/therapist_system.txt`
  - Empathetic therapist persona adapted from archive/index.html
  - Instructions for brief responses, warm tone, non-judgmental approach
  - Clear file path documentation for Task 2.10 integration

- **Success Criteria:**
  - Prompt file created with therapist persona
  - Content under 200 words (MVP requirement)
  - Instructions specify 2-3 sentence responses
  - File ready for loading in OpenAI session configuration

- **File Locations:**
  - `/Users/aneshkondor/Coding/Hackathons/Aila/backend/prompts/therapist_system.txt`
  - Reference: `/Users/aneshkondor/Coding/Hackathons/Aila/archive/index.html` (line 453)

## Memory Logging
Upon completion, you **MUST** log your work in:
`/Users/aneshkondor/Coding/Hackathons/Aila/apm/Memory/Phase_02_Core_Feature_Implementation/Task_2_12_Configure_Basic_Therapist_Prompt.md`

Follow `guides/Memory_Log_Guide.md` instructions for the dynamic-md format with YAML frontmatter.
