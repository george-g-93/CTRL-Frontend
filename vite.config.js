import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5180,          // <-- not 5173/5174
    strictPort: true,    // fail if 5180 is taken (so you notice)
    proxy: {
      '/api': 'http://localhost:5050' // dev proxy to backend
    }
  }
})
