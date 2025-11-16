"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../utils/storage");
// ============================================================================
// EXPRESS ROUTER
// ============================================================================
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// ============================================================================
// CONSTANTS
// ============================================================================
const VALID_TONE_PRESETS = ['Soft', 'Friendly', 'Analytical'];
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Extracts session summary from transcript
 * Simple approach: captures main themes, first/last exchanges
 */
function extractSessionSummary(sessionId, transcript, timestamp) {
    const lines = transcript.split('\n').filter(line => line.trim() !== '');
    // Extract insights from first and last exchanges
    const insights = [];
    const topics = [];
    // Simple keyword extraction for topics
    const topicKeywords = [
        'anxiety', 'depression', 'stress', 'relationship', 'work',
        'family', 'health', 'sleep', 'emotion', 'goal', 'challenge',
        'fear', 'worry', 'anger', 'sadness', 'joy', 'hope'
    ];
    const transcriptLower = transcript.toLowerCase();
    topicKeywords.forEach(keyword => {
        if (transcriptLower.includes(keyword)) {
            topics.push(keyword);
        }
    });
    // Create basic insights from exchange count and topics
    if (lines.length > 0) {
        insights.push(`Session had ${lines.length} conversation exchanges`);
    }
    if (topics.length > 0) {
        insights.push(`Discussed: ${topics.slice(0, 5).join(', ')}`);
    }
    else {
        insights.push('General therapeutic conversation');
    }
    return {
        sessionId,
        timestamp: timestamp.toISOString(),
        insights,
        topics: topics.slice(0, 10) // Limit to top 10 topics
    };
}
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
router.post('/start', async (req, res) => {
    try {
        // Validate request body
        const { userId, tonePreset } = req.body;
        // Validate userId
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'userId is required and must be a non-empty string'
            });
        }
        // Validate tonePreset
        if (!tonePreset || typeof tonePreset !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'tonePreset is required and must be a string'
            });
        }
        if (!VALID_TONE_PRESETS.includes(tonePreset)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: `tonePreset must be one of: ${VALID_TONE_PRESETS.join(', ')}`
            });
        }
        // Load user memory to determine session mode
        const memory = await (0, storage_1.loadMemorySummary)(userId);
        const mode = memory ? 'ongoing' : 'intake';
        // Get memory context for AI
        const memoryContext = await (0, storage_1.getMemoryContext)(userId);
        // Return session initialization response
        return res.status(200).json({
            mode,
            memoryNarrative: memoryContext.narrative,
            appliedTone: tonePreset
        });
    }
    catch (error) {
        console.error('Error starting session:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to start session'
        });
    }
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
router.post('/end', async (req, res) => {
    try {
        // Validate request body
        const { sessionId, userId, transcript } = req.body;
        // Validate sessionId
        if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'sessionId is required and must be a non-empty string'
            });
        }
        // Validate userId
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'userId is required and must be a non-empty string'
            });
        }
        // Validate transcript
        if (!transcript || typeof transcript !== 'string' || transcript.trim() === '') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'transcript is required and must be a non-empty string'
            });
        }
        // Save session transcript
        const timestamp = new Date();
        await (0, storage_1.saveSessionTranscript)(userId, transcript, timestamp);
        // Extract session summary from transcript
        const sessionSummary = extractSessionSummary(sessionId, transcript, timestamp);
        // Update user memory with session insights
        await (0, storage_1.updateMemoryAfterSession)(userId, sessionSummary);
        // Return success response
        return res.status(200).json({
            success: true,
            savedAt: timestamp.toISOString()
        });
    }
    catch (error) {
        console.error('Error ending session:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to save session'
        });
    }
});
// ============================================================================
// EXPORT
// ============================================================================
exports.default = router;
//# sourceMappingURL=session.js.map