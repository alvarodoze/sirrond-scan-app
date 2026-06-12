"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FieldEditor } from "@/components/FieldEditor";
import { ExportButtons } from "@/components/ExportButtons";
import { saveSubmission } from "@/lib/submissions-client";
import { useLocalStorage } from "@/lib/config";
import {
  REQUIRED_FIELDS,
  emptyWexReferralData,
  isFieldEmpty,
  type WexReferralData,
} from "@/schema/wex-referral";

export default function ReviewPage() {
  const [data, setData] = useState<WexReferralData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const localMode = useLocalStorage();

  useEffect(() => {
    const raw = sessionStorage.getItem("wex_review_data");
    if (!raw) {
      router.replace("/scan");
      return;
    }
    try {
      setData({ ...emptyWexReferralData(), ...JSON.parse(raw) });
    } catch {
      router.replace("/scan");
    }
  }, [router]);

  async function confirm() {
    if (!data) return;

    const missing = REQUIRED_FIELDS.filter((k) => isFieldEmpty(data[k]));
    if (missing.length > 0) {
      setError(`Please fill required fields: ${missing.join(", ")}`);
      return;
    }

    setSaving(true);
    setError("");

    try {
      await saveSubmission(data, "scan");
      sessionStorage.removeItem("wex_review_data");
      router.push("/history");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!data) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">Loading…</div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Review & confirm</h1>
        <p className="mt-1 text-sm text-slate-600">
          Check extracted fields. Red = required missing, yellow = empty.
        </p>
        {localMode && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Interim mode: saved on this device. Export to Excel or sync to Google
            Sheets until database is connected.
          </p>
        )}
      </div>

      <ExportButtons
        data={data}
        studentName={data.student_name as string | undefined}
      />

      <FieldEditor data={data} onChange={setData} />

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="sticky bottom-4 flex gap-3">
        <button
          onClick={() => router.push("/scan")}
          className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700"
        >
          Re-scan
        </button>
        <button
          onClick={confirm}
          disabled={saving}
          className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Confirm"}
        </button>
      </div>
    </div>
  );
}
