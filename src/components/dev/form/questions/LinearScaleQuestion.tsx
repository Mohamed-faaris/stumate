"use client";

import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import QuestionWrapper from "./QuestionWrapper";

interface LinearScaleQuestionProps {
	question: any;
	value?: number;
	onChange?: (value: number) => void;
	disabled?: boolean;
}

export default function LinearScaleQuestion({
	question,
	value,
	onChange,
	disabled,
}: LinearScaleQuestionProps) {
	const config = question.config as {
		min?: number;
		max?: number;
		step?: number;
		minLabel?: string;
		maxLabel?: string;
	};

	const min = config?.min || 1;
	const max = config?.max || 5;
	const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

	return (
		<QuestionWrapper question={question}>
			<div>
				<div className="mb-4 flex justify-between text-sm">
					<span>{config?.minLabel || "Not at all"}</span>
					<span>{config?.maxLabel || "Extremely"}</span>
				</div>
				<RadioGroup value={value?.toString() || ""}>
					<div className="flex gap-4">
						{options.map((option) => (
							<div key={option} className="flex flex-col items-center gap-2">
								<RadioGroupItem
									value={option.toString()}
									id={`scale-${option}`}
									disabled={disabled}
									onChange={() => onChange?.(option)}
								/>
								<Label htmlFor={`scale-${option}`}>{option}</Label>
							</div>
						))}
					</div>
				</RadioGroup>
			</div>
		</QuestionWrapper>
	);
}
