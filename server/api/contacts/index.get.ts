import { auth } from '../../utils/auth'
import { getContacts } from '../../services/contacts'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const query = getQuery(event)
  const status = query.status as 'active' | 'archived' | undefined

  return getContacts(session.user.id, status)
})
