import { auth } from '../../utils/auth'
import { deleteDate } from '../../services/contacts'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const id = getRouterParam(event, 'id')!
  await deleteDate(session.user.id, id)
  return { success: true }
})
