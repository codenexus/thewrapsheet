import { auth } from '../../utils/auth'
import { deleteUserFlag } from '../../services/contacts'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const flagId = getRouterParam(event, 'flagId')!
  await deleteUserFlag(session.user.id, flagId)
  return { success: true }
})