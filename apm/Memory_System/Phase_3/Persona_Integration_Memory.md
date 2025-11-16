# Persona Integration - Memory Log

**Date:** 2025-11-16
**Task:** Integrate custom persona prompts into OpenAI session configuration
**Branch:** `claude/continue-previous-work-013LMqeV7t1SiUFe2pn8Eonv`
**Status:** ✅ Complete

---

## Context

User provided 3 custom persona prompts mid-Batch 3B execution:
- Best-Friend Companion (Soft/Friendly tones)
- Analytical Companion (Analytical tone)
- Therapist-Style Companion (Therapist tone - optional 4th UI option)

All three agents working on Batch 3B tasks were already running, so integration was done in Manager Agent session to avoid conflicts.

---

## Changes Made

### 1. Created 3 Persona Prompt Files

**Location:** `backend/prompts/`

#### `persona_friendly.txt` - Best-Friend Companion
- **Use Cases:** "Soft" and "Friendly" tone selections
- **Characteristics:**
  - Nonchalant, casual, "we're in this together" vibe
  - OARS communication style (Open, Affirm, Reflect, Summarize)
  - Heavy validation and normalization
  - 1-2 open-ended questions at a time
  - Contractions and casual language
- **Example opener:** "Damn, that sounds like a lot. What hit you the hardest about it?"

#### `persona_analytical.txt` - Analytical Companion
- **Use Cases:** "Analytical" tone selection
- **Characteristics:**
  - Systems thinker, pattern identifier
  - Calm, thoughtful, gentle but honest
  - Structured observations: "Here are 3 things I notice..."
  - Validates emotion first, then analysis
  - Socratic questioning, hypothesis/experiment framing
- **Example structure:** Emotional validation → Pattern observations (bullets) → Experiments/reframes

#### `persona_therapist.txt` - Therapist-Style Companion
- **Use Cases:** Optional 4th tone option (not yet in UI)
- **Characteristics:**
  - Therapy-informed but explicitly NOT a therapist
  - MI-style OARS communication
  - Reflective listening and emotion labeling
  - Calm, grounding, slower and deeper
  - Regularly reminds user it's an AI companion
- **Key distinction:** More therapeutic than Best-Friend, but still a companion not replacement for therapy

### 2. Updated Backend Code

#### `backend/src/openai/realtimeClient.ts`
**Modified:** `configureSession()` method (lines 145-184)
- Now accepts optional `personaInstructions` parameter
- Falls back to default `therapist_system.txt` if no instructions provided
- Maintains backward compatibility

```typescript
public configureSession(personaInstructions?: string): void {
  let instructions: string;

  if (personaInstructions) {
    instructions = personaInstructions.trim();
    console.log('Using provided persona instructions...');
  } else {
    // Fallback to default
    const promptPath = path.join(__dirname, '../../prompts/therapist_system.txt');
    instructions = fs.readFileSync(promptPath, 'utf-8').trim();
    console.log('Loading default therapist instructions...');
  }

  // ... rest of configuration
}
```

#### `backend/src/openai/sessionManager.ts`
**Modified:** `initialize()` method (lines 20-60)
- Now accepts optional `tone` parameter
- Calls new `loadPersona()` helper to load appropriate persona
- Passes persona instructions to `configureSession()`

**Added:** `loadPersona()` private method (lines 62-109)
- Maps tone strings to persona files
- **Mapping:**
  - `"soft"` or `"friendly"` → `persona_friendly.txt`
  - `"analytical"` → `persona_analytical.txt`
  - `"therapist"` → `persona_therapist.txt`
  - `default` (no tone) → `persona_friendly.txt`
- Robust error handling with fallback to friendly persona
- Logs persona loading for debugging

```typescript
public async initialize(tone?: string): Promise<void> {
  console.log(`Selected tone: ${tone || 'default (therapist)'}`);

  await this.openaiClient.connect();

  // Load appropriate persona
  const personaInstructions = this.loadPersona(tone);

  // Configure with persona
  this.openaiClient.configureSession(personaInstructions);

  // ... rest of initialization
}
```

**Added imports:**
```typescript
import * as fs from 'fs';
import * as path from 'path';
```

---

## Shared Base Wellbeing System

All 3 personas share identical base system:

### Safety & Boundaries
- Never diagnose, prescribe, or replace therapy
- Crisis detection: suicide/self-harm → immediate resources
- Recognizes scope limits, refers to professionals when needed

### Context Handling
Three context variables passed from backend:
1. **USER_MEMORY:** Cross-session narrative summary
2. **SESSION_SUMMARY:** Current session recap
3. **MODE:** "intake" (first session) or "ongoing" (returning user)

### Output Format
All personas use consistent structure:
```
THOUGHT: <internal reasoning about user state>
RESPONSE: <what to say to user>
```

---

## Integration with Existing System

### Frontend Flow (No Changes Needed)
1. User selects tone on Dashboard: "Soft", "Friendly", or "Analytical"
2. Frontend sends tone to `/session/start` REST endpoint
3. REST endpoint validates and stores tone preference
4. When WebSocket connection established, tone is passed to `sessionManager.initialize(tone)`

### Backend Flow (Updated)
1. WebSocket connection handler receives tone parameter
2. Creates `OpenAISessionManager` instance
3. Calls `sessionManager.initialize(tone)`
4. SessionManager maps tone → persona file → loads content
5. Passes persona instructions to OpenAI Realtime API
6. Session configured with correct persona

---

## Tone Mapping Details

| Frontend Tone | Persona File | Persona Type |
|--------------|--------------|--------------|
| "Soft" | `persona_friendly.txt` | Best-Friend Companion |
| "Friendly" | `persona_friendly.txt` | Best-Friend Companion |
| "Analytical" | `persona_analytical.txt` | Analytical Companion |
| "Therapist" | `persona_therapist.txt` | Therapist-Style Companion |
| `undefined` / `null` | `persona_friendly.txt` | Best-Friend Companion (default) |

---

## Files Modified

```
backend/src/openai/realtimeClient.ts    (modified)
backend/src/openai/sessionManager.ts    (modified)
backend/prompts/persona_friendly.txt    (created)
backend/prompts/persona_analytical.txt  (created)
backend/prompts/persona_therapist.txt   (created)
```

**Commit:** `1c5fd6a` - "Add dynamic persona system with 3 custom AI companions"

---

## Next Steps for Batch 3B Agents

When Tasks 3.2, 3.3, 3.4 complete, they will need to:

1. **Pass tone parameter to sessionManager:**
   - When creating OpenAI session via WebSocket
   - Tone should come from frontend (already sent in UI state)
   - Example: `sessionManager.initialize(frontendTone)`

2. **Optional: Add "Therapist" as 4th UI option:**
   - Currently UI has: Soft, Friendly, Analytical (3 options)
   - Can add "Therapist" as 4th option for more therapeutic style
   - Or keep 3 options and reserve Therapist persona for future

3. **Test all 3 personas:**
   - Verify each tone selection loads correct persona
   - Confirm response styles match persona characteristics
   - Validate context handling (USER_MEMORY, SESSION_SUMMARY, MODE)

---

## Testing Checklist

After Batch 3B completes:

- [ ] Test "Soft" tone → Best-Friend Companion loads
- [ ] Test "Friendly" tone → Best-Friend Companion loads
- [ ] Test "Analytical" tone → Analytical Companion loads
- [ ] Verify persona instructions appear in OpenAI session config
- [ ] Confirm AI responses match persona characteristics
- [ ] Test fallback: Invalid tone → defaults to Best-Friend
- [ ] Check console logs show correct persona loading

---

## Known Considerations

1. **Default Tone:**
   - Currently defaults to Best-Friend Companion if no tone provided
   - Could change default to Therapist-Style if preferred
   - Modify line 90 in `sessionManager.ts` to change default

2. **Case Sensitivity:**
   - Tone mapping uses `.toLowerCase()` for robustness
   - Frontend can send "Soft", "soft", or "SOFT" - all work

3. **Error Handling:**
   - If persona file missing, falls back to friendly persona
   - Logs error but doesn't crash session
   - Ensures user always gets a working session

4. **Backward Compatibility:**
   - Both `initialize()` and `configureSession()` accept optional parameters
   - Old code calling without parameters still works
   - Maintains compatibility with Phase 2 code

---

## Summary

✅ **3 custom persona prompts created and integrated**
✅ **Backend dynamically loads persona based on tone selection**
✅ **Robust fallbacks prevent crashes from missing files**
✅ **Backward compatible with existing code**
✅ **All shared wellbeing system logic consistent across personas**
✅ **Ready for Batch 3B agents to wire up WebSocket → tone parameter**

**Status:** Complete and pushed to remote branch
**Next:** Batch 3B agents will connect WebSocket handling and pass tone parameter
