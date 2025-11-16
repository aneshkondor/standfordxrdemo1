import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import webspatial from '@webspatial/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    webspatial({
      platforms: ['visionos']
    })
  ],
  server: {
    host: true, // Allow access from Vision Pro on local network
    port: 5173
  }
})
