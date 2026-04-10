import { auth } from '../../utils/auth'
import { getUserFlags } from '../../services/contacts'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  return getUserFlags(session.user.id)
})