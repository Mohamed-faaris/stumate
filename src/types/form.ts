import z from "zod";
import { questionTypeValues } from "~/server/db/schema/form-question";

export const FormMetaSchema = z.object({
	title: z.string().min(1).max(255),
	description: z.string().optional(),
	config: z.object({}).optional(),
	metadata: z.object({}).optional(),
	deadline: z.string().datetime().optional(),
});

export const QuestionSchema = z.object({
	questionText: z.string().min(1).max(255),
	questionDescription: z.string().optional(),
	type: z.enum(questionTypeValues),
	config: z.object({}).optional(),
	required: z.boolean().default(false),
});

export const SectionSchema = z.object({
	title: z.string().min(1).max(255),
	description: z.string().optional(),
	config: z.object({}).optional(),
});

const EditFormSchema = z.object({
	formMeta: FormMetaSchema,
	groupsIds: z.array(z.string().uuid()).optional(),
	section: z.array(SectionSchema).optional(),
});

export type Question = z.infer<typeof QuestionSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type FormMeta = z.infer<typeof FormMetaSchema>;
export type EditForm = z.infer<typeof EditFormSchema>;
