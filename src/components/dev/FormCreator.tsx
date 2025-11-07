"use client";

import { faker } from "@faker-js/faker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

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

export function FormCreator() {
  const queryClient = useQueryClient();
  const createFormMutation = useMutation({
    mutationFn: createForm,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success(`Form created successfully! ID: ${data.formId}`);
    },
    onError: (error) => {
      toast.error(`Error creating form: ${error.message}`);
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
