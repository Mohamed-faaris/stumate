"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import type { GetFormResponse } from "~/types/form";
import FormSectionComponent from "./FormSection";

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
    console.log("Form Submitted - Answers:", answers);

    toast.success("Form submitted successfully!", {
      description: `Submitted ${Object.keys(answers).length} answers`,
    });

    onSubmit?.(answers);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-bold text-3xl">{form.title}</h1>
        {form.description && (
          <p className="mt-2 text-muted-foreground">{form.description}</p>
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
