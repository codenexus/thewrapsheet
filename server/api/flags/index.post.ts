import { auth } from '../../utils/auth'
import { getUserFlags, createUserFlag } from '../../services/contacts'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event)
  const existing = await getUserFlags(session.user.id)

  if (existing.length >= 12) {
    throw createError({ statusCode: 400, message: 'Maximum of 12 flags allowed' })
  }

  return createUserFlag(session.user.id, {
    emoji: body.emoji,
    label: body.label,
    sortOrder: existing.length,
  })
})