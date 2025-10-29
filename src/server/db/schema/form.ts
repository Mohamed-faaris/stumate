import { index, primaryKey } from "drizzle-orm/pg-core";
import { createTable } from "./base";
import { groups } from "./group";
import { users } from "./user";

export const forms = createTable(
	"form",
	(d) => ({
		id: d.uuid().notNull().primaryKey().defaultRandom(),
		title: d.varchar({ length: 255 }).notNull(),
		description: d.text(),
		config: d.jsonb().notNull().default("{}"),
		metadata: d.jsonb().notNull().default("{}"),
		deadline: d.timestamp({ mode: "date", withTimezone: true }),
		createdBy: d
			.uuid()
			.notNull()
			.references(() => users.id),
		createdAt: d.timestamp({ mode: "date", withTimezone: true }).defaultNow(),
		updatedAt: d.timestamp({ mode: "date", withTimezone: true }).defaultNow(),
	}),
	(t) => [index("form_updated_at_idx").on(t.updatedAt)],
);

export const formSections = createTable(
	"form_section",
	(d) => ({
		id: d.uuid().notNull().primaryKey().defaultRandom(),
		formId: d
			.uuid()
			.notNull()
			.references(() => forms.id),
		title: d.varchar({ length: 255 }).notNull(),
		description: d.text().notNull(),
		config: d.jsonb().notNull(),
		order: d.integer().notNull(),
	}),
	(t) => [index("form_section_form_id_idx").on(t.formId)],
);

export const formAssignments = createTable(
	"form_assignment",
	(d) => ({
		formId: d
			.uuid()
			.notNull()
			.references(() => forms.id),
		groupId: d
			.uuid()
			.notNull()
			.references(() => groups.id),
	}),
	(t) => [
		primaryKey({ columns: [t.formId, t.groupId] }),
		index("form_assignment_form_id_idx").on(t.formId),
		index("form_assignment_group_id_idx").on(t.groupId),
	],
);

/*
Form section config structure:

{
	type: "Section" | "PageBreak" ,
	collapsible: boolean, // default false,
	collapsedByDefault: boolean, // default false
	table:{
		columns: number | string[], // default 2
		allowExtendColumns: boolean, // default false
		requiresAnswerInEachCell: boolean, // default true
	}//default: null
}

*/
