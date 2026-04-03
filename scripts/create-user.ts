import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import * as schema from '../db/schema.ts'

const client = postgres(process.env.DATABASE_URL!, { prepare: false })
const db = drizzle(client, { schema })

const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: { enabled: true },
})

const result = await auth.api.signUpEmail({
  body: {
    email: 'keirockjd@gmail.com',
    password: 'OekHaGtc23$456',
    name: 'James',
  },
})

console.log('User created:', result)
await client.end()
