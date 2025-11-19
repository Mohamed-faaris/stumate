"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

import type { EditForm, FormMeta, Question, Section } from "~/types/form";
import { type questionTypeValues } from "~/server/db/schema/form-question";
import type { GetFormResponse } from "~/types/form";

const fetchForm = async (formId: string): Promise<GetFormResponse["form"]> => {
  const response = await fetch(`/api/form/${formId}`);
  if (!response.ok) throw new Error("Failed to fetch form");
  const data = await response.json();
  // The API returns { success: true, form: ... }
  return data.form || data;
};

const updateForm = async (
  formId: string,
  data: Omit<EditForm, "groupsIds">
) => {
  const response = await fetch(`/api/form/${formId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update form");
  return response.json();
};

export default function EditFormPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const formId = params.formId as string;

  const [formMeta, setFormMeta] = useState<FormMeta>({
    title: "",
    description: "",
  });

  const [sections, setSections] = useState<Section[]>([]);

  const {
    data: form,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["form", formId],
    queryFn: () => fetchForm(formId),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { formMeta: FormMeta; sections: Section[] }) =>
      updateForm(formId, data),
    onSuccess: () => {
      toast.success("Form updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
      router.push(`/admin-dashboard/${formId}`);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Sync form data when the form loads
  useEffect(() => {
    if (form && sections.length === 0) {
      setFormMeta({
        title: form.title,
        description: form.description || "",
      });

      const convertedSections: Section[] = (form.formSections || []).map((section) => ({
        title: section.title,
        description: section.description || "",
        questions:
          section.formQuestions?.map((q) => ({
            questionText: q.title,
            type: q.type as (typeof questionTypeValues)[number],
            required: false,
          })) || [],
      }));
      setSections(convertedSections);
    }
  }, [form, sections.length]);

  const addSection = () => {
    const newSection: Section = {
      title: `Section ${sections.length + 1}`,
      description: "",
      questions: [],
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (index: number, section: Section) => {
    setSections(sections.map((s, i) => (i === index ? section : s)));
  };

  const deleteSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const addQuestion = (sectionIndex: number) => {
    const newQuestion: Question = {
      questionText: `Question ${
        (sections[sectionIndex]?.questions?.length || 0) + 1
      }`,
      type: "SHORT_TEXT",
      required: false,
    };
    setSections(
      sections.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              questions: [...(section.questions || []), newQuestion],
            }
          : section
      )
    );
  };

  const updateQuestion = (
    sectionIndex: number,
    questionIndex: number,
    question: Question
  ) => {
    setSections(
      sections.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              questions: section.questions?.map((q, j) =>
                j === questionIndex ? question : q
              ),
            }
          : section
      )
    );
  };

  const deleteQuestion = (sectionIndex: number, questionIndex: number) => {
    setSections(
      sections.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              questions: section.questions?.filter(
                (_, j) => j !== questionIndex
              ),
            }
          : section
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMeta.title?.trim()) {
      toast.error("Please enter a form title");
      return;
    }
    updateMutation.mutate({
      formMeta,
      sections,
    });
  };

  if (isLoading) return <p className="p-8 text-gray-600">Loading form...</p>;
  if (error || !form)
    return <p className="p-8 text-red-600">Error loading form</p>;

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-3xl">Edit Form</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Form Title</Label>
            <Input
              id="title"
              placeholder="Enter form title"
              value={formMeta.title}
              onChange={(e) =>
                setFormMeta((prev) => ({
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
              value={formMeta.description}
              onChange={(e) =>
                setFormMeta((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Sections</h3>
              <Button type="button" onClick={addSection} size="sm">
                Add Section
              </Button>
            </div>

            <div className="space-y-6">
              {sections.map((section, sectionIndex) => (
                <Card
                  key={`section-${section.title}-${sectionIndex}`}
                  className="p-4"
                >
                  <div className="mb-4 space-y-3">
                    <div>
                      <Label>Section Title</Label>
                      <Input
                        value={section.title}
                        onChange={(e) =>
                          updateSection(sectionIndex, {
                            ...section,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Section Description</Label>
                      <Textarea
                        value={section.description}
                        onChange={(e) =>
                          updateSection(sectionIndex, {
                            ...section,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="mb-4 border-t pt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-medium text-sm">Questions</p>
                      <Button
                        type="button"
                        onClick={() => addQuestion(sectionIndex)}
                        size="sm"
                        variant="outline"
                      >
                        Add Question
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {section.questions?.map((question, questionIndex) => (
                        <Card
                          key={`question-${questionIndex}-${question.questionText}`}
                          className="bg-gray-50 p-3"
                        >
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs">Question Text</Label>
                              <Input
                                value={question.questionText}
                                onChange={(e) =>
                                  updateQuestion(sectionIndex, questionIndex, {
                                    ...question,
                                    questionText: e.target.value,
                                  })
                                }
                                placeholder="Enter question"
                              />
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Label
                                  htmlFor={`type-${sectionIndex}-${questionIndex}`}
                                  className="text-xs"
                                >
                                  Type
                                </Label>
                                <select
                                  id={`type-${sectionIndex}-${questionIndex}`}
                                  value={question.type}
                                  onChange={(e) =>
                                    updateQuestion(
                                      sectionIndex,
                                      questionIndex,
                                      {
                                        ...question,
                                        type: e.target
                                          .value as (typeof questionTypeValues)[number],
                                      }
                                    )
                                  }
                                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                >
                                  <option value="SHORT_TEXT">Short Text</option>
                                  <option value="LONG_TEXT">Long Text</option>
                                  <option value="MULTIPLE_CHOICE">
                                    Multiple Choice
                                  </option>
                                  <option value="CHECKBOX">Checkbox</option>
                                  <option value="DROPDOWN">Dropdown</option>
                                  <option value="RATING">Rating</option>
                                  <option value="DATE">Date</option>
                                  <option value="TIME">Time</option>
                                  <option value="EMAIL">Email</option>
                                  <option value="URL">URL</option>
                                  <option value="PHONE">Phone</option>
                                  <option value="RADIO">Radio</option>
                                </select>
                              </div>
                              <div className="pt-5">
                                <Button
                                  type="button"
                                  onClick={() =>
                                    deleteQuestion(sectionIndex, questionIndex)
                                  }
                                  size="sm"
                                  variant="destructive"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => deleteSection(sectionIndex)}
                    variant="destructive"
                    size="sm"
                  >
                    Delete Section
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
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
