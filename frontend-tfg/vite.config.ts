import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy all /api requests to the Spring Boot backend.
    // This means the browser talks to localhost:5173/api — same origin — so
    // there are zero CORS issues regardless of backend CORS config.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
