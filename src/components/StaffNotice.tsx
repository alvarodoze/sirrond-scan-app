"use client";

import { useEffect, useState } from "react";
import { useLocalStorage } from "@/lib/config";

const CONSENT_KEY = "sirrond_staff_consent";

export function StaffNotice({ onAccepted }: { onAccepted: () => void }) {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const localMode = useLocalStorage();

  useEffect(() => {
    if (localMode) {
      setVisible(!localStorage.getItem(CONSENT_KEY));
      setLoading(false);
      return;
    }

    fetch("/api/consent")
      .then((r) => r.json())
      .then((d) => {
        setVisible(!d.accepted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [localMode]);

  async function accept() {
    if (localMode) {
      localStorage.setItem(CONSENT_KEY, new Date().toISOString());
    } else {
      await fetch("/api/consent", { method: "POST" });
    }
    setVisible(false);
    onAccepted();
  }

  if (loading || !visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900">Staff notice</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          You are digitising personal data about students. Only scan or enter
          forms you are authorised to process. Data is retained for 12 months
          when stored in the database, then automatically deleted. Images are
          not stored — only the extracted fields you confirm.
        </p>
        <button
          onClick={accept}
          className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white"
        >
          I understand — continue
        </button>
      </div>
    </div>
  );
}
