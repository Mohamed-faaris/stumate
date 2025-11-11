"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface Form {
  id: string;
  title: string;
  description: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  size: number;
}

interface ApiResponse<T> {
  success: boolean;
  forms?: T[];
  groups?: T[];
  groupIds?: string[];
}

const fetchForms = async () => {
  const response = await fetch("/api/form");
  if (!response.ok) throw new Error("Failed to fetch forms");
  return response.json();
};

const fetchGroups = async () => {
  const response = await fetch("/api/test/group");
  if (!response.ok) throw new Error("Failed to fetch groups");
  return response.json();
};

const fetchAssignments = async (formId: string) => {
  const response = await fetch(`/api/form/assignment?formId=${formId}`);
  if (!response.ok) throw new Error("Failed to fetch assignments");
  return response.json();
};

const createAssignments = async (data: {
  formId: string;
  groupIds: string[];
}) => {
  const response = await fetch("/api/form/assignment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create assignments");
  return response.json();
};

export function AssignmentCreator() {
  const queryClient = useQueryClient();
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    new Set()
  );

  const { data: formsData, isLoading: formsLoading } = useQuery({
    queryKey: ["forms"],
    queryFn: fetchForms,
  });

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
  });

  const { data: assignmentsData } = useQuery({
    queryKey: ["assignments", selectedFormId],
    queryFn: () => fetchAssignments(selectedFormId),
    enabled: !!selectedFormId,
  });

  const assignmentMutation = useMutation({
    mutationFn: createAssignments,
    onSuccess: (data) => {
      toast.success(data.message || "Assignments created successfully!");
      queryClient.invalidateQueries({
        queryKey: ["assignments", selectedFormId],
      });
      setSelectedGroupIds(new Set());
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleFormChange = (formId: string) => {
    setSelectedFormId(formId);
    setSelectedGroupIds(new Set());
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
    if (!selectedFormId) {
      toast.error("Please select a form");
      return;
    }
    if (selectedGroupIds.size === 0) {
      toast.error("Please select at least one group");
      return;
    }
    assignmentMutation.mutate({
      formId: selectedFormId,
      groupIds: Array.from(selectedGroupIds),
    });
  };

  const currentAssignedGroupIds = new Set(
    (assignmentsData as ApiResponse<never>)?.groupIds || []
  );

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 font-bold text-2xl">Assign Forms to Groups</h2>

      {/* Form Selection */}
      <div className="mb-8">
        <h3 className="mb-4 font-semibold text-lg">Select Form</h3>
        <div className="space-y-3">
          {formsLoading ? (
            <p className="text-gray-600">Loading forms...</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              {(formsData as ApiResponse<Form>)?.forms?.map((form: Form) => (
                <label
                  key={form.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                    selectedFormId === form.id
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="form"
                    value={form.id}
                    checked={selectedFormId === form.id}
                    onChange={(e) => handleFormChange(e.target.value)}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{form.title}</p>
                    <p className="text-gray-600 text-xs">{form.description}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Group Selection */}
      {selectedFormId && (
        <div className="mb-8">
          <h3 className="mb-4 font-semibold text-lg">
            Select Groups to Assign
          </h3>
          <div className="space-y-3">
            {groupsLoading ? (
              <p className="text-gray-600">Loading groups...</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {(groupsData as ApiResponse<Group>)?.groups?.map(
                  (group: Group) => {
                    const isAssigned = currentAssignedGroupIds.has(group.id);
                    const isSelected = selectedGroupIds.has(group.id);
                    return (
                      <label
                        key={group.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-gray-300 hover:border-indigo-400"
                        } ${isAssigned ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-center pt-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleGroupToggle(group.id)}
                            disabled={isAssigned && !isSelected}
                            className="h-4 w-4 accent-indigo-600"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {group.name}
                          </p>
                          <p className="text-gray-600 text-xs">
                            {group.description}
                          </p>
                          <p className="mt-1 text-gray-500 text-xs">
                            Members: {group.size}
                            {isAssigned && !isSelected && " (Already assigned)"}
                          </p>
                        </div>
                      </label>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary and Submit */}
      {selectedFormId && (
        <div className="space-y-4 rounded-lg bg-gray-50 p-4">
          <div className="text-gray-600 text-sm">
            <p>
              <strong>Selected Form:</strong>{" "}
              {
                (formsData as ApiResponse<Form>)?.forms?.find(
                  (f: Form) => f.id === selectedFormId
                )?.title
              }
            </p>
            <p>
              <strong>Groups to Assign:</strong> {selectedGroupIds.size}{" "}
              {selectedGroupIds.size === 1 ? "group" : "groups"}
            </p>
            {selectedGroupIds.size > 0 && (
              <div className="mt-2 space-y-1">
                {Array.from(selectedGroupIds).map((groupId) => {
                  const group = (
                    groupsData as ApiResponse<Group>
                  )?.groups?.find((g: Group) => g.id === groupId);
                  return (
                    <p key={groupId} className="text-gray-700 text-xs">
                      • {group?.name}
                    </p>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              !selectedFormId ||
              selectedGroupIds.size === 0 ||
              assignmentMutation.isPending
            }
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {assignmentMutation.isPending
              ? "Assigning..."
              : "Assign to Selected Groups"}
          </button>
        </div>
      )}
    </div>
  );
}
