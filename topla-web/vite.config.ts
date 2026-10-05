import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      // Dev-də CORS və qarışıq origin problemlərini aradan qaldırır:
      // frontend /api/... çağırır, Vite onu Arenio API-yə ötürür.
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:5077',
          changeOrigin: true,
          secure: false,
        },
        '/Storage': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:5077',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            query: ['@tanstack/react-query', 'axios'],
            charts: ['recharts'],
          },
        },
      },
    },
  }
})
