# OpenAI Realtime API Integration

Complete integration with OpenAI Realtime API for conversational AI therapist capabilities.

## Architecture

### Components

1. **realtimeClient.ts** - Low-level WebSocket client for OpenAI API
   - Connection management with automatic reconnection
   - Session configuration
   - Audio input handling
   - Message sending/receiving

2. **sessionManager.ts** - High-level session orchestration
   - Bridges frontend WebSocket ↔ OpenAI Realtime API
   - Event handling and routing
   - Audio extraction and forwarding
   - Error handling and recovery

3. **server.ts** - Express server with WebSocket support
   - Creates session manager for each client connection
   - Manages session lifecycle
   - Graceful shutdown handling

## Message Flow

### Frontend → Backend → OpenAI

```
Frontend sends:
{
  "type": "audio_input",
  "audio": "<base64 PCM16 audio>"
}
↓
Backend forwards to OpenAI:
{
  "type": "input_audio_buffer.append",
  "audio": "<base64 PCM16 audio>"
}
```

### OpenAI → Backend → Frontend

```
OpenAI sends:
{
  "type": "response.audio.delta",
  "delta": "<base64 PCM16 audio chunk>"
}
↓
Backend forwards to Frontend:
{
  "type": "audio_chunk",
  "audio": "<base64 PCM16 audio chunk>"
}
```

## Event Types

### OpenAI Events (Handled)

- `session.created` - Session initialized
- `session.updated` - Configuration applied
- `input_audio_buffer.speech_started` - User started speaking
- `input_audio_buffer.speech_stopped` - User stopped speaking
- `input_audio_buffer.committed` - Audio buffer committed
- `conversation.item.created` - AI generating response
- `response.audio.delta` - Audio chunk received (forwarded to frontend)
- `response.audio.done` - Audio output complete
- `response.done` - Full response complete
- `error` - API errors

### Frontend Events (Expected)

- `audio_input` - Audio data from microphone
- `stop_audio` - Clear audio buffer
- `commit_audio` - Manually commit buffer (optional with VAD)

### Backend → Frontend Events

- `session_ready` - Connection established
- `speech_started` - User speech detected
- `speech_stopped` - User stopped speaking
- `response_started` - AI generating response
- `audio_chunk` - Audio data to play
- `audio_done` - Audio playback complete
- `response_done` - Ready for next input
- `error` - Error occurred

## Session Configuration

```json
{
  "type": "session.update",
  "session": {
    "modalities": ["text", "audio"],
    "instructions": "<loaded from therapist_system.txt>",
    "voice": "alloy",
    "input_audio_format": "pcm16",
    "output_audio_format": "pcm16",
    "input_audio_transcription": {
      "model": "whisper-1"
    },
    "turn_detection": {
      "type": "server_vad",
      "threshold": 0.5,
      "prefix_padding_ms": 300,
      "silence_duration_ms": 200
    }
  }
}
```

## Error Handling

### Connection Errors
- Automatic reconnection with exponential backoff
- Max 5 retry attempts (1s, 2s, 4s, 8s, 16s delays)

### API Errors
- `invalid_request_error` - Logged with details
- `authentication_error` - API key validation
- `rate_limit_error` - Logged (queuing TODO)
- `server_error` - Automatic reconnection

### Internal Errors
- Message parsing errors logged
- Frontend notified of all errors
- Graceful degradation

## Environment Variables

```bash
OPENAI_API_KEY=sk-proj-...  # Required
PORT=3001                    # Optional, defaults to 3001
NODE_ENV=production          # Optional
```

## Usage

### Start Server

```bash
cd backend
npm run build
npm start
```

### Development Mode

```bash
npm run dev
```

## Integration Reference

Based on proven implementation from `archive/index.html` (lines 428-515):
- WebSocket connection pattern
- Session configuration
- Event handling structure
- Audio delta extraction

## Audio Format

- **Format**: PCM16 (16-bit PCM)
- **Encoding**: Base64
- **Sample Rate**: 24kHz (OpenAI default)
- **Channels**: Mono

## Therapist Persona

Loaded from `backend/prompts/therapist_system.txt`:
- Name: Ally
- Style: Warm, empathetic, supportive
- Response length: 2-3 sentences
- Tone: Calming, conversational, non-judgmental

## Future Enhancements

- [ ] Request queuing for rate limits
- [ ] Audio transcription forwarding
- [ ] Session persistence
- [ ] Multiple voice options
- [ ] Custom VAD parameters
- [ ] Metrics and monitoring
