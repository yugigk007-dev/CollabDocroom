import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // If the frontend asks for /chat, send it to localhost:5000
      '/chat': 'http://localhost:5000',
      '/upload': 'http://localhost:5000'
    }
  }
})