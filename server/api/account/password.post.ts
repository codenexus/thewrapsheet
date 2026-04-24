import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event)

  await auth.api.changePassword({
    body: {
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    },
    headers: event.headers,
  })

  return { success: true }
})