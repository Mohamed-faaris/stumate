"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { questionTypeValues } from "~/server/db/schema/form-question";
import type { EditForm, Question, Section } from "~/types/form";

interface Form {
  id: string;
  title: string;
  description: string | null;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  users?: T[];
  groups?: T[];
  forms?: T[];
}

const fetchForms = async (): Promise<ApiResponse<Form>> => {
  const response = await fetch("/api/form");
  if (!response.ok) throw new Error("Failed to fetch forms");
  return response.json();
};

const updateForm = async (formId: string, data: EditForm) => {
  const response = await fetch(`/api/form/${formId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update form");
  return response.json();
};

export function FormsList() {
  const router = useRouter();

  const queryClient = useQueryClient();
  const {
    data: formsData,
    isLoading: formsLoading,
    error: formsError,
  } = useQuery({
    queryKey: ["forms"],
    queryFn: fetchForms,
  });

  const updateFormMutation = useMutation({
    mutationFn: ({ formId, data }: { formId: string; data: EditForm }) =>
      updateForm(formId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Form updated successfully!");
    },
    onError: (error) => {
      toast.error(`Error updating form: ${error.message}`);
    },
  });

  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [sections, setSections] = useState<Record<string, Section[]>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  const fetchFormDataQuery = useQuery({
    queryKey: ["form", selectedFormId],
    queryFn: async () => {
      if (!selectedFormId) return null;
      const response = await fetch(`/api/form/${selectedFormId}`);
      if (!response.ok) throw new Error("Failed to fetch form data");
      return response.json();
    },
    enabled: !!selectedFormId && dialogOpen,
  });

  const addSection = (formId: string) => {
    const newSection: Section = {
      title: `Section ${Object.keys(sections[formId] || []).length + 1}`,
      description: "",
      questions: [],
    };
    setSections((prev) => ({
      ...prev,
      [formId]: [...(prev[formId] || []), newSection],
    }));
  };

  const updateSection = (formId: string, index: number, section: Section) => {
    setSections((prev) => ({
      ...prev,
      [formId]: prev[formId]?.map((s, i) => (i === index ? section : s)),
    }));
  };

  const addQuestion = (formId: string, sectionIndex: number) => {
    const newQuestion: Question = {
      questionText: `Question ${
        (sections[formId]?.[sectionIndex]?.questions?.length || 0) + 1
      }`,
      type: "SHORT_TEXT",
      required: false,
    };
    setSections((prev) => ({
      ...prev,
      [formId]: prev[formId]?.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              questions: [...(section.questions || []), newQuestion],
            }
          : section
      ),
    }));
  };

  const updateQuestion = (
    formId: string,
    sectionIndex: number,
    questionIndex: number,
    question: Question
  ) => {
    setSections((prev) => ({
      ...prev,
      [formId]: prev[formId]?.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              questions: section.questions?.map((q, j) =>
                j === questionIndex ? question : q
              ),
            }
          : section
      ),
    }));
  };

  const saveFormSections = (formId: string) => {
    const formSections = sections[formId] || [];
    updateFormMutation.mutate({
      formId,
      data: {
        formMeta: {
          title: formsData?.forms?.find((f) => f.id === formId)?.title || "",
          description:
            formsData?.forms?.find((f) => f.id === formId)?.description || "",
          config: {
            type: "Section",
            collapsible: false,
            collapsedByDefault: false,
          },
        },
        sections: formSections,
      },
    });
  };

  if (formsLoading) {
    return (
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 font-bold text-2xl">All Forms</h2>
        <p>Loading forms...</p>
      </div>
    );
  }

  if (formsError) {
    return (
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 font-bold text-2xl">All Forms</h2>
        <p className="text-red-600">
          Error loading forms: {formsError.message}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 font-bold text-2xl">All Forms</h2>

      {!formsData?.forms || formsData.forms.length === 0 ? (
        <p className="text-gray-500">
          No forms found. Create your first form above!
        </p>
      ) : (
        <div className="space-y-4">
          {formsData.forms.map((form: Form) => (
            <div key={form.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{form.title}</h3>
                  {form.description && (
                    <p className="mt-1 text-gray-600">{form.description}</p>
                  )}
                  <div className="mt-2 text-gray-500 text-sm">
                    <p>
                      Created: {new Date(form.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      Last updated:{" "}
                      {new Date(form.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="ml-4 flex space-x-2">
                  <button
                    type="button"
                    className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
                    onClick={() => router.push(`/dev/form/${form.id}`)}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    onClick={() => {
                      setSelectedFormId(form.id);
                      setDialogOpen(true);
                    }}
                  >
                    Get as JSON
                  </button>
                  <button
                    type="button"
                    className="rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
                    onClick={() =>
                      setEditingFormId(
                        editingFormId === form.id ? null : form.id
                      )
                    }
                  >
                    {editingFormId === form.id
                      ? "Hide Questions"
                      : "Add Questions"}
                  </button>
                  <button
                    type="button"
                    className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                    onClick={() => toast.info(`Edit form: ${form.id}`)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                    onClick={() => {
                      if (confirm(`Delete form "${form.title}"?`)) {
                        toast.info(`Delete form: ${form.id}`);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {editingFormId === form.id && (
                <div className="mt-6 border-t pt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold text-lg">
                      Sections & Questions
                    </h4>
                    <button
                      type="button"
                      onClick={() => addSection(form.id)}
                      className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Add Section
                    </button>
                  </div>

                  <div className="space-y-6">
                    {(sections[form.id] || []).map((section, sectionIndex) => (
                      <div
                        key={`${section.title}-${sectionIndex}`}
                        className="rounded-lg border p-4"
                      >
                        <div className="mb-4">
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) =>
                              updateSection(form.id, sectionIndex, {
                                ...section,
                                title: e.target.value,
                              })
                            }
                            className="w-full rounded-md border border-gray-300 px-3 py-2 font-medium focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                            placeholder="Section Title"
                          />
                          <textarea
                            value={section.description}
                            onChange={(e) =>
                              updateSection(form.id, sectionIndex, {
                                ...section,
                                description: e.target.value,
                              })
                            }
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                            placeholder="Section Description"
                            rows={2}
                          />
                        </div>

                        <div className="mb-4">
                          <button
                            type="button"
                            onClick={() => addQuestion(form.id, sectionIndex)}
                            className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                          >
                            Add Question
                          </button>
                        </div>

                        <div className="space-y-3">
                          {section.questions?.map((question, questionIndex) => (
                            <div
                              key={`${question.questionText}-${questionIndex}`}
                              className="rounded border p-3"
                            >
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div>
                                  <label
                                    className="block font-medium text-gray-700 text-sm"
                                    htmlFor={`question-text-${form.id}-${sectionIndex}-${questionIndex}`}
                                  >
                                    Question Text
                                  </label>
                                  <input
                                    id={`question-text-${form.id}-${sectionIndex}-${questionIndex}`}
                                    type="text"
                                    value={question.questionText}
                                    onChange={(e) =>
                                      updateQuestion(
                                        form.id,
                                        sectionIndex,
                                        questionIndex,
                                        {
                                          ...question,
                                          questionText: e.target.value,
                                        }
                                      )
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                                    placeholder="Enter question text"
                                  />
                                </div>

                                <div>
                                  <label
                                    className="block font-medium text-gray-700 text-sm"
                                    htmlFor={`question-type-${form.id}-${sectionIndex}-${questionIndex}`}
                                  >
                                    Type
                                  </label>
                                  <select
                                    id={`question-type-${form.id}-${sectionIndex}-${questionIndex}`}
                                    value={question.type}
                                    onChange={(e) =>
                                      updateQuestion(
                                        form.id,
                                        sectionIndex,
                                        questionIndex,
                                        {
                                          ...question,
                                          type: e.target
                                            .value as Question["type"],
                                        }
                                      )
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                                  >
                                    {questionTypeValues.map((type) => (
                                      <option key={type} value={type}>
                                        {type.replace("_", " ")}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="mt-3">
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={question.required}
                                    onChange={(e) =>
                                      updateQuestion(
                                        form.id,
                                        sectionIndex,
                                        questionIndex,
                                        {
                                          ...question,
                                          required: e.target.checked,
                                        }
                                      )
                                    }
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className="ml-2 text-gray-700 text-sm">
                                    Required
                                  </span>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {(sections[form.id] || []).length > 0 && (
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => saveFormSections(form.id)}
                        className="w-full rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                      >
                        Save Sections & Questions
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedFormId(null);
          }
        }}
      >
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Data (JSON)</DialogTitle>
            <DialogDescription>
              Complete form data fetched from the API
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {fetchFormDataQuery.isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-gray-500">Loading form data...</div>
              </div>
            ) : fetchFormDataQuery.error ? (
              <div className="rounded border bg-red-50 p-4 text-red-600">
                Error loading form data: {fetchFormDataQuery.error.message}
              </div>
            ) : fetchFormDataQuery.data ? (
              <pre className="overflow-x-auto whitespace-pre-wrap rounded border bg-gray-100 p-4 text-sm">
                {JSON.stringify(fetchFormDataQuery.data, null, 2)}
              </pre>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
