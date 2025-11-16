# Vision Pro Setup Guide

Complete guide to running Aila VR Therapy on Apple Vision Pro using WebSpatial.

---

## Prerequisites

### On Your Mac:

1. **macOS Sonoma 14.0+**
2. **Xcode 15.2+** with visionOS SDK
   ```bash
   xcode-select --install
   ```
3. **Node.js 18+**
   ```bash
   node --version  # Should be 18.0.0 or higher
   ```
4. **Vision Pro Simulator** (installed with Xcode)

### On Your Vision Pro (Optional - for device testing):

1. **visionOS 1.0+**
2. **Developer Mode enabled**
3. **Same WiFi network as your Mac**

---

## Step 1: Clone and Setup Project

```bash
# Clone the repository
git clone <your-repo-url>
cd standfordxrdemo1

# Checkout the latest branch
git checkout claude/continue-previous-work-013LMqeV7t1SiUFe2pn8Eonv
```

---

## Step 2: Backend Setup (Required)

The backend must be running for the app to work.

```bash
cd backend

# Install dependencies
npm install

# Create .env file with your OpenAI API key
cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
EOF

# Start backend server
npm run dev
```

**Backend should now be running at:** `http://localhost:3001`

Keep this terminal open!

---

## Step 3: Frontend Setup

### Option A: Local Development (Browser Testing)

In a **new terminal**:

```bash
cd webspatial-client

# Install dependencies
npm install

# Create .env file for local development
cp .env.example .env

# Start dev server
npm run dev
```

**Frontend runs at:** `http://localhost:5173`

Open in Chrome/Safari to test before Vision Pro deployment.

---

### Option B: Vision Pro Simulator

In a **new terminal**:

```bash
cd webspatial-client

# Install dependencies (if not done)
npm install

# Build for visionOS and launch in simulator
npm run build:visionos
```

This will:
1. Build the React app
2. Bundle it for visionOS
3. Launch Vision Pro Simulator
4. Install and open the app

**Note:** First build may take 5-10 minutes to compile.

---

### Option C: Vision Pro Device (Real Hardware)

#### Configure Backend URL for Device

1. **Find your Mac's local IP address:**
   ```bash
   ipconfig getifaddr en0
   # Example output: 192.168.1.100
   ```

2. **Update frontend .env file:**
   ```bash
   cd webspatial-client

   # Edit .env to use your Mac's IP
   echo "VITE_API_URL=http://YOUR_MAC_IP:3001" > .env
   # Replace YOUR_MAC_IP with the IP from step 1
   ```

3. **Make sure both devices are on same WiFi network**

4. **Build IPA for device:**
   ```bash
   npm run build:ipa -- --teamId=YOUR_APPLE_TEAM_ID
   ```

   Replace `YOUR_APPLE_TEAM_ID` with your Apple Developer Team ID (found in Xcode under Account settings).

5. **Install on Vision Pro:**
   - Connect Vision Pro via USB-C or WiFi
   - Open the generated `.ipa` in Xcode
   - Select Vision Pro as target device
   - Click Run (⌘R)

---

## Step 4: Testing the App

### In Browser (localhost):

1. Navigate to `http://localhost:5173`
2. Click **"Start Therapy Session"**
3. Allow microphone access
4. Select a tone: **Soft**, **Friendly**, or **Analytical**
5. Speak to test the AI conversation

### In Vision Pro Simulator:

1. App should auto-launch after `npm run build:visionos`
2. Click the **3D robot scene** to activate
3. Microphone simulation works through Mac's mic
4. Audio plays through Mac speakers

### On Vision Pro Device:

1. Launch **Aila VR Therapy** from Home View
2. Position the window in your space
3. Grant microphone permission when prompted
4. Speak naturally - spatial audio will respond
5. Use pinch gestures to interact

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│               Vision Pro App                     │
│  ┌─────────────────────────────────────────┐   │
│  │   React Frontend (WebSpatial SDK)       │   │
│  │  - 3D Robot Scene (Three.js)            │   │
│  │  - Microphone Capture                   │   │
│  │  - Audio Playback                       │   │
│  │  - WebSocket Client                     │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                      ↕ WebSocket (ws://...)
┌─────────────────────────────────────────────────┐
│            Backend Server (Mac)                  │
│  ┌─────────────────────────────────────────┐   │
│  │   Node.js + Express                     │   │
│  │  - WebSocket Server                     │   │
│  │  - OpenAI Realtime API Client           │   │
│  │  - Persona System (3 AI personalities)  │   │
│  │  - Session Management                   │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                      ↕ WebSocket (wss://...)
┌─────────────────────────────────────────────────┐
│            OpenAI Realtime API                   │
│  - GPT-4o with audio input/output               │
│  - Voice Activity Detection (VAD)               │
│  - 24kHz PCM16 audio streaming                  │
└─────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Backend won't start

**Error:** `OPENAI_API_KEY is not set`
- Make sure `backend/.env` exists with your API key
- Check the key is valid

**Error:** `Port 3001 already in use`
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in backend/.env
echo "PORT=3002" >> backend/.env
```

---

### WebSpatial build fails

**Error:** `Cannot find module '@webspatial/vite-plugin'`
```bash
cd webspatial-client
npm install --legacy-peer-deps
```

**Error:** `Manifest not found`
```bash
# Make sure public/manifest.json exists
ls -la public/manifest.json
```

---

### Vision Pro Simulator won't launch

**Error:** `Simulator not found`
```bash
# Open Xcode and install visionOS simulator
# Xcode → Settings → Platforms → visionOS
```

**Error:** `Code signing required`
- Open Xcode
- Sign in with Apple ID
- Select Development Team in project settings

---

### No audio on Vision Pro

**Issue:** Can't hear AI responses
- Check Vision Pro volume (Digital Crown)
- Make sure AirPods are connected (if using)
- Check backend logs for audio processing errors

**Issue:** Microphone not working
- Grant microphone permission in Settings → Privacy
- Check Vision Pro microphone isn't muted
- Test mic in other apps first

---

### WebSocket connection fails

**Error:** `WebSocket connection to 'ws://localhost:3001' failed`

For **browser testing:**
- Make sure backend is running (`npm run dev` in backend folder)
- Check `http://localhost:3001/health` returns `{"status":"ok"}`

For **Vision Pro device:**
- Update `webspatial-client/.env` with your Mac's local IP
- Make sure Mac firewall allows connections on port 3001
- Verify both devices on same WiFi network

```bash
# Test connectivity from Vision Pro
# (use Safari on Vision Pro)
http://YOUR_MAC_IP:3001/health
```

---

## Advanced Configuration

### Change App Bundle ID

Edit `webspatial-client/package.json`:
```json
"build:visionos": "... --bundle-id=com.yourcompany.yourapp"
```

### Change Backend Port

Edit `backend/.env`:
```
PORT=3002
```

Then update `webspatial-client/.env`:
```
VITE_API_URL=http://localhost:3002
```

### Add Custom 3D Models

1. Place `.glb` files in `webspatial-client/public/models/`
2. Update `Robot3DScene.tsx` to load new model:
   ```tsx
   const { scene } = useGLTF('/models/your-model.glb');
   ```

---

## File Structure

```
standfordxrdemo1/
├── backend/                          # Node.js backend
│   ├── src/
│   │   ├── openai/                  # OpenAI integration
│   │   │   ├── realtimeClient.ts    # WebSocket to OpenAI
│   │   │   └── sessionManager.ts    # Session lifecycle
│   │   ├── routes/                  # REST endpoints
│   │   ├── utils/                   # Storage utilities
│   │   └── server.ts                # Express server
│   ├── prompts/                     # AI persona files
│   │   ├── persona_friendly.txt     # Best-friend companion
│   │   ├── persona_analytical.txt   # Analytical companion
│   │   └── persona_therapist.txt    # Therapist-style companion
│   └── .env                         # API keys (gitignored)
│
├── webspatial-client/               # React frontend
│   ├── public/
│   │   ├── manifest.json            # WebSpatial manifest
│   │   └── models/
│   │       └── robot.glb            # 3D robot model
│   ├── src/
│   │   ├── api/                     # API clients
│   │   │   ├── websocketClient.ts   # WebSocket connection
│   │   │   └── sessionApi.ts        # REST API client
│   │   ├── audio/                   # Audio pipeline
│   │   │   ├── audioPipeline.ts     # Complete audio flow
│   │   │   ├── micCapture.ts        # Microphone input
│   │   │   ├── vad.ts               # Voice Activity Detection
│   │   │   └── audioPlayback.ts     # Audio output
│   │   ├── components/              # UI components
│   │   │   ├── CenterDashboard.tsx
│   │   │   ├── LeftTonePanel.tsx
│   │   │   └── Robot3DScene.tsx
│   │   ├── app-shell/               # State management
│   │   │   ├── TherapyStateController.ts
│   │   │   └── TherapyStateProvider.tsx
│   │   └── App.tsx                  # Main app component
│   ├── vite.config.ts               # Vite + WebSpatial config
│   ├── package.json                 # Dependencies + scripts
│   └── .env                         # Backend URL config
│
└── VISION_PRO_SETUP.md              # This guide
```

---

## What's Working

✅ **3 AI Personas:**
- Best-Friend Companion (Soft/Friendly)
- Analytical Companion
- Therapist-Style Companion

✅ **Complete Audio Pipeline:**
- Microphone capture with Voice Activity Detection
- Real-time streaming to OpenAI Realtime API
- Audio response playback

✅ **3D Robot Model:**
- GLB model rendered in spatial scene
- Three.js + React Three Fiber

✅ **WebSocket Communication:**
- Bidirectional audio streaming
- Session state management

✅ **Session Persistence:**
- User memory storage
- Transcript saving
- Cross-session continuity

---

## Known Limitations

⚠️ **WebSpatial SDK Limitations:**
- Hot Module Replacement (HMR) doesn't work for all components
- Must manually refresh or restart dev server for some changes

⚠️ **Simulator Limitations:**
- No hand tracking simulation
- Audio is through Mac speakers/mic, not spatial
- Performance may differ from real device

⚠️ **Beta Status:**
- OpenAI Realtime API is in beta
- WebSpatial SDK is early-stage
- Expect occasional API changes

---

## Next Steps

1. **Test in browser first** - Verify all features work
2. **Run in simulator** - Test visionOS integration
3. **Deploy to device** - Experience full spatial audio
4. **Customize personas** - Edit prompt files in `backend/prompts/`
5. **Add new features** - Refer to `apm/` folder for task breakdown

---

## Support

- **WebSpatial Docs:** https://webspatial.dev/docs
- **OpenAI Realtime API:** https://platform.openai.com/docs/guides/realtime
- **Vision Pro Development:** https://developer.apple.com/visionos/

---

**Built with:**
- WebSpatial React SDK
- OpenAI Realtime API (GPT-4o)
- Three.js / React Three Fiber
- Node.js / Express
- TypeScript
