"use client";

import type { InferSelectModel } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { formQuestions, formSections } from "~/server/db/schema";
import FormQuestionRenderer from "./FormQuestionRenderer";

type Section = InferSelectModel<typeof formSections> & {
	formQuestions: InferSelectModel<typeof formQuestions>[];
};

interface FormSectionProps {
	section: Section;
	answers: Record<string, string | string[] | number>;
	onAnswerChange: (questionId: string, value: string | string[] | number) => void;
	disabled?: boolean;
}

export default function FormSectionComponent({
	section,
	answers,
	onAnswerChange,
	disabled,
}: FormSectionProps) {
	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>{section.title}</CardTitle>
				{section.description && (
					<p className="mt-2 text-muted-foreground text-sm">{section.description}</p>
				)}
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{section.formQuestions.map((question) => (
						<FormQuestionRenderer
							key={question.id}
							question={question}
							value={answers[question.id]}
							onChange={(value) => onAnswerChange(question.id, value)}
							disabled={disabled}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
