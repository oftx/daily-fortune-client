import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // --- THIS IS THE FIX ---
  // Set the base path to the root directory for all environments.
  // This works for local development, Netlify, Vercel, and other modern hosts.
  base: '/',
})