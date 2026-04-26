import { getDates } from '../../services/contacts'
import { db } from '../../utils/db'
import { user } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = query.token as string

  if (!token) {
    throw createError({ statusCode: 401, message: 'Missing token' })
  }

  const [recipient] = await db
    .select()
    .from(user)
    .where(eq(user.inboundAlias, token))
    .limit(1)

  if (!recipient) {
    throw createError({ statusCode: 401, message: 'Invalid token' })
  }

  const allDates = await getDates(recipient.id)

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Wrap Sheet//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:The Wrap Sheet',
    'X-WR-CALDESC:Your dates from The Wrap Sheet',
  ]

  for (const d of allDates) {
    const contactName = `${d.contact.firstName}${d.contact.lastName ? ` ${d.contact.lastName}` : ''}`
    const dateStr = d.date.replace(/-/g, '')
    const uid = `${d.id}@thewrapsheet.app`
    const summary = `${d.title} — ${contactName}`
    const created = new Date(d.createdAt).toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${uid}`)
    lines.push(`DTSTART;VALUE=DATE:${dateStr}`)
    lines.push(`DTEND;VALUE=DATE:${dateStr}`)
    lines.push(`SUMMARY:${summary}`)
    if (d.notes) lines.push(`DESCRIPTION:${d.notes.replace(/\n/g, '\\n')}`)
    lines.push(`DTSTAMP:${created}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  setResponseHeader(event, 'Content-Type', 'text/calendar; charset=utf-8')
  setResponseHeader(event, 'Content-Disposition', 'inline; filename="wrapsheet.ics"')

  return lines.join('\r\n')
})