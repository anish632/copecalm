import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/copecalm/',
  define: {
    __PWA_DISABLED__: true
  },
  build: {
    target: ['es2015', 'safari12'],
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  esbuild: {
    target: 'es2015'
  }
})