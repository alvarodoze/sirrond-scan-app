"use client";

import {
  downloadExcelSingle,
  downloadJson,
} from "@/lib/export";
import type { WexReferralData } from "@/schema/wex-referral";

type Props = {
  data: WexReferralData;
  studentName?: string;
};

export function ExportButtons({ data, studentName }: Props) {
  const base =
    studentName?.replace(/\s+/g, "-").toLowerCase() || "wex-referral";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => downloadExcelSingle(data, `${base}.xlsx`)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
      >
        Download Excel
      </button>
      <button
        type="button"
        onClick={() => downloadJson(data, `${base}.json`)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
      >
        Download JSON
      </button>
    </div>
  );
}
