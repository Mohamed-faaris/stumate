"use client";

import { faker } from "@faker-js/faker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

// Group Form Schema
const groupFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type GroupFormData = z.infer<typeof groupFormSchema>;

const createGroup = async (groupData: GroupFormData) => {
  const response = await fetch("/api/test/group", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(groupData),
  });
  if (!response.ok) throw new Error("Failed to create group");
  return response.json();
};

export function GroupForm() {
  const queryClient = useQueryClient();
  const createGroupMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Group created successfully!");
    },
    onError: (error) => {
      toast.error(`Error creating group: ${error.message}`);
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
