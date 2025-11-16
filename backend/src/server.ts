import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import http from 'http';
import { AudioStreamingWebSocketServer } from './websocketServer';
import sessionRouter from './routes/session';
import { OpenAISessionManager } from './openai/sessionManager';

const app = express();
const PORT = process.env.PORT || 3001;

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

const envOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const allowAllOrigins = process.env.CORS_ALLOW_ALL === 'true';

const allowedOrigins = new Set([...DEFAULT_ALLOWED_ORIGINS, ...envOrigins]);
const localNetworkPattern = /^https?:\/\/((10\.\d{1,3}\.\d{1,3}\.\d{1,3})|(192\.168\.\d{1,3}\.\d{1,3})|(172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}))/;

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (allowAllOrigins || !origin) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin) || localNetworkPattern.test(origin)) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
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
