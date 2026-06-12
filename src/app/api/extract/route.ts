import { NextResponse } from "next/server";
import { isLocalStorageMode, isMistralConfigured } from "@/lib/config";
import { extractWexReferralFromImage } from "@/lib/mistral";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  if (!isLocalStorageMode()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isMistralConfigured()) {
    return NextResponse.json(
      { error: "MISTRAL_API_KEY not set in web/.env.local" },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("image");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large (max 10 MB)" }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  const mimeType = file.type || "image/jpeg";
  if (!allowed.some((t) => mimeType.startsWith(t.split("/")[0]))) {
    return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
  }

  // Image held in memory only — never written to disk or DB
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  try {
    const extracted = await extractWexReferralFromImage(base64, mimeType);
    // buffer/base64 discarded when handler returns
    return NextResponse.json({ data: extracted });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
