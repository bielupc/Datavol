import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // En desenvolupament, l'API i els GIFs viuen als contenidors.
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/dataset': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
