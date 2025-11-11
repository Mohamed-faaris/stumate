"use client";

import type { ChangeEvent } from "react";
import { Input } from "~/components/ui/input";
import QuestionWrapper from "./QuestionWrapper";

interface URLQuestionProps {
  question: any;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export default function URLQuestion({
  question,
  value = "",
  onChange,
  disabled,
}: URLQuestionProps) {
  return (
    <QuestionWrapper question={question}>
      <Input
        type="url"
        placeholder="https://example.com"
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
