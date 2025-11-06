"use client";

import { faker } from "@faker-js/faker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";

// Group Form Schema
const groupFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type GroupFormData = z.infer<typeof groupFormSchema>;

// Types
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

interface ApiResponse<T> {
  success: boolean;
  users?: T[];
  groups?: T[];
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

const createGroup = async (groupData: GroupFormData) => {
  const response = await fetch("/api/test/group", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(groupData),
  });
  if (!response.ok) throw new Error("Failed to create group");
  return response.json();
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
        <div className="grid gap-8 md:grid-cols-2">
          <GroupForm />
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
