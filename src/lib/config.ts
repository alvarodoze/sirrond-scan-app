/** True when Supabase URL and anon key are set to real values */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return (
    url.length > 0 &&
    key.length > 0 &&
    !url.includes("your-project") &&
    !key.includes("your-anon")
  );
}

/** Use browser localStorage instead of Supabase (interim before DB access) */
export function useLocalStorage(): boolean {
  return isLocalStorageMode();
}

/** Server + client: interim mode without Supabase */
export function isLocalStorageMode(): boolean {
  if (process.env.NEXT_PUBLIC_STORAGE_MODE === "local") return true;
  if (process.env.NEXT_PUBLIC_STORAGE_MODE === "supabase") return false;
  return !isSupabaseConfigured();
}

export function isMistralConfigured(): boolean {
  const key = process.env.MISTRAL_API_KEY ?? "";
  return key.length > 0 && !key.includes("your-mistral");
}

export function googleSheetsWebhookUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;
  if (!url || url.includes("your-script")) return null;
  return url;
}
