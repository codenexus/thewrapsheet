import { auth } from '../../utils/auth'
import { createDate } from '../../services/contacts'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event)

  if (!body.contactId || !body.date || !body.title) {
    throw createError({ statusCode: 400, message: 'contactId, date, and title are required' })
  }

  return createDate(session.user.id, {
    contactId: body.contactId,
    date: body.date,
    title: body.title,
    notes: body.notes ?? null,
  })
})
