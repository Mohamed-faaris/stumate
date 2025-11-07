"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
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
  forms?: T[];
}

const fetchGroups = async () => {
  const response = await fetch("/api/test/group");
  if (!response.ok) throw new Error("Failed to fetch groups");
  return response.json();
};

const fetchUsers = async () => {
  const response = await fetch("/api/test/user");
  if (!response.ok) throw new Error("Failed to fetch users");
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

export function GroupsList() {
  const queryClient = useQueryClient();
  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
  });

  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
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
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 font-bold text-2xl">Groups</h2>
      {groupsLoading ? (
        <p>Loading groups...</p>
      ) : (
        <div className="space-y-4">
          {(groupsData as ApiResponse<Group>)?.groups?.map((group: Group) => (
            <div key={group.id} className="rounded border p-4">
              <h3 className="font-medium text-lg">{group.name}</h3>
              <p className="mb-2 text-gray-600 text-sm">{group.description}</p>
              <p className="text-gray-500 text-xs">Members: {group.size}</p>

              <div className="mt-4">
                <h4 className="mb-2 font-medium text-sm">Add Member:</h4>
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
          ))}
        </div>
      )}
    </div>
  );
}
