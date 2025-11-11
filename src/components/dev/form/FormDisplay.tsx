"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import FormSectionComponent from "./FormSection";
import type { GetFormResponse } from "~/types/form";

interface FormDisplayProps {
  form: Exclude<GetFormResponse["form"], null>;
  onSubmit?: (answers: Record<string, string | string[] | number>) => void;
  isLoading?: boolean;
}

export default function FormDisplay({
  form,
  onSubmit,
  isLoading,
}: FormDisplayProps) {
  const [answers, setAnswers] = useState<
    Record<string, string | string[] | number>
  >({});

  const handleAnswerChange = (
    questionId: string,
    value: string | string[] | number
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = () => {
    onSubmit?.(answers);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">{form.title}</h1>
        {form.description && (
          <p className="text-muted-foreground mt-2">{form.description}</p>
        )}
      </div>

      <div>
        {form.formSections.map((section) => (
          <FormSectionComponent
            key={section.id}
            section={section}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            disabled={isLoading}
          />
        ))}
      </div>

      <Button onClick={handleSubmit} disabled={isLoading} size="lg">
        {isLoading ? "Submitting..." : "Submit"}
      </Button>
    </div>
  );
}
