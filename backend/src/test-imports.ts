// Test file to verify Express and WebSocket imports work correctly
import express from 'express';
import { WebSocketServer } from 'ws';
import * as http from 'http';

// Verify Express types are recognized
const testApp: express.Application = express();

// Verify WebSocket types are recognized
const testServer = http.createServer(testApp);
const testWss: WebSocketServer = new WebSocketServer({ server: testServer });

console.log('Express app:', testApp);
console.log('WebSocket server:', testWss);

export {};
