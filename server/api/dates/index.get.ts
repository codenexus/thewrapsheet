import { auth } from '../../utils/auth'
import { getDates } from '../../services/contacts'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const query = getQuery(event)
  const contactId = query.contactId as string | undefined

  return getDates(session.user.id, contactId)
})
