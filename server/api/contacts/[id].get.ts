import { auth } from '../../utils/auth'
import { getContact } from '../../services/contacts'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const id = getRouterParam(event, 'id')!
  const contact = await getContact(session.user.id, id)

  if (!contact) throw createError({ statusCode: 404, message: 'Contact not found' })

  return contact
})
