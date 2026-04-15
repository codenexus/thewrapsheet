import * as Sentry from '@sentry/nuxt'

Sentry.init({
  dsn: 'https://82a3fe52ee3ae0aa28671bc79c5492f4@o330433.ingest.us.sentry.io/4511220825391104',
  tracesSampleRate: 1.0,
})