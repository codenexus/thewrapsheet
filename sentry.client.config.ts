import * as Sentry from '@sentry/nuxt'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
})