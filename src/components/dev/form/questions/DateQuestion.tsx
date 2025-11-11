"use client";

import type { ChangeEvent } from "react";
import { Input } from "~/components/ui/input";
import QuestionWrapper from "./QuestionWrapper";

interface DateQuestionProps {
  question: any;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export default function DateQuestion({
  question,
  value = "",
  onChange,
  disabled,
}: DateQuestionProps) {
  return (
    <QuestionWrapper question={question}>
      <Input
        type="date"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange?.(e.target.value)
        }
        disabled={disabled}
        required={question.required}
      />
    </QuestionWrapper>
  );
}
