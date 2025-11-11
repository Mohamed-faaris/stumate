"use client";

import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import QuestionWrapper from "./QuestionWrapper";

interface CheckboxesQuestionProps {
	question: any;
	value?: string[];
	onChange?: (value: string[]) => void;
	disabled?: boolean;
}

export default function CheckboxesQuestion({
	question,
	value = [],
	onChange,
	disabled,
}: CheckboxesQuestionProps) {
	const config = question.config as {
		options?: Array<{ label: string; value: string }>;
	};

	const handleChange = (optionValue: string, checked: boolean) => {
		const newValue = checked ? [...value, optionValue] : value.filter((v) => v !== optionValue);
		onChange?.(newValue);
	};

	return (
		<QuestionWrapper question={question}>
			<div className="space-y-2">
				{config?.options?.map((option) => (
					<div key={option.value} className="flex items-center space-x-2">
						<Checkbox
							id={option.value}
							checked={value.includes(option.value)}
							onCheckedChange={(checked) => handleChange(option.value, checked as boolean)}
							disabled={disabled}
						/>
						<Label htmlFor={option.value}>{option.label}</Label>
					</div>
				))}
			</div>
		</QuestionWrapper>
	);
}
