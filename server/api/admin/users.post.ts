import { auth } from '../../utils/auth'
import { db } from '../../utils/db'
import { user } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = await auth.api.signUpEmail({
    body: {
      email: body.email,
      password: body.password,
      name: body.name,
    },
  })

  if (body.inboundAlias) {
    await db.update(user)
      .set({ inboundAlias: body.inboundAlias, isAdmin: body.isAdmin ?? false })
      .where(eq(user.email, body.email))
  }

  return { success: true, user: result.user }
})