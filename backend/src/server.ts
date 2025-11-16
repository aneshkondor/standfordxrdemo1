import express, { Request, Response } from 'express';
import http from 'http';
import { AudioStreamingWebSocketServer } from './websocketServer';
import sessionRouter from './routes/session';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Register routes
app.use('/session', sessionRouter);

// Basic health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server instance attached to Express HTTP server
const wsServer = new AudioStreamingWebSocketServer(server);
wsServer.initialize();

// Start server (both Express and WebSocket on same port)
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`HTTP endpoint: http://localhost:${PORT}/health`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`Connected WebSocket clients: ${wsServer.getClientCount()}`);
});
