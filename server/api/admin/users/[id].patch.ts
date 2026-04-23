import { db } from '../../../utils/db'
import { user } from '../../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const [updated] = await db.update(user)
    .set({
      isAdmin: body.isAdmin,
      inboundAlias: body.inboundAlias,
      name: body.name,
    })
    .where(eq(user.id, id))
    .returning()

  return updated
})