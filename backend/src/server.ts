import express, { Request, Response } from 'express';
import http from 'http';
import { AudioStreamingWebSocketServer } from './websocketServer';
import sessionRouter from './routes/session';
import { OpenAISessionManager } from './openai/sessionManager';

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

// Track active OpenAI sessions
const activeSessions = new Map<string, OpenAISessionManager>();

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
  } else {
    console.log('✓ OPENAI_API_KEY is configured');
  }
});
