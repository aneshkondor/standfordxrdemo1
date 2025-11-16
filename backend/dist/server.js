"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
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
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.on('message', (message) => {
        console.log('Received message:', message.toString());
    });
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});
// Start server
server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`HTTP endpoint: http://localhost:${PORT}/health`);
    console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map