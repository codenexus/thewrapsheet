import { auth } from '../../utils/auth'
import { archiveContact } from '../../services/contacts'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const id = getRouterParam(event, 'id')!

  return archiveContact(session.user.id, id)
})
