import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression(), // Enables Gzip compression
  ],
  build: {
    minify: 'terser', // Minimizes JS and CSS
  },
  server: {
    host : '0.0.0.0',
    port : 5173
  }
})
