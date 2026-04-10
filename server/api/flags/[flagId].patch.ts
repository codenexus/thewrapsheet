import { auth } from '../../utils/auth'
import { updateUserFlag } from '../../services/contacts'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const flagId = getRouterParam(event, 'flagId')!
  const body = await readBody(event)

  return updateUserFlag(session.user.id, flagId, body)
})