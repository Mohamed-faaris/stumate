"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { GetFormResponse } from "~/types/form";

interface GroupAttendance {
  groupId: string;
  groupName: string;
  totalAssigned: number;
  submitted: number;
  attendanceRatio: number;
}

const fetchForm = async (formId: string): Promise<GetFormResponse["form"]> => {
  const response = await fetch(`/api/form/${formId}`);
  if (!response.ok) throw new Error("Failed to fetch form");
  const data = await response.json();
  return data.form || data;
};

const fetchGroupAttendance = async (
  formId: string
): Promise<GroupAttendance[]> => {
  const response = await fetch(`/api/form/${formId}/attendance-temp`);
  if (!response.ok) throw new Error("Failed to fetch attendance data");
  const data = await response.json();
  return data.groupAttendance || [];
};

export default function FormDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  const {
    data: form,
    isLoading: formLoading,
    error: formError,
  } = useQuery({
    queryKey: ["form", formId],
    queryFn: () => fetchForm(formId),
  });

  const {
    data: groupAttendance = [],
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useQuery({
    queryKey: ["formAttendance", formId],
    queryFn: () => fetchGroupAttendance(formId),
  });

  const isLoading = formLoading || attendanceLoading;

  if (isLoading) return <p className="p-8 text-gray-600">Loading details...</p>;
  if (formError || !form)
    return <p className="p-8 text-red-600">Error loading form</p>;

  const totalUsers = groupAttendance.reduce(
    (sum, g) => sum + g.totalAssigned,
    0
  );
  const totalSubmitted = groupAttendance.reduce(
    (sum, g) => sum + g.submitted,
    0
  );
  const overallAttendanceRatio =
    totalUsers > 0 ? (totalSubmitted / totalUsers) * 100 : 0;

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">{form.title}</h1>
          <p className="text-gray-600">{form.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push(`/t/admin-dashboard/edit/${formId}`)}
          >
            Edit Form
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-gray-600 text-sm">Total Users Assigned</p>
          <p className="mt-2 font-bold text-2xl">{totalUsers}</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-600 text-sm">Total Submitted</p>
          <p className="mt-2 font-bold text-2xl">{totalSubmitted}</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-600 text-sm">Overall Attendance Ratio</p>
          <p className="mt-2 font-bold text-2xl">
            {overallAttendanceRatio.toFixed(1)}%
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-600 text-sm">Assigned Groups</p>
          <p className="mt-2 font-bold text-2xl">{groupAttendance.length}</p>
        </Card>
      </div>

      {/* Form Details */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-xl">Form Information</h2>
        <div className="space-y-3">
          <div>
            <p className="text-gray-600 text-sm">Created At</p>
            <p className="font-medium">
              {new Date(form.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Last Updated</p>
            <p className="font-medium">
              {new Date(form.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Total Sections</p>
            <p className="font-medium">{form.formSections?.length || 0}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Total Questions</p>
            <p className="font-medium">
              {form.formSections?.reduce(
                (sum, s) => sum + (s.formQuestions?.length || 0),
                0
              ) || 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Group Attendance Table */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-xl">
          Assigned Groups Attendance
        </h2>

        {groupAttendance.length === 0 ? (
          <p className="text-gray-600 text-center">No groups assigned yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-sm">
                    Group Name
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-sm">
                    Total Assigned
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-sm">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-sm">
                    Pending
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-sm">
                    Attendance Ratio
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupAttendance.map((group) => {
                  const pending = group.totalAssigned - group.submitted;
                  const ratioPercentage = (group.attendanceRatio * 100).toFixed(
                    1
                  );
                  const ratioColor =
                    group.attendanceRatio >= 0.8
                      ? "bg-green-100 text-green-800"
                      : group.attendanceRatio >= 0.5
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800";

                  return (
                    <tr
                      key={group.groupId}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{group.groupName}</td>
                      <td className="px-4 py-3 text-center">
                        {group.totalAssigned}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="default" className="bg-green-600">
                          {group.submitted}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className="text-orange-600">
                          {pending}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={ratioColor}>{ratioPercentage}%</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Sections Preview */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-xl">Form Sections</h2>
        {form.formSections?.length === 0 ? (
          <p className="text-gray-600">No sections yet</p>
        ) : (
          <div className="space-y-4">
            {form.formSections?.map((section) => (
              <div
                key={section.id}
                className="rounded border border-gray-200 p-4"
              >
                <h3 className="font-medium">{section.title}</h3>
                <p className="text-gray-600 text-sm">{section.description}</p>
                <p className="mt-2 text-gray-500 text-xs">
                  {section.formQuestions?.length || 0} question(s)
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
