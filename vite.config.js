import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'exceljs', '@twa-dev/sdk', 'react-chartjs-2', 'chart.js'],
        },
      },
    },
  },
  assetsInclude: ['**/*.xlsx'],
});
