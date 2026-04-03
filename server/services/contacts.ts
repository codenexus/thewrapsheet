import { db } from '../utils/db'
import { contacts, socialHandles } from '../../db/schema.ts'
import { eq, and, or, ilike } from 'drizzle-orm'
import type { NewContact, NewSocialHandle } from '../../db/schema.ts'

export async function getContacts(userId: string, status?: 'active' | 'archived') {
  return db.query.contacts.findMany({
    where: status
      ? and(eq(contacts.userId, userId), eq(contacts.status, status))
      : eq(contacts.userId, userId),
    with: { socialHandles: true },
    orderBy: (contacts, { asc }) => [asc(contacts.firstName)],
  })
}

export async function getContact(userId: string, contactId: string) {
  return db.query.contacts.findFirst({
    where: and(eq(contacts.userId, userId), eq(contacts.id, contactId)),
    with: { socialHandles: true },
  })
}

export async function createContact(userId: string, data: Omit<NewContact, 'userId'>) {
  const [contact] = await db.insert(contacts).values({ ...data, userId }).returning()
  return contact
}

export async function updateContact(userId: string, contactId: string, data: Partial<NewContact>) {
  const [contact] = await db
    .update(contacts)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(contacts.userId, userId), eq(contacts.id, contactId)))
    .returning()
  return contact
}

export async function archiveContact(userId: string, contactId: string) {
  return updateContact(userId, contactId, { status: 'archived' })
}

export async function findMatchingContact(userId: string, firstName: string, lastName?: string, phone?: string, email?: string) {
  const conditions = [eq(contacts.userId, userId)]
  const orConditions = []

  if (firstName) orConditions.push(ilike(contacts.firstName, firstName))
  if (phone) orConditions.push(eq(contacts.phone, phone))
  if (email) orConditions.push(eq(contacts.email, email))

  if (orConditions.length === 0) return null

  return db.query.contacts.findFirst({
    where: and(...conditions, or(...orConditions)),
    with: { socialHandles: true },
  })
}

export async function addSocialHandle(contactId: string, data: Omit<NewSocialHandle, 'contactId'>) {
  const [handle] = await db.insert(socialHandles).values({ ...data, contactId }).returning()
  return handle
}

export async function removeSocialHandle(contactId: string, handleId: string) {
  await db.delete(socialHandles).where(
    and(eq(socialHandles.id, handleId), eq(socialHandles.contactId, contactId))
  )
}
