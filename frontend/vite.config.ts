import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Nếu backend NestJS chạy ở cổng khác (vd 3000), đổi target cho đúng.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
