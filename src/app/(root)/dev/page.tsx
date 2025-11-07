"use client";

import { faker } from "@faker-js/faker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { signIn, signUp, useSession } from "~/lib/auth-client";
import { questionTypeValues } from "~/server/db/schema/form-question";
import type { EditForm, Question, Section } from "~/types/form";

// Sign Up Form Schema
const signUpFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});

// Sign In Form Schema
const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Group Form Schema
const groupFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type SignUpFormData = z.infer<typeof signUpFormSchema>;
type SignInFormData = z.infer<typeof signInFormSchema>;
type GroupFormData = z.infer<typeof groupFormSchema>; // Types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  size: number;
}

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
const fetchUsers = async () => {
  const response = await fetch("/api/test/user");
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

const fetchGroups = async () => {
  const response = await fetch("/api/test/group");
  if (!response.ok) throw new Error("Failed to fetch groups");
  return response.json();
};

const fetchForms = async (): Promise<ApiResponse<Form>> => {
  const response = await fetch("/api/form");
  if (!response.ok) throw new Error("Failed to fetch forms");
  return response.json();
};

const createGroup = async (groupData: GroupFormData) => {
  const response = await fetch("/api/test/group", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(groupData),
  });
  if (!response.ok) throw new Error("Failed to create group");
  return response.json();
};

const handleSignUp = async (data: SignUpFormData) => {
  const result = await signUp.email({
    email: data.email,
    password: data.password,
    name: data.name,
  });
  return result;
};

const handleSignIn = async (data: SignInFormData) => {
  const result = await signIn.email({
    email: data.email,
    password: data.password,
  });
  return result;
};

const addMemberToGroup = async (data: { groupId: string; userId: string }) => {
  const response = await fetch("/api/test/group/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to add member");
  return response.json();
};

const createForm = async (data: {
  title: string;
  description: string;
  config?: unknown;
}) => {
  const response = await fetch("/api/form", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create form");
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
function SignUpForm() {
  const queryClient = useQueryClient();
  const signUpMutation = useMutation({
    mutationFn: handleSignUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      alert("Sign up successful!");
    },
    onError: (error) => {
      alert(`Sign up failed: ${error.message}`);
    },
  });

  const [formData, setFormData] = useState<SignUpFormData>({
    email: "",
    password: "123123123",
    name: "",
  });
  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = signUpFormSchema.parse(formData);
      signUpMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        for (const err of error.errors) {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        }
        setErrors(fieldErrors as Partial<SignUpFormData>);
      }
    }
  };

  const populateWithFaker = () => {
    setFormData({
      email: faker.internet.email(),
      password: "123123123",
      name: faker.person.fullName(),
    });
    setErrors({});
  };

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 font-bold text-2xl">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="signup-name"
            className="block font-medium text-gray-700 text-sm"
          >
            Name
          </label>
          <input
            type="text"
            id="signup-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.name && (
            <p className="mt-1 text-red-600 text-sm">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="block font-medium text-gray-700 text-sm"
          >
            Email
          </label>
          <input
            type="email"
            id="signup-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.email && (
            <p className="mt-1 text-red-600 text-sm">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="block font-medium text-gray-700 text-sm"
          >
            Password
          </label>
          <input
            type="password"
            id="signup-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.password && (
            <p className="mt-1 text-red-600 text-sm">{errors.password}</p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={populateWithFaker}
            className="flex-1 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Populate with Faker
          </button>
          <button
            type="submit"
            className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}

function FormCreator() {
  const _queryClient = useQueryClient();
  const createFormMutation = useMutation({
    mutationFn: createForm,
    onSuccess: (data) => {
      alert(`Form created successfully! ID: ${data.formId}`);
    },
    onError: (error) => {
      alert(`Error creating form: ${error.message}`);
    },
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    config: {
      type: "Section" as const,
      collapsible: false,
      collapsedByDefault: false,
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFormMutation.mutate({
      title: formData.title,
      description: formData.description,
      config: formData.config,
    });
  };

  const populateWithFaker = () => {
    setFormData({
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      config: {
        type: "Section",
        collapsible: false,
        collapsedByDefault: false,
      },
    });
  };

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 font-bold text-2xl">Form Creator</h2>

      {/* Basic Form Creation */}
      <div className="mb-8">
        <h3 className="mb-4 font-semibold text-lg">Create Form</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="form-title"
              className="block font-medium text-gray-700 text-sm"
            >
              Title
            </label>
            <input
              type="text"
              id="form-title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="form-description"
              className="block font-medium text-gray-700 text-sm"
            >
              Description
            </label>
            <textarea
              id="form-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={populateWithFaker}
              className="flex-1 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Populate with Faker
            </button>
            <button
              type="submit"
              className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Create Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormsList() {
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
      alert("Form updated successfully!");
    },
    onError: (error) => {
      alert(`Error updating form: ${error.message}`);
    },
  });

  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [sections, setSections] = useState<Record<string, Section[]>>({});

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
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    onClick={() => alert(`View form: ${form.id}`)}
                  >
                    View
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
                    onClick={() => alert(`Edit form: ${form.id}`)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                    onClick={() => {
                      if (confirm(`Delete form "${form.title}"?`)) {
                        alert(`Delete form: ${form.id}`);
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
    </div>
  );
}

function SignInForm() {
  const queryClient = useQueryClient();
  const signInMutation = useMutation({
    mutationFn: handleSignIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      alert("Sign in successful!");
    },
    onError: (error) => {
      alert(`Sign in failed: ${error.message}`);
    },
  });

  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "123123",
  });
  const [errors, setErrors] = useState<Partial<SignInFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = signInFormSchema.parse(formData);
      signInMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        for (const err of error.errors) {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        }
        setErrors(fieldErrors as Partial<SignInFormData>);
      }
    }
  };

  const populateWithFaker = () => {
    setFormData({
      email: faker.internet.email(),
      password: "123123123",
    });
    setErrors({});
  };

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 font-bold text-2xl">Sign In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="signin-email"
            className="block font-medium text-gray-700 text-sm"
          >
            Email
          </label>
          <input
            type="email"
            id="signin-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.email && (
            <p className="mt-1 text-red-600 text-sm">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="signin-password"
            className="block font-medium text-gray-700 text-sm"
          >
            Password
          </label>
          <input
            type="password"
            id="signin-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.password && (
            <p className="mt-1 text-red-600 text-sm">{errors.password}</p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={populateWithFaker}
            className="flex-1 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Populate with Faker
          </button>
          <button
            type="submit"
            className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
}

function GroupForm() {
  const queryClient = useQueryClient();
  const createGroupMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      alert("Group created successfully!");
    },
    onError: (error) => {
      alert(`Error creating group: ${error.message}`);
    },
  });

  const [formData, setFormData] = useState<GroupFormData>({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Partial<GroupFormData>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = groupFormSchema.parse(formData);
      createGroupMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<GroupFormData> = {};
        for (const err of error.errors) {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof GroupFormData] = err.message;
          }
        }
        setErrors(fieldErrors);
      }
    }
  };

  const populateWithFaker = () => {
    setFormData({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
    });
    setErrors({});
  };

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 font-bold text-2xl">Group Form</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="groupName"
            className="block font-medium text-gray-700 text-sm"
          >
            Name
          </label>
          <input
            type="text"
            id="groupName"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.name && (
            <p className="mt-1 text-red-600 text-sm">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block font-medium text-gray-700 text-sm"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={populateWithFaker}
            className="flex-1 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Populate with Faker
          </button>
          <button
            type="submit"
            className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create Group
          </button>
        </div>
      </form>
    </div>
  );
}

export default function DevPage() {
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionLoading } = useSession();

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
  });

  const addMemberMutation = useMutation({
    mutationFn: addMemberToGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      alert("Member added successfully!");
    },
    onError: (error) => {
      alert(`Error adding member: ${error.message}`);
    },
  });

  const handleAddMember = (groupId: string, userId: string) => {
    addMemberMutation.mutate({ groupId, userId });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-center font-bold text-3xl">Dev Page</h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <SignUpForm />
          <SignInForm />
          <GroupForm />
          <FormCreator />
        </div>

        <div className="mt-12">
          <FormsList />
        </div>

        <div className="mt-12">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 font-bold text-2xl">Current Session</h2>
            {sessionLoading ? (
              <p>Loading session...</p>
            ) : session ? (
              <div className="space-y-2">
                <p>
                  <strong>Name:</strong> {session.user?.name}
                </p>
                <p>
                  <strong>Email:</strong> {session.user?.email}
                </p>
                <p>
                  <strong>ID:</strong> {session.user?.id}
                </p>
                <pre className="mt-4 overflow-auto rounded bg-gray-50 p-4 text-sm">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-gray-500">No active session</p>
            )}
          </div>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 font-bold text-2xl">Users</h2>
            {usersLoading ? (
              <p>Loading users...</p>
            ) : (
              <div className="space-y-2">
                {(usersData as ApiResponse<User>)?.users?.map((user: User) => (
                  <div key={user.id} className="rounded border p-2">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-gray-600 text-sm">{user.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 font-bold text-2xl">Groups</h2>
            {groupsLoading ? (
              <p>Loading groups...</p>
            ) : (
              <div className="space-y-4">
                {(groupsData as ApiResponse<Group>)?.groups?.map(
                  (group: Group) => (
                    <div key={group.id} className="rounded border p-4">
                      <h3 className="font-medium text-lg">{group.name}</h3>
                      <p className="mb-2 text-gray-600 text-sm">
                        {group.description}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Members: {group.size}
                      </p>

                      <div className="mt-4">
                        <h4 className="mb-2 font-medium text-sm">
                          Add Member:
                        </h4>
                        <div className="flex gap-2">
                          <select
                            title="Select a user to add to the group"
                            className="flex-1 rounded border px-2 py-1 text-sm"
                          >
                            <option value="">Select User</option>
                            {(usersData as ApiResponse<User>)?.users?.map(
                              (user: User) => (
                                <option key={user.id} value={user.id}>
                                  {user.name}
                                </option>
                              )
                            )}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const select = document.querySelector(
                                "select"
                              ) as HTMLSelectElement;
                              const userId = select.value;
                              if (userId) {
                                handleAddMember(group.id, userId);
                              }
                            }}
                            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
