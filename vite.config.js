import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'Logo_sin_fondo.png'],
      manifest: {
        name: 'DripGestión',
        short_name: 'DripGestión',
        description: 'Sistema de Gestión Logística para distribuidores de agua',
        theme_color: '#0ea5e9',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/Logo_sin_fondo.png',
            sizes: '512x512',
            type: 'image/png',
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^.*\/api\/v1\/.*/i, 
            handler: 'NetworkFirst', 
            options: {
              cacheName: 'dripgestion-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: true 
  }
});