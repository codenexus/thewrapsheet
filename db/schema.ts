import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  pgEnum,
  integer,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ───────────────────────────────────────────────────────────────────

export const contactStatusEnum = pgEnum('contact_status', ['active', 'archived'])

// ─── Better Auth Tables ───────────────────────────────────────────────────────

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  inboundAlias: text('inbound_alias').unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
})

// ─── App Tables ───────────────────────────────────────────────────────────────

export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  alias: text('alias'),
  phone: text('phone'),
  email: text('email'),
  status: contactStatusEnum('status').notNull().default('active'),
  mainPhotoUrl: text('main_photo_url'),
  notes: text('notes'),
  needsReview: boolean('needs_review').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const socialHandles = pgTable('social_handles', {
  id: uuid('id').primaryKey().defaultRandom(),
  contactId: uuid('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(),
  handle: text('handle').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const images = pgTable('images', {
  id: uuid('id').primaryKey().defaultRandom(),
  contactId: uuid('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const userFlags = pgTable('user_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  emoji: text('emoji').notNull(),
  label: text('label').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const contactFlags = pgTable('contact_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  contactId: uuid('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  flagId: uuid('flag_id').notNull().references(() => userFlags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof user.$inferSelect
export type Contact = typeof contacts.$inferSelect
export type NewContact = typeof contacts.$inferInsert
export type SocialHandle = typeof socialHandles.$inferSelect
export type NewSocialHandle = typeof socialHandles.$inferInsert
export type Image = typeof images.$inferSelect
export type UserFlag = typeof userFlags.$inferSelect
export type NewUserFlag = typeof userFlags.$inferInsert
export type ContactFlag = typeof contactFlags.$inferSelect

// ─── Relations ────────────────────────────────────────────────────────────────

export const contactsRelations = relations(contacts, ({ many }) => ({
  socialHandles: many(socialHandles),
  images: many(images),
  contactFlags: many(contactFlags),
}))

export const socialHandlesRelations = relations(socialHandles, ({ one }) => ({
  contact: one(contacts, {
    fields: [socialHandles.contactId],
    references: [contacts.id],
  }),
}))

export const imagesRelations = relations(images, ({ one }) => ({
  contact: one(contacts, {
    fields: [images.contactId],
    references: [contacts.id],
  }),
}))

export const userFlagsRelations = relations(userFlags, ({ one, many }) => ({
  user: one(user, {
    fields: [userFlags.userId],
    references: [user.id],
  }),
  contactFlags: many(contactFlags),
}))

export const contactFlagsRelations = relations(contactFlags, ({ one }) => ({
  contact: one(contacts, {
    fields: [contactFlags.contactId],
    references: [contacts.id],
  }),
  flag: one(userFlags, {
    fields: [contactFlags.flagId],
    references: [userFlags.id],
  }),
}))