"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { templates } from "~/lib/templates";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

interface FormData {
  title: string;
  description: string;
  config: {
    type: "Section" | "PageBreak";
    collapsible: boolean;
    collapsedByDefault: boolean;
    table: {
      columns: number | string[];
      allowExtendColumns: boolean;
      requiresAnswerInEachCell: boolean;
    } | null;
  };
}

const createForm = async (data: FormData) => {
  const response = await fetch("/api/form", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create form");
  return response.json();
};

export default function CreateFormPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    config: {
      type: "Section",
      collapsible: false,
      collapsedByDefault: false,
      table: null,
    },
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const loadTemplate = () => {
    if (!selectedTemplate) return;
    const tpl = (templates as Record<string, any>)[selectedTemplate];
    if (!tpl) return;
    setFormData((prev) => ({
      ...prev,
      title: tpl.title || prev.title,
      description: tpl.description || prev.description,
      config: tpl.config || prev.config,
    }));
    toast.success("Template loaded into form fields");
  };

  const createMutation = useMutation({
    mutationFn: createForm,
    onSuccess: (data) => {
      toast.success("Form created successfully!");
      router.push(`/admin-dashboard/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a form title");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 p-8">
      <h1 className="font-bold text-3xl">Create New Form</h1>

      <Card className="p-6">
        <div className="mb-4">
          <Label htmlFor="template">Load Template</Label>
          <div className="flex gap-2 mt-2">
            <select
              id="template"
              aria-label="Template select"
              title="Template select"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="rounded border px-2 py-1"
            >
              <option value="">-- Select a template --</option>
              {Object.keys(templates).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <Button
              type="button"
              onClick={loadTemplate}
              disabled={!selectedTemplate}
            >
              Load Template
            </Button>
          </div>
          {selectedTemplate &&
            (templates as Record<string, any>)[selectedTemplate] && (
              <div className="mt-4 space-y-3 rounded border border-muted bg-muted/50 p-3">
                <div>
                  <h3 className="font-semibold text-sm">Template Preview</h3>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>
                    Sections:{" "}
                    {
                      (
                        (templates as Record<string, any>)[selectedTemplate]
                          .sections || []
                      ).length
                    }
                  </div>
                  <div>
                    Questions:{" "}
                    {(
                      ((templates as Record<string, any>)[selectedTemplate]
                        .sections || []) as any[]
                    )
                      .map((s) => (s.questions || []).length)
                      .reduce((a, b) => a + b, 0)}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                    Questions Preview
                  </h4>
                  {(
                    ((templates as Record<string, any>)[selectedTemplate]
                      .sections || []) as any[]
                  ).map((section, sIdx) => (
                    <div key={sIdx} className="ml-2 space-y-1">
                      <div className="text-xs font-medium text-foreground">
                        Section: {section.title || `Section ${sIdx + 1}`}
                      </div>
                      <div className="ml-3 space-y-1">
                        {(section.questions || []).map(
                          (question: any, qIdx: number) => (
                            <div
                              key={qIdx}
                              className="text-xs text-muted-foreground"
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-gray-400">
                                  {qIdx + 1}.
                                </span>
                                <span className="flex-1">
                                  {question.questionText}
                                  <span className="ml-2 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                                    {question.questionType}
                                  </span>
                                  {question.required && (
                                    <span className="ml-1 inline-block text-red-500">
                                      *
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Form Title</Label>
            <Input
              id="title"
              placeholder="Enter form title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter form description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Form"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
