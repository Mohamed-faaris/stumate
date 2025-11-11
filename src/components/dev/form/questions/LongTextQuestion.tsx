"use client";

import type { ChangeEvent } from "react";
import { Textarea } from "~/components/ui/textarea";
import QuestionWrapper from "./QuestionWrapper";

interface LongTextQuestionProps {
  question: any;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export default function LongTextQuestion({
  question,
  value = "",
  onChange,
  disabled,
}: LongTextQuestionProps) {
  const config = question.config as {
    maxLength?: number;
    minLength?: number;
  };

  return (
    <QuestionWrapper question={question}>
      <Textarea
        placeholder="Enter your answer"
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          onChange?.(e.target.value)
        }
        disabled={disabled}
        maxLength={config?.maxLength || 5000}
        minLength={config?.minLength || 1}
        required={question.required}
        rows={5}
      />
    </QuestionWrapper>
  );
}
