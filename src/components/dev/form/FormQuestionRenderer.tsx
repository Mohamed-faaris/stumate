"use client";

import type { InferSelectModel } from "drizzle-orm";
import type { formQuestions } from "~/server/db/schema";
import CheckboxesQuestion from "./questions/CheckboxesQuestion";
import DateQuestion from "./questions/DateQuestion";
import DateTimeQuestion from "./questions/DateTimeQuestion";
import DropdownQuestion from "./questions/DropdownQuestion";
import LinearScaleQuestion from "./questions/LinearScaleQuestion";
import LongTextQuestion from "./questions/LongTextQuestion";
import MultipleChoiceQuestion from "./questions/MultipleChoiceQuestion";
import ShortTextQuestion from "./questions/ShortTextQuestion";
import TimeQuestion from "./questions/TimeQuestion";
import URLQuestion from "./questions/URLQuestion";

type Question = InferSelectModel<typeof formQuestions>;

interface FormQuestionRendererProps {
	question: Question;
	value?: string | string[] | number;
	onChange?: (value: string | string[] | number) => void;
	disabled?: boolean;
}

export default function FormQuestionRenderer({
	question,
	value,
	onChange,
	disabled,
}: FormQuestionRendererProps) {
	switch (question.questionType) {
		case "SHORT_TEXT":
			return (
				<ShortTextQuestion
					question={question}
					value={value as string | undefined}
					onChange={(v) => onChange?.(v)}
					disabled={disabled}
				/>
			);
		case "LONG_TEXT":
			return (
				<LongTextQuestion
					question={question}
					value={value as string | undefined}
					onChange={(v) => onChange?.(v)}
					disabled={disabled}
				/>
			);
		case "MULTIPLE_CHOICE":
			return (
				<MultipleChoiceQuestion
					question={question}
					value={value as string | undefined}
					onChange={(v) => onChange?.(v)}
					disabled={disabled}
				/>
			);
		case "CHECKBOXES":
			return (
				<CheckboxesQuestion
					question={question}
					value={value as string[] | undefined}
					onChange={(v) => onChange?.(v)}
					disabled={disabled}
				/>
			);
		case "DROPDOWN":
			return (
				<DropdownQuestion
					question={question}
					value={value as string | undefined}
					onChange={(v) => onChange?.(v)}
					disabled={disabled}
				/>
			);
		case "LINEAR_SCALE":
			return (
				<LinearScaleQuestion
					question={question}
					value={value as number | undefined}
					onChange={(v) => onChange?.(v)}
					disabled={disabled}
				/>
			);
		case "DATE":
			return (
				<DateQuestion
					question={question}
					value={value as string | undefined}
					onChange={(v) => onChange?.(v)}
					disabled={disabled}
				/>
			);
		case "TIME":
			return (
				<TimeQuestion
					question={question}
					value={value as string | undefined}
					onChange={(v) => onChange?.(v)}
					disabled={disabled}
				/>
			);
		case "DATE_TIME":
			return (
				<DateTimeQuestion
					question={question}
					value={value as string | undefined}
					onChange={(v) => onChange?.(v)}
					disabled={disabled}
				/>
			);
		case "URL":
			return (
				<URLQuestion
					question={question}
					value={value as string | undefined}
					onChange={(v) => onChange?.(v)}
					disabled={disabled}
				/>
			);
		default:
			return (
				<div className="p-4 text-muted-foreground">
					Question type {question.questionType} not yet implemented
				</div>
			);
	}
}
