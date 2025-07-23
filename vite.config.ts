import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/core'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@features': path.resolve(__dirname, './src/features'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // Увеличить лимит предупреждения до 1 МБ
    rollupOptions: {
      output: {
        manualChunks: {
          // Разделяем крупные библиотеки в отдельные чанки
          'vendor-react': ['react', 'react-dom'],
          'vendor-chartjs': ['chart.js', 'react-chartjs-2'],
          'vendor-exceljs': ['exceljs'],
          'vendor-framer': ['framer-motion'],
          'vendor-zustand': ['zustand'],
          'vendor-twa': ['@twa-dev/sdk'],
        },
      },
    },
  },
});