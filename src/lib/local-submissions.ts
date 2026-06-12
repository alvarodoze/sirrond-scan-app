import type { WexReferralData } from "@/schema/wex-referral";

export type Submission = {
  id: string;
  created_at: string;
  confirmed_at: string | null;
  source: "scan" | "digital";
  reviewed: boolean;
  extracted_json: WexReferralData;
};

const STORAGE_KEY = "sirrond_submissions";

function readAll(): Submission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Submission[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: Submission[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listLocalSubmissions(query?: string): Submission[] {
  let items = readAll().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (query?.trim()) {
    const q = query.trim().toLowerCase();
    items = items.filter((item) => {
      const j = item.extracted_json;
      const match = (v: string | boolean | null | undefined) =>
        typeof v === "string" && v.toLowerCase().includes(q);
      return match(j.student_name) || match(j.school) || match(j.referral_number);
    });
  }

  return items;
}

export function saveLocalSubmission(
  extracted_json: WexReferralData,
  source: "scan" | "digital"
): Submission {
  const now = new Date().toISOString();
  const item: Submission = {
    id: crypto.randomUUID(),
    created_at: now,
    confirmed_at: now,
    source,
    reviewed: true,
    extracted_json,
  };
  writeAll([item, ...readAll()]);
  return item;
}
