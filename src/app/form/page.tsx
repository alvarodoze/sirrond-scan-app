"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FieldEditor } from "@/components/FieldEditor";
import { ExportButtons } from "@/components/ExportButtons";
import { StaffNotice } from "@/components/StaffNotice";
import { saveSubmission } from "@/lib/submissions-client";
import { useLocalStorage } from "@/lib/config";
import {
  REQUIRED_FIELDS,
  emptyWexReferralData,
  isFieldEmpty,
  type WexReferralData,
} from "@/schema/wex-referral";

export default function DigitalFormPage() {
  const [data, setData] = useState<WexReferralData>(emptyWexReferralData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const localMode = useLocalStorage();

  async function submit() {
    const missing = REQUIRED_FIELDS.filter((k) => isFieldEmpty(data[k]));
    if (missing.length > 0) {
      setError(`Please fill required fields: ${missing.join(", ")}`);
      return;
    }

    setSaving(true);
    setError("");

    try {
      await saveSubmission(data, "digital");
      router.push("/history");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <StaffNotice onAccepted={() => {}} />

      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Digital form</h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter WEX referral details directly
          </p>
          {localMode && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Interim mode: data stays on this device until Supabase is connected.
            </p>
          )}
        </div>

        <ExportButtons data={data} studentName={data.student_name as string} />

        <FieldEditor data={data} onChange={setData} />

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={saving}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Submitting…" : "Submit form"}
        </button>
      </div>
    </>
  );
}
