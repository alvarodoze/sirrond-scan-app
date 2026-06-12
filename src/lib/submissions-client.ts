import { googleSheetsWebhookUrl, useLocalStorage } from "@/lib/config";
import {
  listLocalSubmissions,
  saveLocalSubmission,
  type Submission,
} from "@/lib/local-submissions";
import { pushToGoogleSheet } from "@/lib/export";
import type { WexReferralData } from "@/schema/wex-referral";

export async function listSubmissions(query?: string): Promise<Submission[]> {
  if (useLocalStorage()) {
    return listLocalSubmissions(query);
  }

  const url = query
    ? `/api/submissions?q=${encodeURIComponent(query)}`
    : "/api/submissions";
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to load");
  return json.data ?? [];
}

export async function saveSubmission(
  extracted_json: WexReferralData,
  source: "scan" | "digital"
): Promise<{ id: string }> {
  const sheetsUrl = googleSheetsWebhookUrl();
  const now = new Date().toISOString();

  if (useLocalStorage()) {
    const item = saveLocalSubmission(extracted_json, source);
    if (sheetsUrl) {
      try {
        await pushToGoogleSheet(extracted_json, { source, created_at: now }, sheetsUrl);
      } catch {
        // local save succeeded; sheet sync is best-effort
      }
    }
    return { id: item.id };
  }

  const res = await fetch("/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ extracted_json, source }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Save failed");

  if (sheetsUrl) {
    try {
      await pushToGoogleSheet(extracted_json, { source, created_at: now }, sheetsUrl);
    } catch {
      // DB save succeeded
    }
  }

  return { id: json.id };
}
