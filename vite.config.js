import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './', // 🔹 chemins relatifs pour Render
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // met à jour automatiquement le SW
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Allo Bailleur',
        short_name: 'AlloBailleur',
        description: 'Un portail immobilier connectant les chercheurs de logement aux promoteurs',
        start_url: './index.html',
        scope: './',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#FF0086',
        lang: 'en',
        icons: [
          {
            src: './icons/allo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: './icons/allo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // facultatif : augmente la limite pour éviter les warnings
  }
});
