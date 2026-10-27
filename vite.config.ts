import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version: string }

/**
 * Alamat publik aplikasi. Dipakai untuk URL absolut og:image/og:url — sebagian
 * platform (WhatsApp, LinkedIn, X) tidak mau menerima URL relatif.
 * Ubah lewat env `VITE_SITE_URL` saat build di hosting.
 */
const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://kognitif-visual.vercel.app').replace(
  /\/+$/,
  '',
)

// https://vite.dev/config/
export default defineConfig({
  define: {
    // Versi ikut ter-update oleh semantic-release lewat package.json.
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    setupFiles: ['./src/test/setup.ts'],
  },
  plugins: [
    {
      name: 'kognitif-site-url',
      transformIndexHtml: {
        order: 'pre',
        handler: (html: string) => html.replaceAll('__SITE_URL__', SITE_URL),
      },
    },
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Kognitif — Latihan Visual',
        short_name: 'Kognitif',
        description:
          'Latihan kognitif visual untuk pasien pasca stroke, didampingi terapis.',
        lang: 'id',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#FAF8F3',
        theme_color: '#FAF8F3',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
        // Gambar OG hanya dipakai crawler media sosial, tidak perlu ikut
        // diprecache ke setiap perangkat.
        globIgnores: ['**/og-image.png'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
