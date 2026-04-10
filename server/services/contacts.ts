import { db } from '../utils/db'
import { contacts, socialHandles, userFlags, contactFlags } from '../../db/schema'
import { eq, and, or, ilike } from 'drizzle-orm'
import type { NewContact, NewSocialHandle } from '../../db/schema'
import { normalizePhone } from '../utils/phone'

export async function getContacts(userId: string, status?: 'active' | 'archived') {
  return db.query.contacts.findMany({
    where: status
      ? and(eq(contacts.userId, userId), eq(contacts.status, status))
      : eq(contacts.userId, userId),
    with: { 
      socialHandles: true,
      contactFlags: { with: { flag: true } },
    },
    orderBy: (contacts, { asc }) => [asc(contacts.firstName)],
  })
}

export async function getContact(userId: string, contactId: string) {
  return db.query.contacts.findFirst({
    where: and(eq(contacts.userId, userId), eq(contacts.id, contactId)),
    with: { 
      socialHandles: true,
      contactFlags: { with: { flag: true } },
    },
  })
}

export async function createContact(userId: string, data: Omit<NewContact, 'userId'>) {
  const [contact] = await db.insert(contacts).values({ 
    ...data, 
    userId,
    phone: normalizePhone(data.phone),
    birthday: data.birthday === '' ? null : data.birthday,
  }).returning()
  return contact
}

export async function updateContact(userId: string, contactId: string, data: Partial<NewContact>) {
  const [contact] = await db
    .update(contacts)
    .set({ 
      ...data, 
      phone: data.phone !== undefined ? normalizePhone(data.phone) : undefined,
      birthday: data.birthday === '' ? null : data.birthday,
      updatedAt: new Date() 
    })
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

export async function deleteContact(userId: string, contactId: string) {
  await db.delete(contacts).where(
    and(eq(contacts.userId, userId), eq(contacts.id, contactId))
  )
}

export async function getUserFlags(userId: string) {
  return db.query.userFlags.findMany({
    where: eq(userFlags.userId, userId),
    orderBy: (userFlags, { asc }) => [asc(userFlags.sortOrder)],
  })
}

export async function createUserFlag(userId: string, data: { emoji: string; label: string; sortOrder: number }) {
  const [flag] = await db.insert(userFlags).values({ ...data, userId }).returning()
  return flag
}

export async function deleteUserFlag(userId: string, flagId: string) {
  await db.delete(userFlags).where(
    and(eq(userFlags.id, flagId), eq(userFlags.userId, userId))
  )
}

export async function updateUserFlag(userId: string, flagId: string, data: { emoji?: string; label?: string; sortOrder?: number }) {
  const [flag] = await db.update(userFlags).set(data).where(
    and(eq(userFlags.id, flagId), eq(userFlags.userId, userId))
  ).returning()
  return flag
}

export async function getContactFlags(contactId: string) {
  return db.query.contactFlags.findMany({
    where: eq(contactFlags.contactId, contactId),
    with: { flag: true },
  })
}

export async function setContactFlag(contactId: string, flagId: string) {
  const existing = await db.query.contactFlags.findFirst({
    where: and(eq(contactFlags.contactId, contactId), eq(contactFlags.flagId, flagId)),
  })
  if (!existing) {
    await db.insert(contactFlags).values({ contactId, flagId })
  }
}

export async function unsetContactFlag(contactId: string, flagId: string) {
  await db.delete(contactFlags).where(
    and(eq(contactFlags.contactId, contactId), eq(contactFlags.flagId, flagId))
  )
}