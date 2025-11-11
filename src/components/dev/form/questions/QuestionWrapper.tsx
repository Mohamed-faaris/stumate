import { Label } from "~/components/ui/label";

interface QuestionWrapperProps {
  question: any;
  children: React.ReactNode;
}

export default function QuestionWrapper({
  question,
  children,
}: QuestionWrapperProps) {
  return (
    <div className="mb-6 space-y-2">
      <div>
        <Label className="text-base font-semibold">
          {question.questionText}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {question.questionDescription && (
          <p className="text-sm text-muted-foreground">
            {question.questionDescription}
          </p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
