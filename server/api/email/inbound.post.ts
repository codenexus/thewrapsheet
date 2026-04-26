import { parseEmailToContact } from '../../services/emailParser'
import { findMatchingContact, createContact, updateContact, addSocialHandle, getUserFlags, setContactFlag } from '../../services/contacts'
import { db } from '../../utils/db'
import { user } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const workerSecret = getHeader(event, 'x-worker-secret')
  if (workerSecret !== process.env.WORKER_SECRET) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { to, subject, body: emailBody } = body

  const toAddress = Array.isArray(to) ? to[0] : to
  const alias = toAddress?.split('@')[0]?.toLowerCase()

  const [recipient] = await db
    .select()
    .from(user)
    .where(eq(user.inboundAlias, alias))
    .limit(1)

  const targetUser = recipient ?? (await db.select().from(user).limit(1))[0]

  if (!targetUser) {
    throw createError({ statusCode: 404, message: 'No user found' })
  }

  // Fetch user's flags to pass to the parser
  const userFlags = await getUserFlags(targetUser.id)

  const parsed = await parseEmailToContact(emailBody, subject ?? '', userFlags)

  if (!parsed.firstName) {
    return { success: false, reason: 'Could not extract contact name' }
  }

  const existing = await findMatchingContact(
    targetUser.id,
    parsed.firstName,
    parsed.lastName ?? undefined,
    parsed.phone ?? undefined,
    parsed.email ?? undefined,
  )

  const needsReview = parsed.confidence === 'low' || parsed.intent === 'ambiguous'

  const contactData = {
    firstName: parsed.firstName,
    lastName: parsed.lastName ?? undefined,
    alias: parsed.alias ?? undefined,
    phone: parsed.phone ?? undefined,
    email: parsed.email ?? undefined,
    notes: parsed.notes ?? undefined,
    needsReview,
    reviewReason: parsed.reviewReason ?? undefined,
  }

  let contactId: string

  if (existing && parsed.intent !== 'create') {
    await updateContact(targetUser.id, existing.id, {
      ...contactData,
      notes: existing.notes
        ? `${existing.notes}\n\n[Email ${new Date().toLocaleDateString()}]: ${parsed.notes ?? ''}`
        : parsed.notes ?? undefined,
    })
    contactId = existing.id
  } else {
    const newContact = await createContact(targetUser.id, contactData)
    contactId = newContact!.id
  }

  if (parsed.socialHandles?.length) {
    await Promise.all(
      parsed.socialHandles.map(h => addSocialHandle(contactId, h))
    )
  }

  // Set matched flags
  if (parsed.matchedFlagLabels?.length && userFlags.length) {
    const matchedFlags = userFlags.filter(f =>
      parsed.matchedFlagLabels!.some(
        label => label.toLowerCase() === f.label.toLowerCase()
      )
    )
    await Promise.all(
      matchedFlags.map(f => setContactFlag(contactId, f.id))
    )
  }

  return { success: true, contactId, intent: parsed.intent, needsReview }
})