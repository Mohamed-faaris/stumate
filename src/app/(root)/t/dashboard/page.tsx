"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

interface FormAssignment {
  formId: string;
  formsTitle: string;
  submittedAt: string | null;
}

interface ApiResponse {
  success: boolean;
}

const fetchAssignedForms = async (): Promise<FormAssignment[]> => {
  const response = await fetch("/api/user/form");
  if (!response.ok) throw new Error("Failed to fetch assigned forms");
  return response.json();
};

export default function DashboardPage() {
  const router = useRouter();
  const {
    data: forms = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["assignedForms"],
    queryFn: fetchAssignedForms,
  });

  const submittedFormIds = new Set(
    forms.filter((f) => f.submittedAt).map((f) => f.formId)
  );

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="font-bold text-3xl">Assigned Forms</h1>
        <p className="text-gray-600">
          Forms assigned to you that need completion
        </p>
      </div>

      {isLoading && <p className="text-gray-600">Loading forms...</p>}
      {error && <p className="text-red-600">Error loading forms</p>}

      {forms.length === 0 && !isLoading ? (
        <Card className="p-6 text-center">
          <p className="text-gray-600">No forms assigned yet</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {forms.map((form) => {
            const isSubmitted = submittedFormIds.has(form.formId);
            return (
              <Card key={form.formId} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{form.formsTitle}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      {isSubmitted ? (
                        <Badge variant="default" className="bg-green-600">
                          Submitted
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push(`dashboard/${form.formId}`)}
                    disabled={isSubmitted}
                  >
                    {isSubmitted ? "Already Submitted" : "Submit Form"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
