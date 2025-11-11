"use client";

import type { ChangeEvent } from "react";
import { Input } from "~/components/ui/input";
import QuestionWrapper from "./QuestionWrapper";

interface TimeQuestionProps {
  question: any;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export default function TimeQuestion({
  question,
  value = "",
  onChange,
  disabled,
}: TimeQuestionProps) {
  return (
    <QuestionWrapper question={question}>
      <Input
        type="time"
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
