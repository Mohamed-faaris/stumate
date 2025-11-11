"use client";

import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import QuestionWrapper from "./QuestionWrapper";

interface MultipleChoiceQuestionProps {
	question: any;
	value?: string;
	onChange?: (value: string) => void;
	disabled?: boolean;
}

export default function MultipleChoiceQuestion({
	question,
	value = "",
	onChange,
	disabled,
}: MultipleChoiceQuestionProps) {
	const config = question.config as {
		options?: Array<{ label: string; value: string }>;
	};

	return (
		<QuestionWrapper question={question}>
			<RadioGroup value={value}>
				{config?.options?.map((option) => (
					<div key={option.value} className="flex items-center space-x-2">
						<RadioGroupItem
							value={option.value}
							id={option.value}
							disabled={disabled}
							onChange={() => onChange?.(option.value)}
						/>
						<Label htmlFor={option.value}>{option.label}</Label>
					</div>
				))}
			</RadioGroup>
		</QuestionWrapper>
	);
}
