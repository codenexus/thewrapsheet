import { auth } from '../../utils/auth'
import { updateContact } from '../../services/contacts'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  return updateContact(session.user.id, id, body)
})
