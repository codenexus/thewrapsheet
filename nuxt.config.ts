export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  nitro: {
    preset: 'node-server',
  },
  modules: [
    '@vite-pwa/nuxt',
  ],
  pwa: {
    manifest: {
      name: 'The Wrap Sheet',
      short_name: 'WrapSheet',
      description: 'Your personal black book',
      theme_color: '#000000',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
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
