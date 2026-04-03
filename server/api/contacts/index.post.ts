import { auth } from '../../utils/auth'
import { createContact } from '../../services/contacts'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event)

  return createContact(session.user.id, body)
})
