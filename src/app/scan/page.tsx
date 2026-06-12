"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CameraCapture } from "@/components/CameraCapture";
import { StaffNotice } from "@/components/StaffNotice";
import { prepareImageForUpload } from "@/lib/image-upload";

type Step = "idle" | "processing" | "error";

export default function ScanPage() {
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");
  const [lastFile, setLastFile] = useState<File | null>(null);
  const router = useRouter();

  async function handleCapture(file: File) {
    setError("");
    setStep("processing");
    setLastFile(file);

    try {
      const prepared = await prepareImageForUpload(file);

      const formData = new FormData();
      formData.append("image", prepared);

      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      let json: { data?: unknown; error?: string };
      try {
        json = await res.json();
      } catch {
        throw new Error(`Server error (${res.status}). Check the dev server is running.`);
      }

      if (!res.ok) {
        throw new Error(json.error || `Extraction failed (${res.status})`);
      }

      sessionStorage.setItem("wex_review_data", JSON.stringify(json.data));
      router.push("/review");
    } catch (err) {
      setStep("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function retry() {
    if (lastFile) await handleCapture(lastFile);
  }

  return (
    <>
      <StaffNotice onAccepted={() => {}} />

      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Scan form</h1>
          <p className="mt-1 text-sm text-slate-600">
            Photograph the completed WEX referral form
          </p>
        </div>

        <CameraCapture
          onCapture={handleCapture}
          disabled={step === "processing"}
          resetKey={step === "error" ? error : step}
        />

        {step === "processing" && (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 py-4 text-sm font-medium text-blue-700">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            Reading form — this may take 10–20 seconds…
          </div>
        )}

        {step === "error" && error && (
          <div className="space-y-3 rounded-xl bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">Could not read the form</p>
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </>
  );
}
