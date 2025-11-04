/// <reference types="node" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

const backendTarget = process.env.VITE_PROXY_BACKEND ?? 'http://localhost:8081' // Backend principal
const ocrTarget = process.env.VITE_PROXY_OCR ?? 'http://localhost:8080' // Servicio OCR

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'datumredsoft.png', 'google.png'],
      
      manifest: {
        name: 'Datum Travels - Gestión de Gastos',
        short_name: 'Datum Travels',
        description: 'Sistema de gestión de gastos y viáticos para empleados de Datum',
        theme_color: '#0c4a6e', // Color de tu tema (sky-900)
        background_color: '#1b2024',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        
        // Configuración adicional para mejor experiencia
        categories: ['business', 'finance', 'productivity'],
        lang: 'es-SV',
        dir: 'ltr',
      },
      
      workbox: {
        // Estrategias de caché
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
              }
            }
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutos
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        
        // Archivos a cachear al instalar
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        
        // Ignorar ciertas rutas
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
      
      devOptions: {
        enabled: true, // Habilitar en desarrollo para pruebas
        type: 'module'
      }
    })
  ],
  
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      // Proxy para el servicio OCR (puerto 8080)
      '/api/ocr': {
        target: ocrTarget,
        changeOrigin: true,
        secure: false,
      },
      // Proxy para el backend principal (puerto 8081)
      // IMPORTANTE: Este debe ir después de /api/ocr para que no lo sobrescriba
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
