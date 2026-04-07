import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget =
    env.VITE_DEV_REDIRRECT_MAIN_SERVICE_URL || 'http://localhost:5202'

  return {
  server: {
    port: 3000,
    /** Если VITE_MAIN_SERVICE_URL пустой, axios бьёт в /api/* на этом же хосте — пересылаем на реальный API */
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      app: path.resolve(__dirname, 'src/app'),
      pages: path.resolve(__dirname, 'src/pages'),
      entities: path.resolve(__dirname, 'src/entities'),
      features: path.resolve(__dirname, 'src/features'),
      shared: path.resolve(__dirname, 'src/shared'),
      widgets: path.resolve(__dirname, 'src/widgets'),
      assets: path.resolve(__dirname, 'src/assets'),
    },
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  }
})
