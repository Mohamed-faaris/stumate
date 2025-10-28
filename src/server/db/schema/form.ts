import { index } from "drizzle-orm/pg-core";
import { createTable } from "./base";
import { users } from "./user";

export const forms = createTable(
	"form",
	(d) => ({
		id: d.uuid().notNull().primaryKey().defaultRandom(),
		title: d.varchar({ length: 255 }).notNull(),
		description: d.text().notNull(),
		config: d.jsonb().notNull(),
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
