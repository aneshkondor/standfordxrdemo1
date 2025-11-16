"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const sessionManager_1 = require("./openai/sessionManager");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use(express_1.default.json());
// Basic health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Backend server is running' });
});
// Create HTTP server
const server = http_1.default.createServer(app);
// Create WebSocket server
const wss = new ws_1.WebSocketServer({ server });
// Track active sessions
const activeSessions = new Map();
wss.on('connection', (ws) => {
    console.log('✓ WebSocket client connected');
    // Create unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log(`Created session: ${sessionId}`);
    // Create and initialize OpenAI session manager
    const sessionManager = new sessionManager_1.OpenAISessionManager(ws);
    activeSessions.set(sessionId, sessionManager);
    // Initialize the OpenAI connection
    sessionManager.initialize().catch((error) => {
        console.error('Failed to initialize OpenAI session:', error);
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to initialize AI therapist session',
            error: error instanceof Error ? error.message : 'Unknown error'
        }));
    });
    ws.on('close', () => {
        console.log(`WebSocket client disconnected - session: ${sessionId}`);
        // Cleanup session
        const session = activeSessions.get(sessionId);
        if (session) {
            session.cleanup();
            activeSessions.delete(sessionId);
        }
    });
    ws.on('error', (error) => {
        console.error(`WebSocket error - session: ${sessionId}`, error);
        // Cleanup session on error
        const session = activeSessions.get(sessionId);
        if (session) {
            session.cleanup();
            activeSessions.delete(sessionId);
        }
    });
});
// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    // Cleanup all active sessions
    activeSessions.forEach((session, sessionId) => {
        console.log(`Cleaning up session: ${sessionId}`);
        session.cleanup();
    });
    activeSessions.clear();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
// Start server
server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`HTTP endpoint: http://localhost:${PORT}/health`);
    console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    // Verify OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️  WARNING: OPENAI_API_KEY environment variable is not set!');
        console.warn('   The server will not be able to connect to OpenAI Realtime API.');
    }
    else {
        console.log('✓ OPENAI_API_KEY is configured');
    }
});
//# sourceMappingURL=server.js.map