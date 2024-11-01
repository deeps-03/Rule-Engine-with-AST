import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // This allows external access
    port: 5173,       // Specify the port
    strictPort: true, // Ensure it uses this exact port
  },
});