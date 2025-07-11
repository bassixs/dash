import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.xlsx'],
  preview: {
    allowedHosts: ['aede04e8e975.ngrok-free.app']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'exceljs', '@twa-dev/sdk', 'react-virtuoso', 'react-chartjs-2', 'chart.js'],
        },
      },
    },
  },
});