"use client";

import { useEffect, useState } from "react";
import { env } from "~/env";
import type { GetFormResponse } from "~/types/form";
import FormDisplay from "~/components/dev/form/FormDisplay";

export default function FormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const [formId, setFormId] = useState<string>("");
  const [form, setForm] = useState<GetFormResponse["form"]>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    params.then((p) => setFormId(p.formId));
  }, [params]);

  useEffect(() => {
    if (!formId) return;

    const fetchForm = async () => {
      try {
        const result = (await fetch(
          `${env.NEXT_PUBLIC_API_URL}/form/${formId}`,
          {
            cache: "no-store",
          }
        ).then((res) => res.json())) as GetFormResponse;

        if (!result.success) {
          setError("Form not found");
          return;
        }

        setForm(result.form);
      } catch (err) {
        setError("Failed to load form");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!form) return <div className="p-4">Form not found</div>;

  return (
    <div className="p-8">
      <FormDisplay form={form} />
    </div>
  );
}
