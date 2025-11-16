# Aila Therapy Backend

Real-time AI therapy backend with OpenAI Realtime API integration, WebSocket audio streaming, and session management.

## Features

- 🎙️ Real-time audio streaming via WebSocket
- 🤖 OpenAI Realtime API integration
- 🎭 Multiple therapy personas (Friendly, Analytical, Therapist)
- 🔊 Voice Activity Detection (VAD)
- 📝 Session management and memory
- 🔒 CORS protection

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **WebSocket**: ws library
- **AI**: OpenAI Realtime API
- **Audio**: 24kHz PCM16 audio streaming

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your OpenAI API key to .env
# OPENAI_API_KEY=sk-...

# Run in development mode
npm run dev
```

### Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## Environment Variables

Create a `.env` file with these variables:

```env
# Required
OPENAI_API_KEY=sk-...

# Server Configuration
PORT=3002
NODE_ENV=development

# CORS Configuration
CORS_ALLOW_ALL=false
ALLOWED_ORIGINS=https://localhost:3001,https://your-frontend-domain.com
```

## Deploy to Render

### Option 1: Using render.yaml (Recommended)

1. Push this backend code to its own GitHub repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect `render.yaml`
6. Add your `OPENAI_API_KEY` in the Render dashboard
7. Deploy!

### Option 2: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: aila-therapy-backend
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Add Environment Variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NODE_ENV`: production
   - `CORS_ALLOW_ALL`: false
   - `ALLOWED_ORIGINS`: Your frontend URLs (comma-separated)
6. Deploy!

### Post-Deployment

After deployment, your backend will be available at:
```
https://your-app-name.onrender.com
```

Update your frontend `.env` with:
```env
VITE_API_URL=https://your-app-name.onrender.com
VITE_WS_URL=wss://your-app-name.onrender.com
```

## API Endpoints

### HTTP Endpoints

- `GET /health` - Health check
- `POST /session/start` - Start therapy session
- `POST /session/end` - End therapy session

### WebSocket

- `ws://localhost:3002` (development)
- `wss://your-app.onrender.com` (production)

#### WebSocket Events

**Client → Server:**
- `input_audio_buffer.append` - Send audio chunks
- `input_audio_buffer.commit` - Commit audio buffer
- `response.cancel` - Cancel current response

**Server → Client:**
- `session_ready` - Session initialized
- `response_started` - AI response started
- `audio_chunk` - Audio data from AI
- `audio_done` - Audio stream complete
- `speech_started` - AI started speaking
- `speech_stopped` - AI stopped speaking
- `error` - Error occurred

## Project Structure

```
backend/
├── src/
│   ├── server.ts              # Express server + WebSocket setup
│   ├── routes/
│   │   └── session.ts         # Session REST endpoints
│   ├── openai/
│   │   ├── sessionManager.ts  # OpenAI session management
│   │   └── realtimeClient.ts  # OpenAI Realtime API client
│   ├── websocketServer.ts     # WebSocket audio streaming
│   └── prompts/
│       ├── persona_friendly.txt
│       ├── persona_analytical.txt
│       └── persona_therapist.txt
├── .env.example
├── package.json
├── tsconfig.json
├── render.yaml                # Render deployment config
└── README.md
```

## Troubleshooting

### CORS Errors

If you see CORS errors, make sure:
1. Your frontend URL is added to `ALLOWED_ORIGINS` environment variable
2. The URL includes the protocol (https://)
3. No trailing slashes

### WebSocket Connection Fails

- Check that your frontend is using `wss://` (not `ws://`) for production
- Verify the backend URL is correct
- Check Render logs for connection errors

### OpenAI API Errors

- Verify `OPENAI_API_KEY` is set correctly
- Check you have credits in your OpenAI account
- Review supported voice names: alloy, ash, ballad, coral, echo, sage, shimmer, verse, marin, cedar

## License

ISC
