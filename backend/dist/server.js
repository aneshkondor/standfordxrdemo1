"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const websocketServer_1 = require("./websocketServer");
const session_1 = __importDefault(require("./routes/session"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Vite dev server
    credentials: true
}));
app.use(express_1.default.json());
// Register routes
app.use('/session', session_1.default);
// Basic health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Backend server is running' });
});
// Create HTTP server
const server = http_1.default.createServer(app);
// Create WebSocket server instance attached to Express HTTP server
const wsServer = new websocketServer_1.AudioStreamingWebSocketServer(server);
wsServer.initialize();
// Track active OpenAI sessions
const activeSessions = new Map();
// Note: WebSocket connection handling is managed by AudioStreamingWebSocketServer
// OpenAI integration will be wired in Phase 3 (Task 3.2/3.3)
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
// Start server (both Express and WebSocket on same port)
server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`HTTP endpoint: http://localhost:${PORT}/health`);
    console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Connected WebSocket clients: ${wsServer.getClientCount()}`);
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