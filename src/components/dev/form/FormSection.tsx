"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import FormQuestionRenderer from "./FormQuestionRenderer";
import type { formSections, formQuestions } from "~/server/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type Section = InferSelectModel<typeof formSections> & {
  formQuestions: InferSelectModel<typeof formQuestions>[];
};

interface FormSectionProps {
  section: Section;
  answers: Record<string, string | string[] | number>;
  onAnswerChange: (
    questionId: string,
    value: string | string[] | number
  ) => void;
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
          <p className="text-sm text-muted-foreground mt-2">
            {section.description}
          </p>
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
