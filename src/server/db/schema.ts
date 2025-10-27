import { relations, sql } from "drizzle-orm";
import { index, pgEnum, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";
import { required } from "zod/v4-mini";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `stumate_${name}`);

export const forms = createTable("form", (d) => ({
	id: d.uuid().notNull().primaryKey().defaultRandom(),
	title: d.varchar({ length: 255 }).notNull(),
	description: d.text().notNull(),
	config: d.jsonb().notNull(),
	createdBy: d
		.uuid()
		.notNull()
		.references(() => users.id),
	createdAt: d.timestamp().defaultNow(),
	updatedAt: d.timestamp().defaultNow(),
}));

export const formSections = createTable("form_section", (d) => ({
	id: d.uuid().notNull().primaryKey().defaultRandom(),
	formId: d
		.uuid()
		.notNull()
		.references(() => forms.id),
	title: d.varchar({ length: 255 }).notNull(),
	description: d.text().notNull(),
	config: d.jsonb().notNull(),
	order: d.integer().notNull(),
}));

export const formQuestions = createTable("form_question", (d) => ({
	id: d.uuid().notNull().primaryKey().defaultRandom(),
	sectionId: d
		.uuid()
		.notNull()
		.references(() => formSections.id),
	questionText: d.text().notNull(),
	questionType: d.varchar({ length: 100 }).notNull(),
	required: d.boolean().notNull().default(false),
	config: d.jsonb().notNull(),
	order: d.integer().notNull(),
}));

export const formResponsesLog = createTable("form_response_log", (d) => ({
	id: d.uuid().notNull().primaryKey().defaultRandom(),
	formId: d
		.uuid()
		.notNull()
		.references(() => forms.id),
	submittedAt: d.timestamp().defaultNow(),
	updatedAt: d.timestamp().defaultNow(),
	responderId: d.uuid().references(() => users.id),
}));

export const formResponses = createTable("form_response", (d) => ({
	responseLogId: d
		.uuid()
		.notNull()
		.references(() => formResponsesLog.id)
		.primaryKey(),
	answer: d.jsonb().notNull(),
}));

const rolesValues = ["USER", "ADMIN", "DEV"] as const;
export const roles = pgEnum("user_role", rolesValues);
export type UserRole = (typeof rolesValues)[number];

export const users = createTable("user", (d) => ({
	id: d.uuid().notNull().primaryKey().defaultRandom(),
	name: d.varchar({ length: 255 }),
	role: roles("role").default("USER").notNull(),
	passwordHash: d.char({ length: 60 }),
	email: d.varchar({ length: 255 }).notNull().unique(),
	emailVerified: d.timestamp({
		mode: "date",
		withTimezone: true,
	}),
	image: d.varchar({ length: 255 }),
}));

export const usersMetadata = createTable("user_metadata", (d) => ({
	userId: d
		.uuid()
		.notNull()
		.primaryKey()
		.references(() => users.id),
	birthOfdate: d.date(),
	phoneNumber: d.varchar({ length: 20 }),
	address: d.text(),
	defaultLanguage: d.varchar({ length: 10 }).default("en"),
	college: d.varchar({ length: 255 }),
	department: d.varchar({ length: 255 }),
	yearOfStudy: d.integer(),
	details: d.jsonb(),
}));

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
}));

export const accounts = createTable(
	"account",
	(d) => ({
		userId: d
			.uuid()
			.notNull()
			.references(() => users.id),
		type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
		provider: d.varchar({ length: 255 }).notNull(),
		providerAccountId: d.varchar({ length: 255 }).notNull(),
		refresh_token: d.text(),
		access_token: d.text(),
		expires_at: d.integer(),
		token_type: d.varchar({ length: 255 }),
		scope: d.varchar({ length: 255 }),
		id_token: d.text(),
		session_state: d.varchar({ length: 255 }),
	}),
	(t) => [
		primaryKey({ columns: [t.provider, t.providerAccountId] }),
		index("account_user_id_idx").on(t.userId),
	],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
	"session",
	(d) => ({
		sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
		userId: d
			.uuid()
			.notNull()
			.references(() => users.id),
		expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
	}),
	(t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
	"verification_token",
	(d) => ({
		identifier: d.varchar({ length: 255 }).notNull(),
		token: d.varchar({ length: 255 }).notNull(),
		expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
	}),
	(t) => [primaryKey({ columns: [t.identifier, t.token] })],
);
