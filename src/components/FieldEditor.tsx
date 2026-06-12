"use client";

import {
  WEX_REFERRAL_SCHEMA,
  WEX_REFERRAL_FIELD_KEYS,
  REQUIRED_FIELDS,
  isFieldEmpty,
  type WexReferralData,
  type WexReferralField,
} from "@/schema/wex-referral";

type Props = {
  data: WexReferralData;
  onChange: (data: WexReferralData) => void;
};

function fieldHighlight(
  key: WexReferralField,
  value: string | boolean | null
): string {
  if (REQUIRED_FIELDS.includes(key) && isFieldEmpty(value)) {
    return "border-red-300 bg-red-50";
  }
  if (isFieldEmpty(value)) {
    return "border-amber-200 bg-amber-50";
  }
  return "border-slate-200 bg-white";
}

export function FieldEditor({ data, onChange }: Props) {
  function update(key: WexReferralField, value: string | boolean | null) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="space-y-3">
      {WEX_REFERRAL_FIELD_KEYS.map((key) => {
        const def = WEX_REFERRAL_SCHEMA[key];
        const value = data[key];
        const highlight = fieldHighlight(key, value);

        if (def.type === "boolean") {
          return (
            <label
              key={key}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 ${highlight}`}
            >
              <span className="text-sm font-medium text-slate-700">
                {def.label}
                {REQUIRED_FIELDS.includes(key) && (
                  <span className="text-red-500"> *</span>
                )}
              </span>
              <select
                value={
                  value === true ? "yes" : value === false ? "no" : "empty"
                }
                onChange={(e) => {
                  const v = e.target.value;
                  update(
                    key,
                    v === "yes" ? true : v === "no" ? false : null
                  );
                }}
                className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
              >
                <option value="empty">—</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
          );
        }

        const isTextarea = def.type === "text";

        return (
          <div key={key} className={`rounded-xl border px-4 py-3 ${highlight}`}>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {def.label}
              {REQUIRED_FIELDS.includes(key) && (
                <span className="text-red-500"> *</span>
              )}
            </label>
            {isTextarea ? (
              <textarea
                value={(value as string) ?? ""}
                onChange={(e) => update(key, e.target.value || null)}
                rows={4}
                className="w-full resize-none bg-transparent text-sm text-slate-900 outline-none"
              />
            ) : (
              <input
                type={def.type === "date" ? "text" : "text"}
                value={(value as string) ?? ""}
                onChange={(e) => update(key, e.target.value || null)}
                placeholder={def.type === "date" ? "DD/MM/YYYY" : ""}
                className="w-full bg-transparent text-sm text-slate-900 outline-none"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
