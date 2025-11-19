"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

interface FormQuestion {
  id: string;
  title: string;
  type: string;
}

interface FormSection {
  id: string;
  title: string;
  description: string;
  formQuestions: FormQuestion[];
}

interface Form {
  id: string;
  title: string;
  description: string | null;
  formSections: FormSection[];
}

interface FormResponse {
  [key: string]: string | string[];
}

const fetchForm = async (formId: string): Promise<Form> => {
  const response = await fetch(`/api/form/${formId}`);
  if (!response.ok) throw new Error("Failed to fetch form");
  return response.json();
};

const submitForm = async (formId: string, responses: FormResponse) => {
  const response = await fetch(`/api/form/${formId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ responses }),
  });
  if (!response.ok) throw new Error("Failed to submit form");
  return response.json();
};

export default function FormAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const formId = params["form-id"] as string;
  const [responses, setResponses] = useState<FormResponse>({});

  const {
    data: form,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["form", formId],
    queryFn: () => fetchForm(formId),
  });

  const submitMutation = useMutation({
    mutationFn: () => submitForm(formId, responses),
    onSuccess: () => {
      toast.success("Form submitted successfully!");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleResponseChange = (
    questionId: string,
    value: string | string[]
  ) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(responses).length === 0) {
      toast.error("Please answer at least one question");
      return;
    }
    submitMutation.mutate();
  };

  if (isLoading) return <p className="p-8 text-gray-600">Loading form...</p>;
  if (error || !form)
    return <p className="p-8 text-red-600">Error loading form</p>;

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">{form.title}</h1>
          <p className="text-gray-600">{form.description}</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {form.formSections?.map((section) => (
          <Card key={section.id} className="p-6">
            <h2 className="mb-2 font-semibold text-xl">{section.title}</h2>
            <p className="mb-4 text-gray-600 text-sm">{section.description}</p>

            <div className="space-y-4">
              {section.formQuestions?.map((question) => (
                <div key={question.id} className="space-y-2">
                  <label className="font-medium">{question.title}</label>
                  <input
                    type="text"
                    placeholder={`Answer for: ${question.title}`}
                    value={(responses[question.id] as string) || ""}
                    onChange={(e) =>
                      handleResponseChange(question.id, e.target.value)
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}

        <div className="flex gap-4">
          <Button type="submit" disabled={submitMutation.isPending}>
            {submitMutation.isPending ? "Submitting..." : "Submit Form"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
