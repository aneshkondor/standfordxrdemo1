import { Request, Response, Router } from 'express';
// Storage utilities - will be used in subsequent steps
// import {
//   loadMemorySummary,
//   updateMemoryAfterSession,
//   saveSessionTranscript,
//   getMemoryContext,
//   SessionSummary
// } from '../utils/storage';

// ============================================================================
// EXPRESS ROUTER
// ============================================================================

import express from 'express';

const router: Router = express.Router();

// ============================================================================
// ROUTE DEFINITIONS
// ============================================================================

/**
 * POST /session/start
 * Initiates a new therapy session
 *
 * Request Body:
 * - userId: string (required)
 * - tonePreset: string (required) - One of: Soft, Friendly, Analytical
 *
 * Response:
 * - mode: "intake" | "ongoing"
 * - memoryNarrative: string
 * - appliedTone: string
 */
router.post('/start', async (_req: Request, res: Response) => {
  // TODO: Implement in Step 2
  res.status(501).json({ error: 'Not implemented yet' });
});

/**
 * POST /session/end
 * Completes a therapy session and saves transcript
 *
 * Request Body:
 * - sessionId: string (required)
 * - userId: string (required)
 * - transcript: string (required)
 *
 * Response:
 * - success: boolean
 * - savedAt: string
 */
router.post('/end', async (_req: Request, res: Response) => {
  // TODO: Implement in Step 4
  res.status(501).json({ error: 'Not implemented yet' });
});

// ============================================================================
// EXPORT
// ============================================================================

export default router;
