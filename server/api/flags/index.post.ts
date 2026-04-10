import { auth } from '../../utils/auth'
import { getUserFlags, createUserFlag } from '../../services/contacts'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event)
  const existing = await getUserFlags(session.user.id)

  return createUserFlag(session.user.id, {
    emoji: body.emoji,
    label: body.label,
    sortOrder: existing.length,
  })
})