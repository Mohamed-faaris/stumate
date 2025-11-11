"use client";

import type { ChangeEvent } from "react";
import { Input } from "~/components/ui/input";
import QuestionWrapper from "./QuestionWrapper";

interface DateTimeQuestionProps {
	question: any;
	value?: string;
	onChange?: (value: string) => void;
	disabled?: boolean;
}

export default function DateTimeQuestion({
	question,
	value = "",
	onChange,
	disabled,
}: DateTimeQuestionProps) {
	return (
		<QuestionWrapper question={question}>
			<Input
				type="datetime-local"
				value={value}
				onChange={(e: ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)}
				disabled={disabled}
				required={question.required}
			/>
		</QuestionWrapper>
	);
}
