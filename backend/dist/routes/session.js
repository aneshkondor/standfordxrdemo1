"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
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
router.post('/start', async (_req, res) => {
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
router.post('/end', async (_req, res) => {
    // TODO: Implement in Step 4
    res.status(501).json({ error: 'Not implemented yet' });
});
// ============================================================================
// EXPORT
// ============================================================================
exports.default = router;
//# sourceMappingURL=session.js.map