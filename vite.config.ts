import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    sveltekit(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'ListForAll',
        short_name: 'ListForAll',
        description: 'A simple task management PWA',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
	  workbox: {
		offlineGoogleAnalytics: true,
		runtimeCaching: [
		  {
			urlPattern: ({ request }) => request.destination === 'document',
			handler: 'NetworkFirst',
			options: {
			  cacheName: 'html-cache',
			  expiration: {
				maxEntries: 10,
				maxAgeSeconds: 86400 // Cache for 1 day
			  }
			}
		  },
		  {
			urlPattern: ({ request }) => request.destination === 'script',
			handler: 'CacheFirst',
			options: {
			  cacheName: 'js-cache'
			}
		  },
		  {
			urlPattern: ({ request }) => request.destination === 'style',
			handler: 'CacheFirst',
			options: {
			  cacheName: 'css-cache'
			}
		  },
		  {
			urlPattern: ({ request }) => request.destination === 'image',
			handler: 'CacheFirst',
			options: {
			  cacheName: 'image-cache'
			}
		  }
		]
	  }
	  
    })
  ]
});

