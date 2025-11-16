import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow access from Vision Pro on local network
    port: 5173
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure manifest.json is copied to dist
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  publicDir: 'public'
})
