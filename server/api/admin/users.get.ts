import { db } from '../../utils/db'
import { user } from '../../../db/schema'

export default defineEventHandler(async () => {
  return db.select({
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    inboundAlias: user.inboundAlias,
    createdAt: user.createdAt,
  }).from(user).orderBy(user.createdAt)
})