import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "::",
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      // NOTE: do NOT proxy '/vendors' because that conflicts with SPA route '/vendors' on refresh.
      // API calls should use the '/api' prefix (e.g. '/api/v1/vendors') so the proxy above handles them.
    },
  }
})
