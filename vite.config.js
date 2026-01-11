import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3017, // Change this to your desired port
    host: true, // Set to true to expose to the network (e.g., for testing on mobile)
  },
});
