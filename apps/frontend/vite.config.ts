import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/chat': {
        target: 'http://api-gateway:3001',
        changeOrigin: true,
        rewrite: path => path
      }
    }
  }
});