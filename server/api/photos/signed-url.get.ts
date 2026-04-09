import { auth } from '../../utils/auth'
import { getSignedUrl } from '../../utils/storage'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const query = getQuery(event)
  const path = query.path as string

  if (!path) throw createError({ statusCode: 400, message: 'Missing path' })

  const signedUrl = await getSignedUrl(path)
  return { signedUrl }
})
