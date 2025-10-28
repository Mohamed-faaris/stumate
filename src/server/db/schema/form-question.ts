import { index, pgEnum } from "drizzle-orm/pg-core";
import { createTable } from "./base";
import { formSections } from "./form";

export const questionTypeValues = [
	"SHORT_TEXT",
	"LONG_TEXT",
	"MULTIPLE_CHOICE",
	"CHECKBOXES",
	"DROPDOWN",
	"LINEAR_SCALE",
	"DATE",
	"TIME",
	"DATE_TIME",
	"URL",
	"CONTENT_BLOCK",
	"RADIO",
] as const;

export const questionTypeEnum = pgEnum("question_type", questionTypeValues);
export type QuestionType = (typeof questionTypeValues)[number];

export const formQuestions = createTable(
	"form_question",
	(d) => ({
		id: d.uuid().notNull().primaryKey().defaultRandom(),
		sectionId: d
			.uuid()
			.notNull()
			.references(() => formSections.id),
		questionText: d.text().notNull(),
		questionDescription: d.text(),
		questionType: questionTypeEnum("questionType").notNull(),
		required: d.boolean().notNull().default(false),
		config: d.jsonb().notNull(),
		order: d.integer().notNull(),
	}),
	(t) => [index("form_question_section_id_idx").on(t.sectionId)],
);

/*
Example config structure for different question types:

    SHORT_TEXT
{
    "maxLength": 255, // default 100
    "minLength": 1 // default 1
    "regexPattern": "^[a-zA-Z0-9 ]+$" // default null
}

    LONG_TEXT
{
    "maxLength": 5000, // default 1000
    "minLength": 1 // default 1
    "regexPattern": null // default null
}

    MULTIPLE_CHOICE
{
    "options": ["Option 1", "Option 2", "Option 3"], // all are unique
    "allowMultiple": true //default false
    "maxSelected": 3 // default len(options) if allowMultiple is true
    "minSelected": 1 // default 1 if allowMultiple is true
}
    CHECKBOXES
{
    "options": ["Option 1", "Option 2", "Option 3"] // all are unique
    "maxSelected": 3 // default len(options) 
    "minSelected": 1 // default 1
}    
    DROPDOWN
{
    "options": ["Option 1", "Option 2", "Option 3"] // all are unique
}
    LINEAR_SCALE
{
    "min": 1,
    "max": 5,
    "step": 1, // default 1
    "minLabel": "Poor", //default : ""
    "maxLabel": "Excellent" //default : ""
}
    DATE
{
    "earliestDate": "2023-01-01", // default null
    "latestDate": "2024-12-31" // default null
}
    TIME
{
    "earliestTime": "08:00", // default null
    "latestTime": "18:00" // default null
}
    DATE_TIME
{
    "earliestDateTime": "2023-01-01T08:00:00Z", // default null
    "latestDateTime": "2024-12-31T18:00:00Z" // default null
}
    URL
{
    "mustContain": "example.com", // default null
    "mustNotContain": "spam.com" // default null
}
    CONTENT_BLOCK
{}
    RADIO
{
    "options": ["Option 1", "Option 2", "Option 3"] // all are unique
    "maxSelected": 1 // default 1
    "minSelected": 1 // default 1 
}
*/
