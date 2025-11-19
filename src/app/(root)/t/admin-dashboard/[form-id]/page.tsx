"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
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
  config: Record<string, unknown>;
  formSections: FormSection[];
  createdAt: string;
  updatedAt: string;
}

const fetchForm = async (formId: string): Promise<Form> => {
  const response = await fetch(`/api/form/${formId}`);
  if (!response.ok) throw new Error("Failed to fetch form");
  return response.json();
};

export default function FormDetailPage() {
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
        <div className="flex gap-2">
          <Button
            onClick={() => router.push(`admin-dashboard/edit/${formId}`)}
          >
            Edit Form
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-xl">Sections</h2>
        {form.formSections?.length === 0 ? (
          <Card className="p-4 text-center">
            <p className="text-gray-600">No sections yet</p>
          </Card>
        ) : (
          form.formSections?.map((section) => (
            <Card key={section.id} className="p-4">
              <h3 className="font-semibold">{section.title}</h3>
              <p className="text-gray-600 text-sm">{section.description}</p>
              <div className="mt-4 space-y-2">
                {section.formQuestions?.map((question) => (
                  <div key={question.id} className="rounded bg-gray-50 p-2">
                    <p className="font-medium">{question.title}</p>
                    <p className="text-gray-600 text-xs">{question.type}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
