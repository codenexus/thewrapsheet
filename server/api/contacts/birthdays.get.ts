import { auth } from '../../utils/auth'
import { db } from '../../utils/db'
import { contacts } from '../../../db/schema'
import { eq, and, isNotNull } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const allContacts = await db.query.contacts.findMany({
    where: and(
      eq(contacts.userId, session.user.id),
      eq(contacts.status, 'active'),
      isNotNull(contacts.birthday)
    ),
  })

  const today = new Date()
  const todayMonth = today.getMonth()
  const todayDay = today.getDate()
  const todayYear = today.getFullYear()

  const upcoming = allContacts
    .map(contact => {
      const bday = new Date(contact.birthday! + 'T00:00:00')
      const bdayMonth = bday.getMonth()
      const bdayDay = bday.getDate()

      // Next birthday this year or next
      let nextBirthday = new Date(todayYear, bdayMonth, bdayDay)
      if (nextBirthday < today) {
        nextBirthday = new Date(todayYear + 1, bdayMonth, bdayDay)
      }

      const daysUntil = Math.ceil(
        (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      const turningAge = nextBirthday.getFullYear() - bday.getFullYear()

      return {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        birthday: contact.birthday,
        daysUntil,
        turningAge,
        isToday: daysUntil === 0,
      }
    })
    .filter(c => c.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  return upcoming
})