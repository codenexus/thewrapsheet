import { auth } from '../../../../utils/auth'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  await auth.api.setUserPassword({
    body: {
      newPassword: body.password,
      userId: id,
    },
    headers: event.headers,
  })

  return { success: true }
})