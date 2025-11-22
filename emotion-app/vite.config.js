import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      usePolling: true, // Needed for Docker on some systems
    },
    host: true,         // CRITICAL: Allows Docker port mapping to work
    strictPort: true,
    port: 5173,
  }
})
