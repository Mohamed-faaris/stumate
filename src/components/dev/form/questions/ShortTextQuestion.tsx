"use client";

import type { ChangeEvent } from "react";
import { Input } from "~/components/ui/input";
import QuestionWrapper from "./QuestionWrapper";

interface ShortTextQuestionProps {
	question: any;
	value?: string;
	onChange?: (value: string) => void;
	disabled?: boolean;
}

export default function ShortTextQuestion({
	question,
	value = "",
	onChange,
	disabled,
}: ShortTextQuestionProps) {
	const config = question.config as {
		maxLength?: number;
		minLength?: number;
	};

	return (
		<QuestionWrapper question={question}>
			<Input
				type="text"
				placeholder="Enter your answer"
				value={value}
				onChange={(e: ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)}
				disabled={disabled}
				maxLength={config?.maxLength || 255}
				minLength={config?.minLength || 1}
				required={question.required}
			/>
		</QuestionWrapper>
	);
}
