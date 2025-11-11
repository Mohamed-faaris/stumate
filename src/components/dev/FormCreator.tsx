"use client";

import { faker } from "@faker-js/faker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

const assignFormToGroups = async (data: {
  formId: string;
  groupIds: string[];
}) => {
  const response = await fetch("/api/form/assignment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to assign form to groups");
  return response.json();
};

export function FormCreator() {
  const queryClient = useQueryClient();
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    new Set()
  );
  const [isCreatingForm, setIsCreatingForm] = useState(false);

  const createFormMutation = useMutation({
    mutationFn: createForm,
    onSuccess: async (data) => {
      // If groups are selected, assign the form to them
      if (selectedGroupIds.size > 0) {
        try {
          await assignFormToGroups({
            formId: data.formId,
            groupIds: Array.from(selectedGroupIds),
          });
          toast.success(
            `Form created and assigned to ${selectedGroupIds.size} group(s)!`
          );
        } catch {
          toast.warning(
            `Form created but failed to assign to groups. Form ID: ${data.formId}`
          );
        }
      } else {
        toast.success(`Form created successfully! ID: ${data.formId}`);
      }
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setFormData({
        title: "",
        description: "",
        config: {
          type: "Section" as const,
          collapsible: false,
          collapsedByDefault: false,
        },
      });
      setSelectedGroupIds(new Set());
      setIsCreatingForm(false);
    },
    onError: (error) => {
      toast.error(`Error creating form: ${error.message}`);
      setIsCreatingForm(false);
    },
  });

  const groupsQuery = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await fetch("/api/test/group");
      if (!response.ok) throw new Error("Failed to fetch groups");
      return response.json();
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

  const handleGroupToggle = (groupId: string) => {
    const newSet = new Set(selectedGroupIds);
    if (newSet.has(groupId)) {
      newSet.delete(groupId);
    } else {
      newSet.add(groupId);
    }
    setSelectedGroupIds(newSet);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a form title");
      return;
    }
    setIsCreatingForm(true);
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
              disabled={isCreatingForm}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-400"
            >
              {isCreatingForm ? "Creating..." : "Create Form"}
            </button>
          </div>
        </form>
      </div>

      {/* Group Assignment */}
      <div className="mb-8">
        <h3 className="mb-4 font-semibold text-lg">
          Assign to Groups (Optional)
        </h3>
        {groupsQuery.isLoading ? (
          <p className="text-gray-600">Loading groups...</p>
        ) : groupsQuery.isError ? (
          <p className="text-red-600">Failed to load groups</p>
        ) : (
          <div className="space-y-2">
            {groupsQuery.data?.groups?.length === 0 ? (
              <p className="text-gray-600 text-sm">No groups available</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {groupsQuery.data?.groups?.map(
                  (group: { id: string; name: string; size: number }) => (
                    <label
                      key={group.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all ${
                        selectedGroupIds.has(group.id)
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-300 hover:border-indigo-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedGroupIds.has(group.id)}
                        onChange={() => handleGroupToggle(group.id)}
                        className="h-4 w-4 accent-indigo-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {group.name}
                        </p>
                        <p className="text-gray-600 text-xs">
                          Members: {group.size}
                        </p>
                      </div>
                    </label>
                  )
                )}
              </div>
            )}
            {selectedGroupIds.size > 0 && (
              <p className="font-medium text-indigo-600 text-sm">
                Will assign to {selectedGroupIds.size}{" "}
                {selectedGroupIds.size === 1 ? "group" : "groups"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
