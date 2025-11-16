# Aila VR Therapy - WebSpatial visionOS App

A Vision Pro spatial wellbeing companion with conversational AI therapy, built with React, Three.js, and WebSpatial.

## 🚀 Quick Start

### Prerequisites
- **macOS** with Xcode installed (for visionOS builds)
- **Vision Pro Simulator** (installed via Xcode)
- **Node.js** 18+ and npm

### Installation

```bash
npm install
```

## 📱 Development Workflow

### Step 1: Run the WebSpatial Dev Server

The WebSpatial dev server creates a special build at `/webspatial/avp/` path:

```bash
npm run dev:avp
```

This starts a dev server on **http://localhost:3001** with WebSpatial-specific code at **http://localhost:3001/webspatial/avp/**

Keep this server running in one terminal.

### Step 2: Run the Vision Pro Simulator

In a **separate terminal**, run:

```bash
npm run run:avp
```

This will:
1. Package your app for visionOS
2. Launch the Vision Pro Simulator
3. Install and run the app
4. The app loads from your dev server for hot reload

**Important**: The dev server (Step 1) must be running for this to work!

### Regular Web Development

To develop the regular web version (desktop/mobile):

```bash
npm run dev
```

Access at **http://localhost:5173**

## 🏗️ Building for Production

### Build for Vision Pro Simulator/Device

```bash
# Build the WebSpatial version
npm run build:avp

# Then package as IPA for device deployment
npm run build:ipa
```

The IPA file will be in the build output directory.

## 🌐 URL Structure

WebSpatial requires a specific URL structure:

- **Regular web**: `http://localhost:5173/`
- **WebSpatial**: `http://localhost:3001/webspatial/avp/`

The `/webspatial/avp/` path is automatically created by the `@webspatial/vite-plugin` when you set `XR_ENV=avp`.

## 📁 Project Structure

```
webspatial-client/
├── src/
│   ├── components/      # React components including spatial UI
│   ├── xr/             # WebXR session management
│   ├── audio/          # Audio pipeline (mic, VAD, playback)
│   ├── api/            # Backend API and WebSocket clients
│   └── main.tsx        # App entry point
├── public/
│   └── manifest.json   # PWA manifest with WebSpatial config
├── dist/               # Build output (generated, gitignored)
└── vite.config.ts      # Vite config with WebSpatial plugin
```

## ⚙️ Configuration Files

### manifest.json
Controls the Vision Pro app properties:
- App name, icon, colors
- Start URL and scope
- XR scene dimensions

### vite.config.ts
Configures the build:
- WebSpatial plugin for `/webspatial/avp/` path
- HTML injection for conditional classes
- React JSX transform

### tsconfig.app.json
TypeScript config with:
- `jsxImportSource: "@webspatial/react-sdk"` - enables WebSpatial JSX features

## 🎨 Spatial CSS

Use the `is-spatial` class to target Vision Pro styles:

```css
/* Regular web styles */
.my-component {
  background: white;
}

/* Vision Pro spatial styles */
html.is-spatial .my-component {
  --xr-background-material: translucent;
  --xr-back: 50; /* Z-axis positioning */
}
```

## 🔧 Environment Variables

Copy `.env.example` to `.env`:

```bash
# Backend API URL
VITE_API_URL=http://localhost:3001

# WebSocket URL for real-time audio
VITE_WS_URL=ws://localhost:3001
```

## 🐛 Troubleshooting

### Dev server won't start
- Check if port 3001 is already in use
- Try `npm install` to reinstall dependencies

### Vision Pro Simulator app is blank
- Make sure `npm run dev:avp` is running
- Check the dev server URL in terminal matches the one in package.json
- Delete the app in simulator and rebuild

### Build fails with "ENAMETOOLONG"
- Clean build artifacts: `rm -rf node_modules/.webspatial-builder-temp dist/`
- Rebuild: `npm run build:avp`

### Changes not showing in Vision Pro
- Refresh the scene using the scene menu (three dots in Vision Pro)
- Or restart the app completely

## 📚 Resources

- [WebSpatial Documentation](https://docs.webspatial.dev)
- [Vision Pro Developer Resources](https://developer.apple.com/visionos/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)

## 🎯 Development Tips

1. **Two-server setup**: Always run both dev servers (web + WebSpatial) during development
2. **Hot reload**: Changes to code will hot-reload in the Vision Pro simulator via the dev server
3. **Spatial features**: Only activate in `html.is-spatial` CSS blocks to keep cross-platform compatibility
4. **Testing**: Test on both regular web browsers AND Vision Pro simulator regularly
