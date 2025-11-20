"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import FormDisplay from "~/components/dev/form/FormDisplay";
import type { GetFormResponse } from "~/types/form";

const fetchForm = async (formId: string): Promise<GetFormResponse["form"]> => {
  const response = await fetch(`/api/form/${formId}`);
  if (!response.ok) throw new Error("Failed to fetch form");
  const data = await response.json();
  return data.form || data;
};

export default function FormSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params["form-id"] as string;

  const {
    data: form,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["form", formId],
    queryFn: () => fetchForm(formId),
  });

  const handleFormSubmit = (
    answers: Record<string, string | string[] | number>
  ) => {
    toast.success("Form submitted successfully!");
    router.push("/dashboard");
  };

  if (isLoading) return <p className="p-8 text-gray-600">Loading form...</p>;
  if (error || !form)
    return <p className="p-8 text-red-600">Error loading form</p>;

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <FormDisplay
        form={form}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
