"use client";

import { useCallback, useEffect, useState } from "react";
import { downloadExcelAll } from "@/lib/export";
import { listSubmissions } from "@/lib/submissions-client";
import { useLocalStorage } from "@/lib/config";
import type { Submission } from "@/lib/local-submissions";

export default function HistoryPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const localMode = useLocalStorage();

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    setError("");
    try {
      setItems(await listSubmissions(q));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load(query);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">History</h1>
          <p className="mt-1 text-sm text-slate-600">
            {localMode ? "Saved on this device" : "Past submissions"}
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() =>
              downloadExcelAll(
                items,
                `wex-referrals-${new Date().toISOString().slice(0, 10)}.xlsx`
              )
            }
            className="shrink-0 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white"
          >
            Export all Excel
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="search"
          placeholder="Search name, school, referral no…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
        >
          Search
        </button>
      </form>

      {loading && (
        <p className="text-center text-sm text-slate-500">Loading…</p>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && items.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500">
          No submissions yet
        </p>
      )}

      <ul className="space-y-3">
        {items.map((item) => {
          const j = item.extracted_json;
          return (
            <li
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">
                    {j.student_name || "Unnamed"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {j.school} · {j.tutor_group || "—"}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.source === "scan"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {item.source}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {new Date(item.created_at).toLocaleString("en-GB")}
                {j.referral_number && ` · Ref ${j.referral_number}`}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
