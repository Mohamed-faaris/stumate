import { pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { createTable } from "./base";

const rolesValues = ["USER", "ADMIN", "DEV"] as const;
export const roles = pgEnum("user_role", rolesValues);
export type UserRole = (typeof rolesValues)[number];

const genderValues = ["MALE", "FEMALE", "OTHER"] as const;
export const genderEnum = pgEnum("gender", genderValues);
export type Gender = (typeof genderValues)[number];

export const usersMetadata = createTable("user_metadata", (d) => ({
	userId: d
		.uuid()
		.notNull()
		.primaryKey()
		.references(() => user.uid),

	name: d.varchar({ length: 255 }),
	role: roles("role").default("USER").notNull(),
	gender: genderEnum("user_gender").notNull(),
	birthOfDate: d.date(),
	phoneNumber: d.varchar({ length: 20 }),
	address: d.text(),
	defaultLanguage: d.varchar({ length: 10 }).default("en"),
	college: d.varchar({ length: 255 }),
	department: d.varchar({ length: 255 }),
	yearOfStudy: d.integer(),
	details: d.jsonb(),
}));
