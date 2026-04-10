import { auth } from '../../../../utils/auth'
import { getContact, unsetContactFlag } from '../../../../services/contacts'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const id = getRouterParam(event, 'id')!
  const flagId = getRouterParam(event, 'flagId')!

  const contact = await getContact(session.user.id, id)
  if (!contact) throw createError({ statusCode: 404, message: 'Contact not found' })

  await unsetContactFlag(id, flagId)
  return { success: true }
})