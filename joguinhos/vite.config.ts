import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/joguinhos',
  build: {
    rollupOptions: {
      input: {
        "main": "./index.html",
        "firebase-messaging-sw": "./src/firebase/firebase-messaging-sw.js",
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === "firebase-messaging-sw"
            ? "[name].js" // Output service worker in root
            : "assets/[name]-[hash].js"; // Others in `assets/`
        },
      },
    },
  }
})
