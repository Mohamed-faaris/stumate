import { index } from "drizzle-orm/pg-core";
import { createTable } from "./base";
import { formSections } from "./form";

export const formQuestions = createTable(
	"form_question",
	(d) => ({
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
	}),
	(t) => [index("form_question_section_id_idx").on(t.sectionId)],
);
