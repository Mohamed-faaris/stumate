import { Label } from "~/components/ui/label";

interface QuestionWrapperProps {
	question: any;
	children: React.ReactNode;
}

export default function QuestionWrapper({ question, children }: QuestionWrapperProps) {
	return (
		<div className="mb-6 space-y-2">
			<div>
				<Label className="font-semibold text-base">
					{question.questionText}
					{question.required && <span className="ml-1 text-red-500">*</span>}
				</Label>
				{question.questionDescription && (
					<p className="text-muted-foreground text-sm">{question.questionDescription}</p>
				)}
			</div>
			<div>{children}</div>
		</div>
	);
}
