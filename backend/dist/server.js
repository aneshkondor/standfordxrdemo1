"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const websocketServer_1 = require("./websocketServer");
const session_1 = __importDefault(require("./routes/session"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
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
// Start server (both Express and WebSocket on same port)
server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`HTTP endpoint: http://localhost:${PORT}/health`);
    console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
    console.log(`Connected WebSocket clients: ${wsServer.getClientCount()}`);
});
//# sourceMappingURL=server.js.map