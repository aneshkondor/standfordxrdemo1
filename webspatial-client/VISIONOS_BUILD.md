# Building for Vision Pro - macOS Instructions

## Overview

This project is now configured to build as a native visionOS app using WebSpatial. The configuration has been prepared in a Linux environment, but **the actual build must be run on macOS with Xcode installed**.

## What Has Been Configured

✅ **WebSpatial manifest** (`public/manifest.json`)
- Added proper PWA fields required by WebSpatial
- Configured XR scene dimensions for Vision Pro
- Set `start_url` to empty string for correct bundle resource lookup

✅ **Build scripts** (`package.json`)
- `npm run build:visionos` - Build and launch in Vision Pro Simulator
- `npm run build:ipa` - Package IPA for device deployment
- Paths configured to use `dist/` directory to avoid recursive copy issues

✅ **Vite configuration** (`vite.config.ts`)
- Configured to build to `dist/` directory
- Manifest and assets properly copied during build
- Server configured for local network access from Vision Pro

✅ **Dependencies**
- `@webspatial/react-sdk` - React components for spatial computing
- `@webspatial/builder` - Build tool for visionOS packaging
- All required dependencies installed

## Prerequisites (macOS Only)

1. **macOS** (Sonoma or later recommended)
2. **Xcode** (15.0 or later)
   - Install from Mac App Store
   - Accept license: `sudo xcodebuild -license accept`
   - Install Command Line Tools: `xcode-select --install`
3. **Vision Pro Simulator**
   - Open Xcode → Settings → Platforms
   - Download "visionOS" simulator runtime
4. **Node.js** (18+ or latest LTS)

## Build Instructions

### On macOS:

```bash
# 1. Navigate to the webspatial-client directory
cd webspatial-client

# 2. Install dependencies (if not already done)
npm install

# 3. Build and run on Vision Pro Simulator
npm run build:visionos
```

This command will:
1. Compile TypeScript and build the React app with Vite
2. Package the web app using webspatial-builder
3. Create an Xcode project
4. Launch Vision Pro Simulator
5. Install and run the app

### Expected Output:

```
> npm run build:visionos

Building...
✓ built in X.XXs
check manifest.json: ok
move web project: ok
write project.pbxproj: ok
Building with xcodebuild...
Launching Vision Pro Simulator...
App launched successfully!
```

### For Device Deployment:

```bash
# Build IPA package
npm run build:ipa

# The IPA will be in: node_modules/.webspatial-builder-temp/platform-visionos/build/
# Sideload to your Vision Pro device using Xcode or third-party tools
```

## Troubleshooting

### If you get "xcodebuild: not found"
- Ensure Xcode is installed
- Run: `xcode-select --install`
- Verify: `which xcodebuild` (should return a path)

### If Vision Pro Simulator doesn't launch
- Open Xcode → Settings → Platforms
- Download visionOS simulator runtime
- Restart Xcode

### If the app crashes on launch
Check the Xcode console for crash logs. Common issues:
- Manifest.json issues (should be fixed)
- Missing resources (check `dist/` build output)
- WebSocket connection errors (ensure backend is running)

### If you get "ENAMETOOLONG" errors
- This should be fixed by using `dist/` as the project directory
- If it still happens, clean: `rm -rf node_modules/.webspatial-builder-temp`

## Backend Requirements

The app needs the backend server running for full functionality:

```bash
# In a separate terminal, from the root directory:
cd server
npm install
npm start

# Backend will run on http://localhost:3001
# WebSocket on ws://localhost:3001
```

## Testing on Vision Pro Device

1. Connect your Vision Pro to your Mac via USB-C
2. Enable Developer Mode on Vision Pro:
   - Settings → General → Developer Mode → On
3. Trust your Mac from Vision Pro
4. Build and run:
   ```bash
   npm run build:visionos
   ```
5. Xcode will prompt you to select a destination - choose your Vision Pro device

## App Features

When running on Vision Pro, the app provides:
- Spatial UI for therapy sessions
- Real-time voice interaction with OpenAI
- Voice Activity Detection (VAD)
- Audio playback in spatial environment
- 3D therapy session interface

## Next Steps

After successfully building on macOS:
1. Test the app in Vision Pro Simulator
2. Verify WebSocket connection to backend
3. Test voice interaction and audio playback
4. Deploy to physical Vision Pro device for full spatial experience

## Resources

- [WebSpatial Documentation](https://webspatial.dev)
- [Vision Pro Developer Resources](https://developer.apple.com/visionos/)
- [React Three Fiber XR](https://github.com/pmndrs/react-xr)
