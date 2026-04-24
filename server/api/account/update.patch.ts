import { auth } from '../../utils/auth'
import { db } from '../../utils/db'
import { user } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event)

  const [updated] = await db.update(user)
    .set({ name: body.name, email: body.email })
    .where(eq(user.id, session.user.id))
    .returning()

  return updated
})