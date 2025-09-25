import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // ✅ Configuration PWA
    VitePWA({
      registerType: 'autoUpdate', // met à jour le service worker automatiquement
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Allo Bailleur',
        short_name: 'AlloBailleur',
        description: 'Un portail immobilier connectant les chercheurs de logement aux promoteurs',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#FF0086',
        icons: [
          {
            src: '/icons/allo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/allo512.png',
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
    rollupOptions: {
      output: {
        // ✅ Séparation des librairies lourdes
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        }
      }
    },
    // optionnel : avertissement chunk > 1 Mo
    chunkSizeWarningLimit: 1000,
  }
})
