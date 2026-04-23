import { auth } from '../../../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  await auth.api.setPassword({
    body: {
      newPassword: body.password,
    },
    headers: event.headers,
  })

  return { success: true }
})