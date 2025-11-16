# Aila VR Therapy - WebSpatial visionOS App

A Vision Pro spatial wellbeing companion with conversational AI therapy, built with React, Three.js, and WebSpatial.

## Building for visionOS

**Requirements:**
- macOS with Xcode installed
- Vision Pro Simulator (included with Xcode)
- Node.js and npm

### Build and Run on Vision Pro Simulator

```bash
# Install dependencies
npm install

# Build and run on Vision Pro Simulator
npm run build:visionos
```

This will:
1. Build the React app with Vite
2. Package it with WebSpatial for visionOS
3. Launch the app in Vision Pro Simulator

### Build IPA for Device Deployment

```bash
# Build IPA for deploying to actual Vision Pro device
npm run build:ipa
```

The IPA file will be generated in the build output directory and can be sideloaded to your Vision Pro device.

## Development

### Web Development Mode

For rapid development, you can run the app as a standard web app:

```bash
# Start development server
npm run dev

# Access at http://localhost:5173
# Or from Vision Pro on local network: http://YOUR_IP:5173
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Backend API URL
VITE_API_URL=http://localhost:3001

# WebSocket URL for real-time audio
VITE_WS_URL=ws://localhost:3001
```

### Project Structure

- `src/` - React application source
  - `components/` - React components including spatial UI
  - `xr/` - WebXR session management
  - `audio/` - Audio pipeline (mic capture, VAD, playback)
  - `api/` - Backend API and WebSocket clients
- `public/` - Static assets including `manifest.json`
- `dist/` - Build output (generated)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
