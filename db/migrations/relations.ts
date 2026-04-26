import { relations } from "drizzle-orm/relations";
import { contacts, contactFlags, userFlags, user, session, images, socialHandles, account } from "./schema";

export const contactFlagsRelations = relations(contactFlags, ({one}) => ({
	contact: one(contacts, {
		fields: [contactFlags.contactId],
		references: [contacts.id]
	}),
	userFlag: one(userFlags, {
		fields: [contactFlags.flagId],
		references: [userFlags.id]
	}),
}));

export const contactsRelations = relations(contacts, ({one, many}) => ({
	contactFlags: many(contactFlags),
	images: many(images),
	socialHandles: many(socialHandles),
	user: one(user, {
		fields: [contacts.userId],
		references: [user.id]
	}),
}));

export const userFlagsRelations = relations(userFlags, ({one, many}) => ({
	contactFlags: many(contactFlags),
	user: one(user, {
		fields: [userFlags.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	userFlags: many(userFlags),
	sessions: many(session),
	contacts: many(contacts),
	accounts: many(account),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const imagesRelations = relations(images, ({one}) => ({
	contact: one(contacts, {
		fields: [images.contactId],
		references: [contacts.id]
	}),
}));

export const socialHandlesRelations = relations(socialHandles, ({one}) => ({
	contact: one(contacts, {
		fields: [socialHandles.contactId],
		references: [contacts.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));