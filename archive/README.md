# VR Therapy Room

A WebXR virtual reality therapy room with an AI therapist powered by OpenAI's Realtime API.

## Features

- 🏠 Cozy, warm therapy room environment
- 🤖 Friendly robot therapist with animations
- 🎙️ Real-time voice conversations using OpenAI Realtime API
- 🔄 Auto-reload during development
- 🔒 HTTPS support for WebXR compatibility

## Setup

1. Install dependencies (browser-sync will be installed automatically):
```bash
npm start
```

2. The server will start on `https://10.0.0.40:8443`

## Using on Pico 4

1. Make sure your Pico 4 and computer are on the same WiFi network
2. On your Pico 4 browser, navigate to: `https://10.0.0.40:8443`
3. Accept the security certificate warning (it's safe, self-signed for local development)
4. Click "Enter VR" button
5. Press "Press to Talk" button to start talking to your AI therapist
6. Hold the button while speaking, release when done
7. The robot will respond with voice

## Features in VR

- **Warm lighting**: Soft, warm colors create a calming atmosphere
- **Robot animations**: The robot breathes, blinks, and reacts to conversation
- **Voice controls**: Press to talk, automatic voice activity detection
- **Spatial audio**: Immersive 3D audio experience

## Development

The server automatically reloads when you make changes to `index.html`. Just edit and save, and your browser will refresh automatically.

## Therapist Personality

The AI is configured to be:
- Warm and empathetic
- Supportive and encouraging
- Patient and calming
- Non-judgmental

## Model Used

Using `gpt-4o-realtime-preview-2024-10-01` - the most cost-effective realtime model for testing.

## Controls

- **Press to Talk button**: Click or tap to start recording
- **Spacebar**: Alternative way to talk (desktop only)
- **VR Button**: Enter/exit VR mode

## Troubleshooting

- **"WebXR needs HTTPS"**: Make sure you're accessing via `https://` not `http://`
- **Connection errors**: Check that your API key is valid and has Realtime API access
- **Audio issues**: Make sure microphone permissions are granted in your browser
- **Can't connect**: Verify both devices are on the same network and firewall isn't blocking port 8443
