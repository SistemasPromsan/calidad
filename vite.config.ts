import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: mode === 'development' ? {
      '/api': {
        target: 'https://deepskyblue-cat-463569.hostingersite.com/calidad-backend/api/',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    } : undefined
  }
}));
