"use client";

import { useId, useState, useEffect } from "react";

type Props = {
  onCapture: (file: File) => void;
  disabled?: boolean;
  /** Change to reset preview after an error */
  resetKey?: string;
};

export function CameraCapture({ onCapture, disabled, resetKey }: Props) {
  const cameraId = useId();
  const libraryId = useId();
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (resetKey) {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
    }
    // Only reset when resetKey changes (e.g. new error message)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    onCapture(file);
  }

  function clearPreview() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  const inputClass =
    "absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed";

  return (
    <div className="space-y-4">
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Form preview"
          className="w-full rounded-2xl object-contain"
        />
      )}

      {!preview && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label
            htmlFor={cameraId}
            className={`relative flex min-h-[52px] items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white ${
              disabled ? "pointer-events-none opacity-50" : "cursor-pointer active:bg-blue-700"
            }`}
          >
            Take photo
            <input
              id={cameraId}
              type="file"
              accept="image/*"
              capture="environment"
              className={inputClass}
              onChange={handleChange}
              disabled={disabled}
            />
          </label>

          <label
            htmlFor={libraryId}
            className={`relative flex min-h-[52px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 ${
              disabled ? "pointer-events-none opacity-50" : "cursor-pointer active:bg-slate-50"
            }`}
          >
            Choose from photos
            <input
              id={libraryId}
              type="file"
              accept="image/*"
              className={inputClass}
              onChange={handleChange}
              disabled={disabled}
            />
          </label>
        </div>
      )}

      {preview && !disabled && (
        <button
          type="button"
          onClick={clearPreview}
          className="w-full rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-700"
        >
          Choose a different photo
        </button>
      )}
    </div>
  );
}
