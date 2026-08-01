import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * GitHub Pages no sabe reescribir rutas hacia el index de una SPA: al abrir
 * un enlace profundo devuelve su propio 404. Servir una copia byte a byte de
 * index.html como 404.html deja que el router resuelva la ruta en el cliente,
 * y evita tener que caer en URLs con `#`.
 */
function githubPagesSpaFallback() {
  return {
    name: 'naturia:gh-pages-spa-fallback',
    closeBundle() {
      const dist = resolve(import.meta.dirname, 'dist')
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
    },
  }
}

export default defineConfig(({ mode }) => {
  // `process.env` no ve los archivos .env: hay que cargarlos explicitamente
  // para que VITE_BASE funcione tal como se documenta en .env.example.
  const env = loadEnv(mode, import.meta.dirname, 'VITE_')

  // El repositorio es `citizen-netizen/NaturIA` y las rutas de GitHub Pages
  // distinguen mayusculas: `/naturia/` daria 404. Se sobreescribe con
  // VITE_BASE=/ para dominios propios o para servir desde la raiz.
  const base = env.VITE_BASE || '/NaturIA/'
  const apiUrl = env.VITE_API_URL ?? ''

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        // La app se actualiza sola en la siguiente visita. En una feria nadie
        // va a pulsar un aviso de "hay una version nueva".
        registerType: 'autoUpdate',
        includeAssets: ['icons/favicon.svg', 'icons/apple-touch-icon.png'],

        manifest: {
          id: base,
          name: 'NaturIA — Ciencias Naturales con IA',
          short_name: 'NaturIA',
          description:
            'Aprende Ciencias Naturales con inteligencia artificial y pensamiento crítico. Feria de la Ciencia, I.E. Luis Andrade Valderrama.',
          lang: 'es',
          dir: 'ltr',
          // `start_url` y `scope` deben coincidir con la ruta real de
          // publicacion. El proyecto anterior declaraba scope "/" con
          // start_url "./index.html", y eso rompia la instalacion en una
          // subruta de GitHub Pages.
          start_url: base,
          scope: base,
          display: 'standalone',
          orientation: 'portrait-primary',
          background_color: '#f7f8fa',
          theme_color: '#0d6d63',
          categories: ['education', 'science'],
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            // Android puede recortar el icono: los maskable llevan su propio
            // margen de seguridad y deben ir en una entrada aparte, no
            // combinados como "any maskable".
            {
              src: 'icons/icon-maskable-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: 'icons/icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },

        workbox: {
          globPatterns: ['**/*.{js,css,html,woff2,png,svg}'],
          // Toda navegacion se resuelve con el app shell...
          navigateFallback: `${base}index.html`,
          // ...menos las rutas de API. Sin esta lista, una peticion al tutor
          // que falle recibiria el HTML del index y el parser de JSON
          // reventaria. Es exactamente el fallo que tenia el service worker
          // artesanal del proyecto anterior.
          navigateFallbackDenylist: [/\/api\//],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              // El Worker de IA nunca se cachea: las respuestas son unicas
              // por conversacion y servir una vieja seria peor que fallar.
              urlPattern: ({ url }) => Boolean(apiUrl) && url.href.startsWith(apiUrl),
              handler: 'NetworkOnly',
            },
            {
              urlPattern: ({ request }) => request.destination === 'font',
              handler: 'CacheFirst',
              options: {
                cacheName: 'naturia-fuentes',
                expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },

        devOptions: { enabled: false },
      }),
      githubPagesSpaFallback(),
    ],
    build: {
      target: 'es2022',
      // Los celulares de la feria son de gama baja: conviene saber si el
      // bundle empieza a crecer sin control.
      chunkSizeWarningLimit: 400,
    },
  }
})
