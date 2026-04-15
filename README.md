# 🌯 The Wrap Sheet

A personal contact management app (rolodex-style) for tracking your dating life. Built for self-hosting.

## Features

- 📋 Contact management with photos, social handles, notes and birthdays
- 🏷️ Custom flags per user — track whatever matters to you
- 📧 Email ingestion — send a natural language email to add/update contacts
- 🤖 Claude AI parsing — extracts contact info from plain text emails
- 👥 Multi-user support with Better Auth
- 📱 PWA — installable on mobile
- 🔍 Error tracking with Sentry (optional)

## Tech Stack

- **Frontend/Backend** — [Nuxt 4](https://nuxt.com) (Vue)
- **Database** — [Supabase](https://supabase.com) (Postgres) + [Drizzle ORM](https://orm.drizzle.team)
- **Auth** — [Better Auth](https://better-auth.com)
- **File Storage** — [Supabase Storage](https://supabase.com/storage)
- **Email Ingestion** — [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing) + Cloudflare Worker
- **AI Parsing** — [Anthropic Claude API](https://anthropic.com)
- **Hosting** — [Fly.io](https://fly.io)
- **Error Tracking** — [Sentry](https://sentry.io) (optional)

## Prerequisites

- Node.js 22+
- pnpm
- A [Supabase](https://supabase.com) account
- A [Fly.io](https://fly.io) account
- A [Cloudflare](https://cloudflare.com) account (for email ingestion)
- An [Anthropic](https://console.anthropic.com) API key (for email parsing)
- A [Mailgun](https://mailgun.com) account (optional, for outbound email)
- A [Sentry](https://sentry.io) account (optional, for error tracking)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/codenexus/thewrapsheet.git
cd thewrapsheet
pnpm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Data API** and disable the Data API
3. Go to **Storage** and create a private bucket called `photos` with MIME types restricted to `image/jpeg, image/png, image/webp, image/gif` and max file size 5MB
4. Copy your credentials from **Project Settings → API**

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in your `.env` file with the following values:

- `DATABASE_URL` — Session pooler connection string from Supabase → Connect
- `SUPABASE_URL` — https://your-project.supabase.co
- `SUPABASE_SECRET_KEY` — Secret key from Supabase API settings
- `ANTHROPIC_API_KEY` — From console.anthropic.com
- `MAILGUN_API_KEY` — From Mailgun dashboard (optional)
- `MAILGUN_DOMAIN` — Your domain registered with Mailgun (optional)
- `BETTER_AUTH_SECRET` — Random string: `openssl rand -base64 32`
- `BETTER_AUTH_URL` — http://localhost:3000 for dev, your domain for production
- `WORKER_SECRET` — Random string: `openssl rand -base64 32`
- `NUXT_PUBLIC_SENTRY_DSN` — From Sentry (optional)

### 4. Run database migrations

```bash
pnpm drizzle-kit push
```

### 5. Create your first user

Run the following, replacing the values with your own:

```bash
node --experimental-strip-types --env-file=.env << 'EOF'
import postgres from 'postgres'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './db/schema.ts'

const client = postgres(process.env.DATABASE_URL, { prepare: false })
const db = drizzle(client, { schema })
const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true },
})

const result = await auth.api.signUpEmail({
  body: { email: 'you@email.com', password: 'your-password', name: 'Your Name' }
})
console.log('User created:', result.user)
await client.end()
EOF
```

Then set your inbound email alias:

```bash
node --experimental-strip-types --env-file=.env << 'EOF'
import postgres from 'postgres'
const client = postgres(process.env.DATABASE_URL, { prepare: false })
await client`UPDATE "user" SET inbound_alias = 'add' WHERE email = 'you@email.com'`
await client.end()
EOF
```

### 6. Start the dev server

```bash
pnpm dev
```

Visit http://localhost:3000

## Email Ingestion Setup

The Wrap Sheet can create and update contacts from natural language emails sent to your domain. This requires a Cloudflare account and a domain managed by Cloudflare DNS.

### 1. Set up Cloudflare Email Routing

1. In Cloudflare, go to your domain → **Email → Email Routing**
2. Enable Email Routing
3. Go to **Routing Rules**, enable the catch-all rule set to **Drop**

### 2. Deploy the Email Worker

Clone the companion worker repo and deploy it:

```bash
git clone https://github.com/codenexus/thewrapsheet-email-worker.git
cd thewrapsheet-email-worker
pnpm install
pnpm wrangler secret put WORKER_SECRET
pnpm wrangler deploy
```

Update `wrangler.toml` with your app URL before deploying.

### 3. Create an Email Routing rule

In Cloudflare Email Routing → Routing Rules, create a custom address:

- **Address:** `add@yourdomain.com`
- **Action:** Send to Worker → `thewrapsheet-email-worker`

## Deploying to Fly.io

```bash
flyctl launch
flyctl secrets set \
  DATABASE_URL="your-value" \
  SUPABASE_URL="your-value" \
  SUPABASE_SECRET_KEY="your-value" \
  ANTHROPIC_API_KEY="your-value" \
  BETTER_AUTH_SECRET="your-value" \
  BETTER_AUTH_URL="https://yourdomain.com" \
  WORKER_SECRET="your-value"
flyctl deploy
```

## Adding Users

There is no public signup. To add a friend, run the create user script from Setup step 5 with their details, then set their inbound alias to a unique value (e.g. `add-sarah`).

## License

MIT
