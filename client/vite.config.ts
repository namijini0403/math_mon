import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // GitHub Pages는 /math_mon/ 하위 경로에서 서빙 (Railway는 루트)
  base: process.env.GHPAGES ? '/math_mon/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '매스몬 - 수학 몬스터 모험',
        short_name: '매스몬',
        description: '석암초등학교 수학 모험 학습앱 — 문제를 풀어 드래곤을 키우세요!',
        lang: 'ko',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#1e1b4b',
        background_color: '#1e1b4b',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
