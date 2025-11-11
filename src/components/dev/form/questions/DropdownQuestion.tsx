"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import QuestionWrapper from "./QuestionWrapper";

interface DropdownQuestionProps {
	question: any;
	value?: string;
	onChange?: (value: string) => void;
	disabled?: boolean;
}

export default function DropdownQuestion({
	question,
	value = "",
	onChange,
	disabled,
}: DropdownQuestionProps) {
	const config = question.config as {
		options?: Array<{ label: string; value: string }>;
	};

	return (
		<QuestionWrapper question={question}>
			<Select value={value} onValueChange={onChange} disabled={disabled}>
				<SelectTrigger>
					<SelectValue placeholder="Select an option" />
				</SelectTrigger>
				<SelectContent>
					{config?.options?.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</QuestionWrapper>
	);
}
