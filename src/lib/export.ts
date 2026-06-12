import * as XLSX from "xlsx";
import {
  WEX_REFERRAL_SCHEMA,
  WEX_REFERRAL_FIELD_KEYS,
  type WexReferralData,
} from "@/schema/wex-referral";
import type { Submission } from "@/lib/local-submissions";

function formatValue(value: string | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

/** Sanitize for Excel / Google Sheets tab names (max 31 chars) */
export function sanitizeSheetName(
  name: string,
  existing: Set<string> = new Set()
): string {
  let base = name.replace(/[:\\/?*[\]]/g, "").trim() || "Unknown";
  if (base.length > 31) base = base.slice(0, 31);

  let candidate = base;
  let n = 2;
  while (existing.has(candidate)) {
    const suffix = ` (${n})`;
    candidate = base.slice(0, Math.max(1, 31 - suffix.length)) + suffix;
    n++;
  }
  existing.add(candidate);
  return candidate;
}

function personSheetName(data: WexReferralData): string {
  const name = data.student_name;
  return typeof name === "string" && name.trim() ? name.trim() : "Unknown";
}

/**
 * One person tab: column A = field label, column B = value.
 * Order: Submitted at, Source, then all form fields.
 */
export function dataToPersonSheetRows(
  data: WexReferralData,
  meta: { source: string; created_at: string }
): string[][] {
  return [
    ["Field", "Value"],
    ["Submitted at", meta.created_at],
    ["Source", meta.source],
    ...WEX_REFERRAL_FIELD_KEYS.map((key) => [
      WEX_REFERRAL_SCHEMA[key].label,
      formatValue(data[key]),
    ]),
  ];
}

export function buildGoogleSheetPayload(
  data: WexReferralData,
  meta: { source: string; created_at: string }
) {
  return {
    sheetName: personSheetName(data),
    rows: dataToPersonSheetRows(data, meta),
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJson(data: WexReferralData, filename = "wex-referral.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, filename);
}

function addPersonSheetToWorkbook(
  wb: XLSX.WorkBook,
  data: WexReferralData,
  meta: { source: string; created_at: string },
  usedNames: Set<string>
) {
  const sheetName = sanitizeSheetName(personSheetName(data), usedNames);
  const rows = dataToPersonSheetRows(data, meta);
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 28 }, { wch: 48 }];
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
}

/** Single person as .xlsx — one tab named after the student */
export function downloadExcelSingle(
  data: WexReferralData,
  filename?: string,
  meta?: { source: string; created_at: string }
) {
  const wb = XLSX.utils.book_new();
  const usedNames = new Set<string>();
  addPersonSheetToWorkbook(
    wb,
    data,
    meta ?? {
      source: "export",
      created_at: new Date().toLocaleString("en-GB"),
    },
    usedNames
  );
  const safeName =
    personSheetName(data).replace(/\s+/g, "-").toLowerCase() || "wex-referral";
  XLSX.writeFile(wb, filename ?? `${safeName}.xlsx`);
}

/** All submissions — one tab per person */
export function downloadExcelAll(
  items: Submission[],
  filename = "wex-referrals-export.xlsx"
) {
  const wb = XLSX.utils.book_new();
  const usedNames = new Set<string>();

  for (const item of items) {
    addPersonSheetToWorkbook(
      wb,
      item.extracted_json,
      {
        source: item.source,
        created_at: new Date(item.created_at).toLocaleString("en-GB"),
      },
      usedNames
    );
  }

  if (items.length === 0) {
    const ws = XLSX.utils.aoa_to_sheet([["Field", "Value"], ["Note", "No submissions"]]);
    XLSX.utils.book_append_sheet(wb, ws, "Empty");
  }

  XLSX.writeFile(wb, filename);
}

/** Create a new tab per person in the linked Google Spreadsheet */
export async function pushToGoogleSheet(
  data: WexReferralData,
  meta: { source: string; created_at: string },
  webhookUrl: string
): Promise<void> {
  const payload = buildGoogleSheetPayload(data, meta);
  const res = await fetch(webhookUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.type === "opaque") return;
  if (!res.ok) {
    throw new Error("Google Sheet sync failed");
  }
}
