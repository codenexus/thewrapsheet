export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  nitro: {
    preset: 'node-server',
  },
  modules: [
    '@vite-pwa/nuxt',
    '@sentry/nuxt/module',
  ],
  sentry: {
    autoInjectServerSentry: 'top-level-import',
  },
  css: ['~/assets/main.css'],
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Boogaloo&family=Fredoka:wght@300;400;500;600&display=swap' },
      ],
    },
  },
  pwa: {
    manifest: {
      name: 'The Wrap Sheet',
      short_name: 'WrapSheet',
      description: 'Your personal black book',
      theme_color: '#1a1208',
      icons: [
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    workbox: {
      navigateFallback: null,
    },
  },
  runtimeConfig: {
    databaseUrl: '',
    supabaseUrl: '',
    supabaseSecretKey: '',
    anthropicApiKey: '',
    mailgunApiKey: '',
    mailgunDomain: '',
    betterAuthSecret: '',
    public: {
      betterAuthUrl: '',
    },
  },
})